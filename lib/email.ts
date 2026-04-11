import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

interface ApplicationEmailData {
  name: string;
  email: string;
  whatYouBuild: string;
  whyYouWantIn?: string;
  socialLinks?: Record<string, string>;
  appliedVia: string;
  agentName?: string;
}

export async function sendApplicationEmail(data: ApplicationEmailData): Promise<void> {
  const resend = getResend();

  const socialLinksText = data.socialLinks
    ? Object.entries(data.socialLinks)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n")
    : "  none provided";

  const { data: result, error } = await resend.emails.send({
    from: "psychopats.ai <noreply@psychopats.ai>",
    to: "vital@mindist.io",
    subject: `New application: ${data.name} (${data.appliedVia})`,
    text: `New application to psychopats.ai

Name: ${data.name}
Email: ${data.email}
Applied via: ${data.appliedVia}${data.agentName ? ` (${data.agentName})` : ""}

What they build:
${data.whatYouBuild}

Why they want in:
${data.whyYouWantIn || "not provided"}

Social links:
${socialLinksText}

---
Review applications: https://www.instantdb.com/dash
`,
  });

  if (error) {
    // Resend returns structured errors (403 = domain not verified, 429 = rate limit, etc.)
    console.error("Resend API error:", {
      statusCode: error.name,
      message: error.message,
    });
    return;
  }

  if (result) {
    console.log("Application email sent:", result.id);
  }
}
