import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../lib/prisma.js';

export const userRouter = Router();

userRouter.use(authenticate);

userRouter.get('/reports', async (req, res) => {
  const reports = await prisma.astrologyReport.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: { id: true, type: true, createdAt: true },
  });
  res.json({ success: true, data: reports });
});

userRouter.get('/reports/:id', async (req, res) => {
  const report = await prisma.astrologyReport.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  });
  if (!report) return res.status(404).json({ success: false, error: 'Report not found' });
  res.json({ success: true, data: report });
});

userRouter.get('/usage', async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const usage = await prisma.usageRecord.groupBy({
    by: ['feature'],
    where: { userId: req.user!.userId, createdAt: { gte: startOfMonth } },
    _sum: { tokensIn: true, tokensOut: true, cost: true },
    _count: true,
  });

  const totalUsage = await prisma.usageRecord.aggregate({
    where: { userId: req.user!.userId },
    _sum: { tokensIn: true, tokensOut: true, cost: true },
  });

  res.json({ success: true, data: { byFeature: usage, totals: totalUsage._sum } });
});

const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthPlace: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

userRouter.patch('/profile', validate(profileSchema), async (req, res) => {
  const data = req.body as z.infer<typeof profileSchema>;
  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data,
    select: { id: true, email: true, name: true, role: true, timezone: true, language: true, birthDate: true, birthTime: true, birthPlace: true },
  });
  res.json({ success: true, data: user });
});

userRouter.get('/analytics', async (req, res) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const reportCount = await prisma.astrologyReport.count({ where: { userId: req.user!.userId, createdAt: { gte: thirtyDaysAgo } } });
  const chatCount = await prisma.chatSession.count({ where: { userId: req.user!.userId, updatedAt: { gte: thirtyDaysAgo } } });
  const usage = await prisma.usageRecord.aggregate({ where: { userId: req.user!.userId, createdAt: { gte: thirtyDaysAgo } }, _sum: { cost: true } });

  res.json({
    success: true,
    data: { reportsGenerated: reportCount, chatSessions: chatCount, totalCost: usage._sum.cost || 0 },
  });
});
