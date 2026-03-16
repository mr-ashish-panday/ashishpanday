import process from "node:process";
import { Resend } from "resend";
import { ApiError } from "./api-error.js";

const isVercelDeployment = () =>
  Boolean(process.env.VERCEL) || Boolean(process.env.VERCEL_URL);

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatMultiline = (value = "") =>
  escapeHtml(value).replaceAll("\n", "<br />");

const ownerEmailHtml = (submission, ownerName) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
    <h2 style="margin-bottom: 8px;">New portfolio contact message</h2>
    <p style="margin-top: 0; color: #4b5563;">
      A new message was submitted through your website contact form.
    </p>
    <table style="border-collapse: collapse; width: 100%; margin: 20px 0;">
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700;">Reference</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(submission.id)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700;">Name</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(submission.name)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700;">Email</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(submission.email)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700;">Subject</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(submission.subject)}</td>
      </tr>
      <tr>
        <td style="padding: 8px; border: 1px solid #e5e7eb; font-weight: 700;">Submitted</td>
        <td style="padding: 8px; border: 1px solid #e5e7eb;">${escapeHtml(submission.submittedAt)}</td>
      </tr>
    </table>
    <div style="padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
      ${formatMultiline(submission.message)}
    </div>
    <p style="margin-top: 20px; color: #4b5563;">
      Reply directly to this email to contact ${escapeHtml(submission.name)}.
    </p>
    <p style="color: #9ca3af; font-size: 12px;">${escapeHtml(ownerName)} portfolio contact notification</p>
  </div>
`;

const autoReplyHtml = (submission, ownerName, ownerEmail) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
    <h2 style="margin-bottom: 8px;">Thanks for reaching out</h2>
    <p style="margin-top: 0;">Hi ${escapeHtml(submission.name)},</p>
    <p>
      Thanks for your message through my portfolio website. I received your note about
      <strong>${escapeHtml(submission.subject)}</strong> and will get back to you as soon as possible.
    </p>
    <p>
      Your reference ID is <strong>${escapeHtml(submission.id)}</strong>. You can keep this for follow-up.
    </p>
    <div style="padding: 16px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px;">
      ${formatMultiline(submission.message)}
    </div>
    <p style="margin-top: 20px;">
      If your message is urgent, you can also contact me directly at
      <a href="mailto:${escapeHtml(ownerEmail)}">${escapeHtml(ownerEmail)}</a>.
    </p>
    <p>Regards,<br />${escapeHtml(ownerName)}</p>
  </div>
`;

export const getEmailMode = () => {
  if (process.env.RESEND_API_KEY) {
    return "resend";
  }

  if (isVercelDeployment()) {
    return "missing-resend";
  }

  return "disabled-local";
};

export const sendContactEmails = async (submission, portfolio = {}) => {
  const emailMode = getEmailMode();
  const ownerName = portfolio.profile?.name || "Portfolio Owner";
  const ownerEmail =
    process.env.CONTACT_NOTIFICATION_EMAIL?.trim() ||
    portfolio.profile?.email ||
    "ashishpanday9818@gmail.com";
  const fromEmail =
    process.env.CONTACT_FROM_EMAIL?.trim() || "Portfolio Contact <onboarding@resend.dev>";
  const autoReplyEnabled = process.env.CONTACT_AUTO_REPLY_ENABLED !== "false";

  if (emailMode !== "resend") {
    if (emailMode === "missing-resend") {
      throw new ApiError(
        503,
        "Email notifications are not configured. Add RESEND_API_KEY and CONTACT_FROM_EMAIL in Vercel."
      );
    }

    return {
      emailMode,
      ownerNotification: { status: "skipped" },
      autoReply: { status: "skipped" },
    };
  }

  if (!ownerEmail) {
    throw new ApiError(
      503,
      "Email notifications are not configured. Add CONTACT_NOTIFICATION_EMAIL or set a profile email."
    );
  }

  if (!process.env.CONTACT_FROM_EMAIL?.trim() && isVercelDeployment()) {
    throw new ApiError(
      503,
      "Email notifications are not configured. Add CONTACT_FROM_EMAIL in Vercel."
    );
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const tasks = [
    resend.emails.send({
      from: fromEmail,
      to: [ownerEmail],
      subject: `New portfolio message: ${submission.subject}`,
      html: ownerEmailHtml(submission, ownerName),
      replyTo: submission.email,
    }),
  ];

  if (autoReplyEnabled) {
    tasks.push(
      resend.emails.send({
        from: fromEmail,
        to: [submission.email],
        subject: `We received your message, ${submission.name}`,
        html: autoReplyHtml(submission, ownerName, ownerEmail),
        replyTo: ownerEmail,
      })
    );
  }

  const results = await Promise.allSettled(tasks);
  const ownerResult = results[0];
  const autoReplyResult = autoReplyEnabled ? results[1] : null;

  const mapResult = (result) => {
    if (!result) {
      return { status: "skipped" };
    }

    if (result.status === "rejected") {
      return {
        status: "failed",
        error: result.reason?.message || "Unknown email delivery error",
      };
    }

    if (result.value?.error) {
      return {
        status: "failed",
        error: result.value.error.message || "Unknown Resend API error",
      };
    }

    return {
      status: "sent",
      id: result.value?.data?.id || null,
    };
  };

  const ownerNotification = mapResult(ownerResult);
  const autoReply = autoReplyEnabled ? mapResult(autoReplyResult) : { status: "skipped" };

  if (ownerNotification.status !== "sent") {
    throw new ApiError(
      502,
      "Message was saved, but email delivery failed. Please check your Resend settings."
    );
  }

  return {
    emailMode,
    ownerNotification,
    autoReply,
  };
};
