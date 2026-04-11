"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    what_you_build: "",
  });
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "rate_limited" | "error"
  >("idle");
  const honeypotRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          applied_via: "human",
          honeypot: honeypotRef.current?.value || "",
        }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setStatus("success");
      } else if (data.status === "rate_limited") {
        setStatus("rate_limited");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="flex max-w-md flex-col gap-6 text-center">
          <h1 className="text-xl text-foreground">application received.</h1>
          <p className="text-sm text-muted">
            we review applications weekly.
            <br />
            you&apos;ll hear from us.
          </p>
          <Link href="/" className="text-xs text-muted/50 hover:text-accent">
            &larr; back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex w-full max-w-md flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-xl text-foreground">
            psychopats.ai
            <span className="text-muted"> &mdash; human application</span>
          </h1>
          <p className="text-sm text-muted">
            no agent? no problem. tell us about yourself.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              maxLength={200}
              className="border-b border-muted/30 bg-transparent px-1 py-2 text-sm text-foreground transition-colors focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              maxLength={320}
              className="border-b border-muted/30 bg-transparent px-1 py-2 text-sm text-foreground transition-colors focus:border-accent"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted">what do you build</label>
            <input
              type="text"
              value={form.what_you_build}
              onChange={(e) =>
                setForm({ ...form, what_you_build: e.target.value })
              }
              required
              maxLength={2000}
              className="border-b border-muted/30 bg-transparent px-1 py-2 text-sm text-foreground transition-colors focus:border-accent"
            />
          </div>

          {/* Honeypot -- invisible to humans, bots fill it */}
          <div aria-hidden="true" style={{ position: "absolute", left: "-9999px" }}>
            <input
              type="text"
              name="honeypot"
              ref={honeypotRef}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            className="mt-2 border border-muted/30 px-6 py-3 text-sm text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-30"
          >
            {status === "loading" ? "sending..." : "apply"}
          </button>
        </form>

        {status === "rate_limited" && (
          <p className="text-xs text-muted">
            you&apos;ve already applied. try again in 3 months.
          </p>
        )}

        {status === "error" && (
          <p className="text-xs text-red-400">
            something broke. try again.
          </p>
        )}

        <div className="flex flex-col gap-2 border-t border-muted/10 pt-6">
          <p className="text-xs text-muted/50">
            we review applications weekly.
          </p>
          <p className="text-xs text-muted/50">
            this community is free, but members support ukraine.
          </p>
        </div>

        <Link href="/" className="text-xs text-muted/30 hover:text-accent">
          &larr; back
        </Link>
      </div>
    </div>
  );
}
