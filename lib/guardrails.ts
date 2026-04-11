const UNKNOWN_REGEX = /\[UNKNOWN_QUESTION:\s*(.+?)\]/;

const INJECTION_PATTERNS = [
  /ignore (?:all )?(?:previous |above )?instructions/i,
  /you are now/i,
  /new system prompt/i,
  /forget (?:everything|your instructions)/i,
  /act as/i,
  /pretend (?:to be|you(?:'re| are))/i,
  /override (?:your|the) (?:system|instructions)/i,
  /jailbreak/i,
  /DAN mode/i,
];

export function extractUnknownQuestion(text: string): string | null {
  const match = text.match(UNKNOWN_REGEX);
  return match ? match[1].trim() : null;
}

export function detectPromptInjection(text: string): boolean {
  return INJECTION_PATTERNS.some((p) => p.test(text));
}

export function stripUnknownMarker(text: string): string {
  return text.replace(UNKNOWN_REGEX, "").trim();
}
