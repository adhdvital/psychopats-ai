"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export default function Home() {
  const [phase, setPhase] = useState<"selector" | "input" | "success" | "exists" | "error">("selector");
  const [email, setEmail] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  const hiddenInputRef = useRef<HTMLInputElement>(null);

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

  // Global keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if user is in another input/textarea
      const active = document.activeElement as HTMLElement;
      if (active?.tagName === "INPUT" || active?.tagName === "TEXTAREA") {
        if (active !== hiddenInputRef.current) return;
      }

      if (phase === "selector") {
        if (e.key === "Enter") {
          e.preventDefault();
          setPhase("input");
        }
      } else if (phase === "input") {
        if (e.key === "Enter") {
          e.preventDefault();
          submitEmail(email);
        } else if (e.key === "Backspace") {
          e.preventDefault();
          setEmail((v) => v.slice(0, -1));
        } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setEmail((v) => v + e.key);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, email, submitEmail]);

  // Focus hidden input for mobile keyboard
  function focusMobile() {
    if (phase === "input") {
      hiddenInputRef.current?.focus();
    }
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-4xl flex-col justify-between px-16 pb-10 pt-24 sm:px-20"
      onClick={focusMobile}
    >
      {/* Main content — left-aligned, vertically centered */}
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-[2.5rem] leading-tight text-foreground">psychopats.ai</h1>

        <div className="mt-12 flex flex-col">
          <p>agent-gated community</p>
          <p>for people with ai psychosis.</p>
        </div>

        <p className="mt-6">ask your agent to tell more about it.</p>
      </div>

      {/* Bottom section — fixed 3-line height to prevent layout shift */}
      <div className="flex flex-col">
        <p className="mb-4">don&apos;t have an agent yet?</p>

        {phase === "success" ? (
          <>
            <p>wake up. email sent to {submittedEmail}</p>
            <p>&nbsp;</p>
            <p className="text-hint">done</p>
          </>
        ) : phase === "exists" ? (
          <>
            <p>you&apos;re already on the list.</p>
            <p>&nbsp;</p>
            <p className="text-hint">wake up</p>
          </>
        ) : phase === "error" ? (
          <>
            <p className="text-red-400">something broke. try again.</p>
            <p>&nbsp;</p>
            <p className="text-hint">press enter</p>
          </>
        ) : (
          <>
            {phase === "selector" ? (
              <div className="flex items-center gap-2">
                <span className="text-accent">❯</span>
                <span>wake up</span>
              </div>
            ) : (
              <p>you will get help. your email:</p>
            )}

            <div className="flex items-center" style={{ minHeight: "1.7em" }}>
              {phase === "input" && (
                <>
                  <span className="whitespace-pre">{email}</span>
                  <span className="terminal-cursor inline-block h-[1.15em] w-[0.6em] bg-foreground" />
                </>
              )}
            </div>

            <p className="text-hint">press enter</p>

            {phase === "input" && (
              <input
                ref={hiddenInputRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    submitEmail(email);
                  }
                }}
                className="absolute left-[-9999px] h-px w-px opacity-0"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoComplete="off"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
