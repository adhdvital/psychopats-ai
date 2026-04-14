export interface ExtractedPII {
  email?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  additionalLinks: string[];
}

const PATTERNS: Record<string, RegExp> = {
  linkedin: /https?:\/\/(www\.)?linkedin\.com\/in\/\S+/gi,
  twitter: /https?:\/\/(www\.)?(twitter\.com|x\.com)\/\S+/gi,
  instagram: /https?:\/\/(www\.)?instagram\.com\/\S+/gi,
  github: /https?:\/\/(www\.)?github\.com\/\S+/gi,
};

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

export function extractPII(
  messages: { role: string; content: string }[]
): ExtractedPII {
  const result: ExtractedPII = { additionalLinks: [] };
  const text = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content)
    .join(" ");

  const emailMatch = text.match(EMAIL_REGEX);
  if (emailMatch) result.email = emailMatch[0];

  for (const [key, regex] of Object.entries(PATTERNS)) {
    const match = text.match(regex);
    if (match) {
      const k = key as keyof typeof PATTERNS;
      if (k === "linkedin") result.linkedin = match[0];
      else if (k === "twitter") result.twitter = match[0];
      else if (k === "instagram") result.instagram = match[0];
      else if (k === "github") result.github = match[0];
    }
  }

  return result;
}

const SOCIAL_KEYS = ["linkedin", "twitter", "instagram", "github"] as const;

export function sanitizeForLLM(
  messages: { role: string; content: string }[],
  pii: ExtractedPII
): { role: string; content: string }[] {
  return messages.map((m) => {
    if (m.role !== "user") return m;

    let content = m.content;

    if (pii.email) content = content.replaceAll(pii.email, "[EMAIL_PROVIDED]");
    for (const s of SOCIAL_KEYS) {
      const url = pii[s];
      if (url) content = content.replaceAll(url, `[${s.toUpperCase()}_PROVIDED]`);
    }

    return { ...m, content };
  });
}

export function buildSocialHint(pii: ExtractedPII): string {
  const provided = SOCIAL_KEYS.filter((s) => pii[s]);
  const missing = SOCIAL_KEYS.filter((s) => !pii[s]);
  return `SOCIAL_LINKS_STATE: user has provided ${provided.length}/4 social links. provided: ${provided.join(", ") || "none"}. missing: ${missing.join(", ") || "none"}.`;
}
