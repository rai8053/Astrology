import { Router } from 'express';
import { z } from 'zod';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const;

adminRouter.use(authenticate, requireRole(...ADMIN_ROLES));

adminRouter.get('/users', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip, take: limit, orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, emailVerified: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  res.json({ success: true, data: users, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

adminRouter.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, email: true, name: true, role: true, emailVerified: true, timezone: true, language: true, createdAt: true, subscription: true },
  });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, data: user });
}));

const roleSchema = z.object({ role: z.enum(['USER', 'PREMIUM', 'ADMIN', 'SUPER_ADMIN']) });

adminRouter.patch('/users/:id/role', validate(roleSchema), asyncHandler(async (req, res) => {
  const { role } = req.body as z.infer<typeof roleSchema>;
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });
  res.json({ success: true, data: user });
}));

adminRouter.get('/analytics', asyncHandler(async (_req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [userCount, activeSubscriptions, monthlyReports, monthlyRevenue] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.astrologyReport.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.usageRecord.aggregate({ where: { createdAt: { gte: startOfMonth } }, _sum: { cost: true } }),
  ]);

  res.json({
    success: true,
    data: { totalUsers: userCount, activeSubscriptions, reportsThisMonth: monthlyReports, revenueThisMonth: monthlyRevenue._sum.cost || 0 },
  });
}));

adminRouter.get('/reports', asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.astrologyReport.findMany({
      skip, take: limit, orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.astrologyReport.count(),
  ]);

  res.json({ success: true, data: reports, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}));

adminRouter.get('/usage', asyncHandler(async (req, res) => {
  const days = Math.min(365, Math.max(1, parseInt(req.query.days as string) || 30));
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const usage = await prisma.usageRecord.groupBy({
    by: ['feature'],
    where: { createdAt: { gte: since } },
    _sum: { tokensIn: true, tokensOut: true, cost: true },
    _count: true,
  });

  res.json({ success: true, data: usage });
}));
