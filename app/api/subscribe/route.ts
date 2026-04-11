import { NextResponse } from "next/server";
import { db, id, tx } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, source = "website" } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { status: "error", message: "Valid email required" },
        { status: 400 },
      );
    }

    const normalized = email.toLowerCase().trim();

    const existing = await db.query({
      subscribers: { $: { where: { email: normalized } } },
    });

    if (existing.subscribers && existing.subscribers.length > 0) {
      return NextResponse.json({ status: "already_subscribed" });
    }

    await db.transact(
      tx.subscribers[id()].update({
        email: normalized,
        source,
        createdAt: Date.now(),
      }),
    );

    return NextResponse.json({ status: "subscribed" });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { status: "error", message: "Internal error" },
      { status: 500 },
    );
  }
}
