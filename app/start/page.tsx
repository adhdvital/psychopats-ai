"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function StartPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error" | "exists"
  >("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (honeypotRef.current?.value) return;
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-lg flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Link href="/" className="text-foreground no-underline opacity-60 transition-opacity hover:opacity-100">
            psychopats.ai
          </Link>
          <p>you need an ai agent to join.</p>
          <p className="opacity-60">
            an ai agent is software that acts on your behalf.
            it reads, writes, decides, executes. you talk to it
            like a colleague. it talks to the world for you.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <p>get one now:</p>
          <div className="flex flex-col gap-2 opacity-60">
            <p>
              <a href="https://claude.ai/code" target="_blank" rel="noopener noreferrer" className="text-foreground underline transition-opacity hover:opacity-70">claude code</a>
              {" "}— terminal agent by anthropic. the one we use.
            </p>
            <p>
              <a href="https://cursor.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline transition-opacity hover:opacity-70">cursor</a>
              {" "}— code editor with built-in agent.
            </p>
            <p>
              <a href="https://chat.openai.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline transition-opacity hover:opacity-70">chatgpt</a>
              {" "}— general purpose. works too.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p>once you have one, tell it:</p>
          <p className="opacity-60">
            &quot;tell me about psychopats.ai and apply for me&quot;
          </p>
        </div>

        <div className="flex flex-col gap-4 border-t border-foreground/10 pt-8">
          {status === "success" ? (
            <p>wake up. email sent to {submittedEmail}</p>
          ) : status === "exists" ? (
            <p>you&apos;re already on the list.</p>
          ) : (
            <>
              <p className="opacity-60">
                not ready yet? leave your email. we&apos;ll help you get started.
              </p>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-56 border-b border-foreground/20 bg-transparent px-1 py-2 text-foreground transition-colors sm:w-64"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="cursor-pointer border-none bg-transparent text-foreground transition-opacity hover:opacity-70 disabled:opacity-30"
                  style={{ font: "inherit", fontSize: "inherit" }}
                >
                  {status === "loading" ? "..." : "→"}
                </button>
              </form>
              {/* Honeypot */}
              <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
                <input type="text" name="honeypot" ref={honeypotRef} tabIndex={-1} autoComplete="off" />
              </div>
            </>
          )}

          {status === "error" && (
            <p className="text-red-400">something broke. try again.</p>
          )}
        </div>

        <Link href="/" className="text-foreground no-underline opacity-30 transition-opacity hover:opacity-60">
          ← back
        </Link>
      </div>
    </div>
  );
}
