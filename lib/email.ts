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

  const emailBody = `New application to psychopats.ai

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
`;

  const subject = `New application: ${data.name} (${data.appliedVia})`;

  // Try verified domain first, fallback to Resend sandbox if domain not yet verified
  const { data: result, error } = await resend.emails.send({
    from: "psychopats.ai <noreply@psychopats.ai>",
    to: "vital@mindist.io",
    subject,
    text: emailBody,
  });

  if (error) {
    console.error("Resend primary send failed:", error.message);
    // Domain not verified — fallback to Resend sandbox sender
    const { data: fallbackResult, error: fallbackError } = await resend.emails.send({
      from: "psychopats.ai <onboarding@resend.dev>",
      to: "vital@mindist.io",
      subject,
      text: emailBody,
    });
    if (fallbackError) {
      console.error("Resend fallback also failed:", fallbackError.message);
      return;
    }
    if (fallbackResult) {
      console.log("Application email sent via fallback:", fallbackResult.id);
    }
    return;
  }

  if (result) {
    console.log("Application email sent:", result.id);
  }
}
