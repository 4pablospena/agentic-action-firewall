import { describe, expect, it, vi, afterEach } from "vitest";
import { sendResendEmail } from "../../server/utils/notifiers/resend";

describe("Resend notifier", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls Resend API with bearer token", async () => {
    const fetchMock = vi.fn(async () => new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendResendEmail({
      apiKey: "re_test",
      to: "dev@localhost",
      subject: "Approval granted",
      html: "<p>ok</p>",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.resend.com/emails",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer re_test",
        }),
      }),
    );
  });
});
