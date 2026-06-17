import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

export const contactRouter = Router();

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long (max 200 chars)'),
  message: z.string().min(1, 'Message is required').max(5000, 'Message too long (max 5000 chars)'),
});

contactRouter.post('/', validate(contactSchema), asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body as z.infer<typeof contactSchema>;

  const recent = await prisma.contactMessage.findFirst({
    where: { email, createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } },
  });

  if (recent) {
    res.status(429).json({ success: false, error: 'You have already sent a message recently. Please wait before sending another.' });
    return;
  }

  await prisma.contactMessage.create({
    data: { name, email, subject, message },
  });

  const sanitizedEmail = email.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 254);
  const sanitizedSubject = subject.replace(/[\x00-\x1f\x7f]/g, '').slice(0, 200);

  logger.info({ email: sanitizedEmail, subject: sanitizedSubject }, 'Contact message received');

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.FROM_EMAIL || 'noreply@somasurya.com',
        to: process.env.CONTACT_EMAIL || 'hello@somaandsurya.com',
        subject: `Contact: ${sanitizedSubject}`,
        html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${sanitizedEmail}</p><p><strong>Subject:</strong> ${sanitizedSubject}</p><p><strong>Message:</strong></p><p>${message}</p>`,
      });
      logger.info({ email: sanitizedEmail, subject: sanitizedSubject }, 'Contact email forwarded via Resend');
    } catch (err) {
      logger.error({ err, email: sanitizedEmail }, 'Failed to forward contact email via Resend');
    }
  }

  res.json({ success: true, message: 'Message received' });
}));
