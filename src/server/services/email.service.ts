// Email service — FR-008: Verification email within 60 seconds
// In development, emails are logged to console.
// In production, replace with Resend/Nodemailer SMTP.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@college-coding.edu";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail(options: SendEmailOptions): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("\n========== EMAIL ==========");
    console.log("To:     ", options.to);
    console.log("From:   ", EMAIL_FROM);
    console.log("Subject:", options.subject);
    console.log("Body:   ", options.html);
    console.log("===========================\n");
    return;
  }

  // Production: integrate with Resend, SendGrid, or Nodemailer SMTP
  // For now, throw to surface misconfiguration early
  throw new Error("Email provider not configured for production.");
}

// FR-008: Verification email
export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = new URL("/api/auth/verify", APP_URL);
  verifyUrl.searchParams.set("token", token);

  await sendEmail({
    to: email,
    subject: "Verify your email — College Coding Platform",
    html: [
      "<h2>Welcome to the College Coding Platform!</h2>",
      "<p>Click the link below to verify your email address:</p>",
      "<p><a href=\"" + verifyUrl.toString() + "\">Verify Email</a></p>",
      "<p>This link expires in 24 hours.</p>",
      "<p>If you did not create an account, you can safely ignore this email.</p>",
    ].join(""),
  });
}

// FR-016: Password reset email
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const resetUrl = new URL("/auth/new-password", APP_URL);
  resetUrl.searchParams.set("token", token);

  await sendEmail({
    to: email,
    subject: "Reset your password — College Coding Platform",
    html: [
      "<h2>Password Reset Request</h2>",
      "<p>Click the link below to set a new password:</p>",
      "<p><a href=\"" + resetUrl.toString() + "\">Reset Password</a></p>",
      "<p>This link expires in 1 hour. If you did not request this, ignore this email.</p>",
    ].join(""),
  });
}

// FR-021: Email change verification
export async function sendEmailChangeVerification(
  newEmail: string,
  token: string
): Promise<void> {
  const verifyUrl = new URL("/api/auth/verify-email-change", APP_URL);
  verifyUrl.searchParams.set("token", token);

  await sendEmail({
    to: newEmail,
    subject: "Confirm your new email — College Coding Platform",
    html: [
      "<h2>Email Change Request</h2>",
      "<p>Click the link below to confirm your new email address:</p>",
      "<p><a href=\"" + verifyUrl.toString() + "\">Confirm New Email</a></p>",
      "<p>This link expires in 24 hours. If you did not request this, ignore this email.</p>",
    ].join(""),
  });
}
