import { NextResponse } from "next/server";
import { db, id, tx } from "@/lib/db";

const MAX_EMAIL_LENGTH = 320;
const MAX_SOURCE_LENGTH = 50;

export async function POST(request: Request) {
  try {
    let body: { email?: unknown; source?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { status: "error", message: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const { email, source = "website" } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { status: "error", message: "Valid email required" },
        { status: 400 },
      );
    }

    if (email.length > MAX_EMAIL_LENGTH) {
      return NextResponse.json(
        { status: "error", message: "Email too long" },
        { status: 400 },
      );
    }

    const safeSource = typeof source === "string"
      ? source.slice(0, MAX_SOURCE_LENGTH)
      : "website";

    const normalized = email.toLowerCase().trim();

    const existing = await db.query({
      subscribers: { $: { where: { email: normalized } } },
    });

    if (existing.subscribers && existing.subscribers.length > 0) {
      return NextResponse.json({ status: "already_subscribed" });
    }

    try {
      await db.transact(
        tx.subscribers[id()].update({
          email: normalized,
          source: safeSource,
          createdAt: Date.now(),
        }),
      );
    } catch (dbError) {
      // Handle unique constraint violation (concurrent duplicate subscribe)
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      if (errorMessage.includes("unique") || errorMessage.includes("constraint")) {
        return NextResponse.json({ status: "already_subscribed" });
      }
      throw dbError;
    }

    return NextResponse.json({ status: "subscribed" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal error" },
      { status: 500 },
    );
  }
}
