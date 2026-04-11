import { NextResponse } from "next/server";
import { db, id, tx } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, what_you_build, why_you_want_in, social_links, applied_via, agent_name, honeypot } = body;

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ status: "success", message: "Application received." });
    }

    // Validation
    if (!name || !email || !what_you_build) {
      return NextResponse.json(
        { status: "error", message: "Required: name, email, what_you_build" },
        { status: 400 },
      );
    }

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { status: "error", message: "Valid email required" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();

    // Rate limit: 1 per email per 3 months
    const threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    const existing = await db.query({
      applications: { $: { where: { email: normalized } } },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recentApp = existing.applications?.find(
      (app: any) => app.createdAt > threeMonthsAgo,
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
    await db.transact(
      tx.applications[appId].update({
        name: name.trim(),
        email: normalized,
        whatYouBuild: what_you_build.trim(),
        whyYouWantIn: why_you_want_in?.trim() || "",
        socialLinks: social_links || null,
        appliedVia: applied_via || "human",
        agentName: agent_name || null,
        status: "pending",
        createdAt: Date.now(),
      }),
    );

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

    const app = result.applications?.[0] as any;
    if (!app) {
      return NextResponse.json({ status: "not_found" });
    }

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
