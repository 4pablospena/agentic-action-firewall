interface ResendEmailInput {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}

export async function sendResendEmail(input: ResendEmailInput): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${input.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "AAF Dashboard <notifications@agent-firewall.dev>",
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API failed: ${response.status}`);
  }
}
