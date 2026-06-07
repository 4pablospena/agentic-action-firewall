interface TwilioSmsInput {
  accountSid: string;
  authToken: string;
  to: string;
  body: string;
}

export async function sendTwilioSms(input: TwilioSmsInput): Promise<void> {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${input.accountSid}/Messages.json`;
  const params = new URLSearchParams({
    To: input.to,
    From: "+10000000000",
    Body: input.body,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${input.accountSid}:${input.authToken}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Twilio API failed: ${response.status}`);
  }
}
