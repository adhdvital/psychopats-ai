import { Resend } from "resend";

export async function sendApplicationEmail(data: {
  name: string;
  email: string;
  whatYouBuild: string;
  whyYouWantIn?: string;
  socialLinks?: Record<string, string>;
  appliedVia: string;
  agentName?: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  const socialLinksText = data.socialLinks
    ? Object.entries(data.socialLinks)
        .map(([k, v]) => `  ${k}: ${v}`)
        .join("\n")
    : "  none provided";

  try {
    await resend.emails.send({
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
  } catch (error) {
    // Log but don't throw — email failure should not block application saving
    console.error("Failed to send application email:", error);
  }
}
