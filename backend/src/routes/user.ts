import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/reports', asyncHandler(async (req, res) => {
  const reports = await prisma.astrologyReport.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, type: true, createdAt: true },
  });
  res.json({ success: true, data: reports });
}));

userRouter.get('/reports/:id', asyncHandler(async (req, res) => {
  const report = await prisma.astrologyReport.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
  res.json({ success: true, data: report });
}));

userRouter.get('/usage', asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [byFeature, totals] = await Promise.all([
    prisma.usageRecord.groupBy({
      by: ['feature'],
      where: { userId: req.user!.userId, createdAt: { gte: startOfMonth } },
      _sum: { tokensIn: true, tokensOut: true, cost: true },
      _count: true,
    }),
    prisma.usageRecord.aggregate({
      where: { userId: req.user!.userId },
      _sum: { tokensIn: true, tokensOut: true, cost: true },
    }),
  ]);

  res.json({ success: true, data: { byFeature, totals: totals._sum } });
}));

const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

userRouter.patch('/profile', validate(profileSchema), asyncHandler(async (req, res) => {
  const data = req.body as z.infer<typeof profileSchema>;
  const cleaned = Object.fromEntries(Object.entries(data).filter(([_, v]) => v !== undefined && v !== ''));
  const updated = await prisma.user.update({
    where: { id: req.user!.userId },
    data: cleaned,
    select: { id: true, email: true, name: true, role: true, timezone: true, language: true, birthDate: true, birthTime: true, birthPlace: true },
  });

  prisma.usageRecord.create({
    data: { userId: req.user!.userId, feature: 'settings_saved', tokensIn: 0, tokensOut: 0, cost: 0 },
  }).catch((err) => logger.warn({ err }, 'Failed to log settings_saved usage'));

  res.json({ success: true, message: 'Profile updated successfully', data: updated });
}));

userRouter.post('/reset-profile', asyncHandler(async (req, res) => {
  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name: '', birthDate: null, birthTime: null, birthPlace: null },
  });
  prisma.usageRecord.create({
    data: { userId: req.user!.userId, feature: 'profile_reset', tokensIn: 0, tokensOut: 0, cost: 0 },
  }).catch((err) => logger.warn({ err }, 'Failed to log profile_reset usage'));
  res.json({ success: true, message: 'Profile data reset successfully' });
}));

userRouter.get('/analytics', asyncHandler(async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [reportCount, chatCount, usage] = await Promise.all([
    prisma.astrologyReport.count({ where: { userId: req.user!.userId, createdAt: { gte: thirtyDaysAgo } } }),
    prisma.chatSession.count({ where: { userId: req.user!.userId, updatedAt: { gte: thirtyDaysAgo } } }),
    prisma.usageRecord.aggregate({ where: { userId: req.user!.userId, createdAt: { gte: thirtyDaysAgo } }, _sum: { cost: true } }),
  ]);
  res.json({ success: true, data: { reportsGenerated: reportCount, chatSessions: chatCount, totalCost: usage._sum.cost || 0 } });
}));
