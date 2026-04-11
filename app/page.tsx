"use client";

import { useState } from "react";

export default function Home() {
  const [wakeUpOpen, setWakeUpOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "exists"
  >("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");

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
        setSubmittedEmail(email);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      setWakeUpOpen(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-between px-6 py-16">
      {/* Main content — centered */}
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <h1 className="text-foreground">psychopats.ai</h1>

        <div className="mt-10 flex flex-col gap-2">
          <p>agent-gated community</p>
          <p>for people with ai psychosis.</p>
        </div>

        <p className="mt-10">ask your agent to tell more about it.</p>
      </div>

      {/* Bottom section — CLI selector style */}
      <div className="flex flex-col items-start gap-1 opacity-40">
        <p className="mb-2">don&apos;t have an agent yet?</p>

        {status === "success" ? (
          <p className="opacity-100">
            wake up. email sent to {submittedEmail}
          </p>
        ) : status === "exists" ? (
          <p className="opacity-100">you&apos;re already on the list. wake up.</p>
        ) : !wakeUpOpen ? (
          <button
            onClick={() => setWakeUpOpen(true)}
            onKeyDown={handleKeyDown}
            className="cursor-pointer border-none bg-transparent p-0 text-foreground opacity-100 transition-opacity hover:opacity-80"
            style={{ font: "inherit", fontSize: "inherit" }}
            autoFocus
          >
            <span className="text-accent">&gt;</span> wake up, it is april 2026
            <span className="ml-4 opacity-40">press enter</span>
          </button>
        ) : (
          <div className="flex flex-col items-start gap-3">
            <p className="opacity-70">
              leave your email. we&apos;ll help you get an agent.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2"
            >
              <span className="text-accent">&gt;</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                autoFocus
                className="w-56 border-b border-foreground/20 bg-transparent px-1 py-2 text-foreground transition-colors sm:w-64"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="cursor-pointer border-none bg-transparent text-foreground transition-opacity hover:opacity-70 disabled:opacity-30"
                style={{ font: "inherit", fontSize: "inherit" }}
              >
                {status === "loading" ? "..." : "↵"}
              </button>
            </form>
          </div>
        )}

        {status === "error" && (
          <p className="text-red-400 opacity-100">
            something broke. try again.
          </p>
        )}
      </div>
    </div>
  );
}
