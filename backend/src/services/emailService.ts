import type { B2BRequest } from "../repositories/b2bRepository.js";

const RESEND_API_URL = "https://api.resend.com/emails";

export const emailService = {
  async notifyB2BRequest(request: B2BRequest): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const notificationEmail = process.env.B2B_NOTIFICATION_EMAIL;
    const fromEmail = process.env.EMAIL_FROM;

    // Email configuration is optional during local development.
    if (!apiKey || !notificationEmail || !fromEmail) {
      console.log("[EMAIL] B2B notification skipped: email is not configured", {
        requestId: request.id,
      });
      return;
    }

    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [notificationEmail],
        subject: `New B2B Request - ${request.companyName}`,
        text: [
          "New B2B request received.",
          "",
          `Company: ${request.companyName}`,
          `Contact: ${request.contact}`,
          `Message: ${request.message}`,
          `Request ID: ${request.id}`,
          `Created At: ${request.createdAt}`,
        ].join("\n"),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Email provider returned ${response.status}: ${errorText}`
      );
    }

    console.log("[EMAIL] B2B notification sent", {
      requestId: request.id,
      companyName: request.companyName,
    });
  },
};