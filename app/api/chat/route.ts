import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getSystemPrompt } from "@/lib/soul";
import { extractPII, sanitizeForLLM } from "@/lib/pii";
import { extractUnknownQuestion } from "@/lib/guardrails";
import { notify } from "@/lib/telegram";
import { db, id, tx } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.messages?.length) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  const { messages, sessionId: incomingSessionId, metadata } = body;
  const sessionId = incomingSessionId || crypto.randomUUID();

  // Store PII directly in DB — never send to LLM
  const pii = extractPII(messages);
  if (metadata?.email) pii.email = metadata.email;
  if (metadata?.socials) {
    if (metadata.socials.linkedin) pii.linkedin = metadata.socials.linkedin;
    if (metadata.socials.twitter) pii.twitter = metadata.socials.twitter;
    if (metadata.socials.instagram) pii.instagram = metadata.socials.instagram;
    if (metadata.socials.github) pii.github = metadata.socials.github;
  }

  if (pii.email || pii.linkedin || pii.twitter || pii.instagram || pii.github) {
    await db.transact(
      tx.visitorProfiles[id()].update({
        sessionId,
        ...pii,
        additionalInfo: pii.additionalLinks.length ? pii.additionalLinks : undefined,
        createdAt: Date.now(),
      })
    );
  }

  // Sanitize messages — replace PII with placeholders
  const sanitized = sanitizeForLLM(messages, pii);

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: getSystemPrompt(),
    messages: sanitized.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
    temperature: 0.3,
    maxOutputTokens: 500,
    onFinish: async ({ text }) => {
      // Log every message exchange
      await db.transact(
        tx.conversations[id()].update({
          sessionId,
          messages: JSON.stringify(messages),
          lastResponse: text,
          visitorAgent: req.headers.get("user-agent") || "unknown",
          status: "active",
          hasUnknownQuestion: !!extractUnknownQuestion(text),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      );

      // Handle unknown questions
      const question = extractUnknownQuestion(text);
      if (question) {
        await db.transact(
          tx.unknownQuestions[id()].update({
            question,
            context: JSON.stringify(messages.slice(-3)),
            status: "pending",
            sessionId,
            createdAt: Date.now(),
          })
        );
        await notify(
          `<b>Unknown Q on psychopats.ai</b>\n\n${question}\n\nSession: ${sessionId}`
        );
      }
    },
  });

  const response = result.toTextStreamResponse();
  response.headers.set("X-Session-Id", sessionId);
  return response;
}
