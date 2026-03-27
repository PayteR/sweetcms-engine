import nodemailer from 'nodemailer';

import { createQueue, createWorker } from '../queue';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

const emailQueue = createQueue('email');

/** Enqueue an email — never call sendEmail directly */
export async function enqueueEmail(payload: EmailPayload): Promise<void> {
  if (emailQueue) {
    await emailQueue.add('send', payload);
  } else {
    // No Redis — send synchronously in dev
    console.log(`[email] Sending directly (no Redis): ${payload.subject} → ${payload.to}`);
    await sendEmail(payload);
  }
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL } =
    process.env;

  if (!SMTP_HOST || !FROM_EMAIL) {
    console.log(`[email] SMTP not configured — skipping: ${payload.subject}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT ?? '587', 10),
    secure: false,
    auth:
      SMTP_USER && SMTP_PASS
        ? { user: SMTP_USER, pass: SMTP_PASS }
        : undefined,
  });

  await transporter.sendMail({
    from: FROM_EMAIL,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });
}

/** Initialize email worker (call from server.ts when BullMQ is enabled) */
export function startEmailWorker(): void {
  createWorker('email', async (job) => {
    await sendEmail(job.data as EmailPayload);
  });
}
