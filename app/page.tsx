"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "exists"
  >("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.status === "already_subscribed") {
        setStatus("exists");
      } else if (data.status === "subscribed") {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center gap-8 text-center">
        <h1 className="text-2xl tracking-tight text-foreground sm:text-3xl">
          psychopats.ai
        </h1>

        <p className="text-base text-muted sm:text-lg">
          ask your agent what to do next
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          <span className="text-xs text-muted opacity-50">── or ──</span>

          {status === "success" ? (
            <p className="text-sm text-accent">you&apos;re on the list.</p>
          ) : status === "exists" ? (
            <p className="text-sm text-muted">already on the list.</p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-56 border-b border-muted/30 bg-transparent px-1 py-2 text-sm text-foreground transition-colors focus:border-accent sm:w-64"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="text-sm text-muted transition-colors hover:text-accent disabled:opacity-30"
              >
                {status === "loading" ? "..." : "→"}
              </button>
            </form>
          )}

          {status !== "success" && status !== "exists" && (
            <span className="text-xs text-muted opacity-40">
              get notified when we launch
            </span>
          )}

          {status === "error" && (
            <span className="text-xs text-red-400">
              something broke. try again.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
