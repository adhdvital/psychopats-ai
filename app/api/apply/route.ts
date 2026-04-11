import { NextResponse } from "next/server";
import { db, id, tx } from "@/lib/db";
import { sendApplicationEmail } from "@/lib/email";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com", "guerrillamail.com", "tempmail.com", "yopmail.com",
  "throwaway.email", "temp-mail.org", "fakeinbox.com", "sharklasers.com",
  "grr.la", "guerrillamailblock.com", "pokemail.net", "spam4.me",
  "bccto.me", "trash-mail.com", "mailnesia.com", "maildrop.cc",
  "dispostable.com", "mailcatch.com", "trashmail.com", "10minutemail.com",
]);

const MAX_NAME_LENGTH = 200;
const MAX_TEXT_LENGTH = 2000;
const MAX_SOCIAL_LINKS = 10;
const MAX_SOCIAL_LINK_LENGTH = 500;

interface ApplicationBody {
  name?: unknown;
  email?: unknown;
  what_you_build?: unknown;
  why_you_want_in?: unknown;
  social_links?: unknown;
  applied_via?: unknown;
  agent_name?: unknown;
  honeypot?: unknown;
}

interface ApplicationRecord {
  email: string;
  createdAt: number;
  status: string;
  name: string;
  whatYouBuild: string;
  whyYouWantIn: string;
  socialLinks: Record<string, string> | null;
  appliedVia: string;
  agentName: string | null;
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? value.slice(0, maxLength) : value;
}

function validateSocialLinks(
  links: unknown,
): Record<string, string> | null {
  if (links === null || links === undefined) return null;
  if (typeof links !== "object" || Array.isArray(links)) return null;

  const result: Record<string, string> = {};
  const entries = Object.entries(links as Record<string, unknown>);

  for (const [key, value] of entries.slice(0, MAX_SOCIAL_LINKS)) {
    if (typeof key === "string" && typeof value === "string") {
      result[truncate(key, 50)] = truncate(value, MAX_SOCIAL_LINK_LENGTH);
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

export async function POST(request: Request) {
  try {
    let body: ApplicationBody;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { status: "error", message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { name, email, what_you_build, why_you_want_in, social_links, applied_via, agent_name, honeypot } = body;

    // Honeypot check -- fake success to fool bots
    if (honeypot) {
      return NextResponse.json({ status: "success", message: "Application received." });
    }

    // Type validation
    if (typeof name !== "string" || typeof email !== "string" || typeof what_you_build !== "string") {
      return NextResponse.json(
        { status: "error", message: "Required: name, email, what_you_build (all strings)" },
        { status: 400 },
      );
    }

    // Content validation
    if (!name.trim() || !email.trim() || !what_you_build.trim()) {
      return NextResponse.json(
        { status: "error", message: "Required: name, email, what_you_build" },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { status: "error", message: "Valid email required" },
        { status: 400 },
      );
    }

    const emailDomain = email.split("@")[1]?.toLowerCase();
    if (DISPOSABLE_DOMAINS.has(emailDomain)) {
      return NextResponse.json(
        { status: "error", message: "Disposable email addresses are not accepted" },
        { status: 400 },
      );
    }

    // Validate optional string fields
    if (why_you_want_in !== undefined && typeof why_you_want_in !== "string") {
      return NextResponse.json(
        { status: "error", message: "why_you_want_in must be a string" },
        { status: 400 },
      );
    }

    if (applied_via !== undefined && typeof applied_via !== "string") {
      return NextResponse.json(
        { status: "error", message: "applied_via must be a string" },
        { status: 400 },
      );
    }

    if (agent_name !== undefined && typeof agent_name !== "string") {
      return NextResponse.json(
        { status: "error", message: "agent_name must be a string" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();
    const safeName = truncate(name.trim(), MAX_NAME_LENGTH);
    const safeWhatYouBuild = truncate(what_you_build.trim(), MAX_TEXT_LENGTH);
    const safeWhyYouWantIn = why_you_want_in
      ? truncate(why_you_want_in.trim(), MAX_TEXT_LENGTH)
      : "";
    const safeSocialLinks = validateSocialLinks(social_links);
    const safeAppliedVia = truncate(
      (typeof applied_via === "string" ? applied_via : "human"),
      50,
    );
    const safeAgentName = agent_name
      ? truncate(agent_name.trim(), MAX_NAME_LENGTH)
      : null;

    // Rate limit: 1 per email per 3 months
    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const existing = await db.query({
      applications: { $: { where: { email: normalized } } },
    });

    const applications = existing.applications as unknown as ApplicationRecord[] | undefined;
    const recentApp = applications?.find(
      (app) => app.createdAt > threeMonthsAgo,
    );

    if (recentApp) {
      return NextResponse.json(
        {
          status: "rate_limited",
          message: "You've already applied. Try again in 3 months.",
        },
        { status: 429 },
      );
    }

    // Create application
    const appId = id();
    try {
      await db.transact(
        tx.applications[appId].update({
          name: safeName,
          email: normalized,
          whatYouBuild: safeWhatYouBuild,
          whyYouWantIn: safeWhyYouWantIn,
          socialLinks: safeSocialLinks,
          appliedVia: safeAppliedVia,
          agentName: safeAgentName,
          status: "pending",
          createdAt: Date.now(),
        }),
      );
    } catch (dbError) {
      // Handle unique constraint violation (concurrent duplicate)
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes("unique") || errorMessage.includes("constraint")) {
        return NextResponse.json(
          {
            status: "rate_limited",
            message: "You've already applied. Try again in 3 months.",
          },
          { status: 429 },
        );
      }
      throw dbError;
    }

    // Send email notification (awaited to prevent Vercel lambda freeze before delivery)
    try {
      await sendApplicationEmail({
        name: safeName,
        email: normalized,
        whatYouBuild: safeWhatYouBuild,
        whyYouWantIn: safeWhyYouWantIn || undefined,
        socialLinks: safeSocialLinks ?? undefined,
        appliedVia: safeAppliedVia,
        agentName: safeAgentName ?? undefined,
      });
    } catch (emailError) {
      console.error("Email send failed:", emailError);
    }

    return NextResponse.json({
      status: "success",
      message: "Application received. We'll review and get back to you in ~7 days.",
      application_id: appId,
    });
  } catch (error) {
    console.error("Apply error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal error" },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { status: "error", message: "Email required" },
      { status: 400 },
    );
  }

  try {
    const result = await db.query({
      applications: { $: { where: { email: email.toLowerCase().trim() } } },
    });

    const apps = result.applications as unknown as ApplicationRecord[] | undefined;
    const app = apps?.[0];
    if (!app) {
      return NextResponse.json({ status: "not_found" });
    }

    // Only expose status and timestamp -- not name or other fields
    return NextResponse.json({
      status: app.status,
      applied_at: app.createdAt,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal error" },
      { status: 500 },
    );
  }
}
