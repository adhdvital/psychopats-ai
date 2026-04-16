import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { getSystemPrompt } from "@/lib/soul";
import { extractPII, sanitizeForLLM, buildSocialHint } from "@/lib/pii";
import { extractUnknownQuestion } from "@/lib/guardrails";
import { notify } from "@/lib/telegram";
import { db, id, tx } from "@/lib/db";

const MARKER_OPEN = "[UNKNOWN_QUESTION:";
const MARKER_REGEX = /\[UNKNOWN_QUESTION:[^\]]*\]?/g;

function buildMarkerStripper(): TransformStream<Uint8Array, Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  let inMarker = false;
  const SAFETY = MARKER_OPEN.length + 8;

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });

      if (inMarker) {
        const close = buffer.indexOf("]");
        if (close === -1) {
          buffer = "";
          return;
        }
        buffer = buffer.slice(close + 1);
        inMarker = false;
      }

      const open = buffer.indexOf(MARKER_OPEN);
      if (open !== -1) {
        const before = buffer.slice(0, open);
        if (before) controller.enqueue(encoder.encode(before));
        const rest = buffer.slice(open + MARKER_OPEN.length);
        const close = rest.indexOf("]");
        if (close === -1) {
          inMarker = true;
          buffer = "";
        } else {
          buffer = rest.slice(close + 1);
        }
        return;
      }

      if (buffer.length > SAFETY) {
        const safe = buffer.slice(0, -SAFETY);
        controller.enqueue(encoder.encode(safe));
        buffer = buffer.slice(-SAFETY);
      }
    },
    flush(controller) {
      if (!buffer) return;
      const cleaned = buffer.replace(MARKER_REGEX, "").trim();
      if (cleaned) controller.enqueue(encoder.encode(cleaned));
    },
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.messages?.length) {
    return Response.json({ error: "messages required" }, { status: 400 });
  }

  const { messages, sessionId: incomingSessionId, metadata } = body;
  const sessionId = incomingSessionId || crypto.randomUUID();

  const pii = extractPII(messages);
  if (metadata?.email) pii.email = metadata.email;
  if (metadata?.socials) {
    if (metadata.socials.linkedin) pii.linkedin = metadata.socials.linkedin;
    if (metadata.socials.twitter) pii.twitter = metadata.socials.twitter;
    if (metadata.socials.instagram) pii.instagram = metadata.socials.instagram;
    if (metadata.socials.github) pii.github = metadata.socials.github;
  }

  if (pii.email || pii.linkedin || pii.twitter || pii.instagram || pii.github) {
    try {
      const existing = await db.query({
        visitorProfiles: { $: { where: { sessionId } } },
      });
      const profileId = existing.visitorProfiles[0]?.id ?? id();
      await db.transact(
        tx.visitorProfiles[profileId].update({
          sessionId,
          ...(pii.email && { email: pii.email }),
          ...(pii.linkedin && { linkedin: pii.linkedin }),
          ...(pii.twitter && { twitter: pii.twitter }),
          ...(pii.instagram && { instagram: pii.instagram }),
          ...(pii.github && { github: pii.github }),
          ...(pii.additionalLinks.length && { additionalInfo: pii.additionalLinks }),
          createdAt: Date.now(),
        })
      );
    } catch (err) {
      console.error("visitorProfile upsert failed:", err);
    }
  }

  const sanitized = sanitizeForLLM(messages, pii);
  const systemPrompt = `${getSystemPrompt()}\n\n<RUNTIME_STATE>\n${buildSocialHint(pii)}\n</RUNTIME_STATE>`;

  try {
  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: systemPrompt,
    messages: sanitized.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    temperature: 0.3,
    onFinish: async ({ text }) => {
      const question = extractUnknownQuestion(text);
      const cleanedText = text.replace(MARKER_REGEX, "").trim();

      await db.transact(
        tx.conversations[id()].update({
          sessionId,
          messages: JSON.stringify(messages),
          lastResponse: cleanedText,
          visitorAgent: req.headers.get("user-agent") || "unknown",
          status: "active",
          hasUnknownQuestion: !!question,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
      );

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

  const baseResponse = result.toTextStreamResponse();
  const stripped = baseResponse.body!.pipeThrough(buildMarkerStripper());
  const response = new Response(stripped, {
    status: baseResponse.status,
    headers: baseResponse.headers,
  });
  response.headers.set("X-Session-Id", sessionId);
  response.headers.set("X-Stream-Hint", "true");
  return response;
  } catch {
    return Response.json(
      {
        status: "unavailable",
        fallback_url: "https://psychopats.ai/start",
        message: "founder-agent sleeps. try later, or leave email at /start",
      },
      { status: 503 }
    );
  }
}
