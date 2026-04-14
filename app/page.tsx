"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const PROMPT = "what is psychopats.ai community?";

export default function Home() {
  const [phase, setPhase] = useState<"selector" | "input" | "success" | "exists" | "error">("selector");
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [copied, setCopied] = useState(false);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // insecure context / old browser — silent fail, prompt still visible
    }
  }, []);

  const submitEmail = useCallback(async (emailValue: string) => {
    if (!emailValue || !emailValue.includes("@") || !emailValue.includes(".")) return;

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailValue }),
      });
      const data = await res.json();
      if (data.status === "already_subscribed") {
        setPhase("exists");
      } else if (data.status === "subscribed") {
        setSubmittedEmail(emailValue);
        setPhase("success");
      } else {
        setPhase("error");
      }
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.isComposing) return;
      const active = document.activeElement as HTMLElement;
      if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA" || active?.tagName === "BUTTON") {
        if (active !== hiddenInputRef.current) return;
      }

      if (phase === "selector") {
        if (e.key === "Enter") { e.preventDefault(); setPhase("input"); }
      } else if (phase === "input") {
        if (e.key === "Enter") { e.preventDefault(); submitEmail(email); }
        else if (e.key === "Backspace") { e.preventDefault(); setEmail((v) => v.slice(0, -1)); }
        else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); setEmail((v) => v + e.key); }
      } else if (e.key === "Enter") {
        e.preventDefault();
        window.location.reload();
      }
    }

    function handlePaste(e: ClipboardEvent) {
      if (phase !== "input") return;
      e.preventDefault();
      const text = e.clipboardData?.getData("text") ?? "";
      setEmail((v) => v + text.trim());
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [phase, email, submitEmail]);

  function focusMobile() {
    if (phase === "input") hiddenInputRef.current?.focus();
  }

  function handleEnterAction() {
    if (phase === "selector") setPhase("input");
    else if (phase === "input") submitEmail(email);
    else window.location.reload();
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-4xl flex-col justify-between px-16 pb-10 pt-24 sm:px-20"
      onClick={focusMobile}
    >
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-[2.5rem] leading-tight text-foreground">psychopats.ai</h1>
        <div className="mt-12 flex flex-col">
          <p>we have ai psychosis</p>
        </div>

        <div className="mt-0 flex flex-wrap items-center gap-x-4 gap-y-0">
          <p>ask your agent</p>
          <div className="-ml-3 flex items-center gap-2 rounded-md bg-[#0f1019] px-3 py-2 sm:ml-0">
            <code className="font-mono text-foreground">{PROMPT}</code>
            <button
              type="button"
              onClick={copyPrompt}
              aria-label={copied ? "copied" : "copy prompt to clipboard"}
              className="text-hint transition-colors hover:text-foreground"
            >
              {copied ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <p className="mb-4">don&apos;t have an agent yet?</p>

        {/* Line 1 */}
        {phase === "selector" ? (
          <div className="flex items-center gap-2">
            <span className="text-accent">❯</span>
            <span>wake up</span>
          </div>
        ) : phase === "input" ? (
          <p>email:</p>
        ) : (
          <p>&nbsp;</p>
        )}

        {/* Line 2 */}
        <div className="flex items-center" style={{ minHeight: "1.7em" }}>
          {phase === "input" && (
            <>
              <span className="text-accent mr-2">❯</span>
              <span className="whitespace-pre">{email}</span>
              <span className="terminal-cursor inline-block h-[1.15em] w-[0.6em] bg-foreground" />
            </>
          )}
          {phase === "success" && <span>sent to {submittedEmail}</span>}
          {phase === "exists" && <span>already here</span>}
          {phase === "error" && <span className="text-red-400">something broke</span>}
        </div>

        {/* Line 3 */}
        <div style={{ minHeight: "1.7em" }}>
          {(phase === "success" || phase === "exists" || phase === "error") && (
            <div className="flex items-center gap-2">
              <span className="text-accent">❯</span>
              <span>refresh</span>
            </div>
          )}
        </div>

        {/* Line 4: hint — tappable on mobile (no keyboard), inert on desktop */}
        <button
          type="button"
          onClick={handleEnterAction}
          className="text-left text-hint sm:pointer-events-none"
        >
          press enter
        </button>

        {phase === "input" && (
          <input
            ref={hiddenInputRef}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitEmail(email); } }}
            className="absolute left-[-9999px] h-px w-px opacity-0"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoComplete="off"
          />
        )}
      </div>
    </div>
  );
}
