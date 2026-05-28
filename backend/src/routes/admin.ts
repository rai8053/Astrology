import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const adminRouter = Router();

adminRouter.use(authenticate, requireRole('ADMIN', 'SUPER_ADMIN'));

adminRouter.get('/users', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, role: true, emailVerified: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  res.json({
    success: true,
    data: users,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

adminRouter.get('/users/:id', async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: { id: true, email: true, name: true, role: true, emailVerified: true, timezone: true, language: true, createdAt: true, subscription: true },
  });
  if (!user) return res.status(404).json({ success: false, error: 'User not found' });
  res.json({ success: true, data: user });
});

adminRouter.patch('/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!['USER', 'PREMIUM', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid role' });
  }
  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { role },
    select: { id: true, email: true, name: true, role: true },
  });
  res.json({ success: true, data: user });
});

adminRouter.get('/analytics', async (_req, res) => {
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
    data: {
      totalUsers: userCount,
      activeSubscriptions,
      reportsThisMonth: monthlyReports,
      revenueThisMonth: monthlyRevenue._sum.cost || 0,
    },
  });
});

adminRouter.get('/reports', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    prisma.astrologyReport.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.astrologyReport.count(),
  ]);

  res.json({ success: true, data: reports, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

adminRouter.get('/usage', async (req, res) => {
  const days = parseInt(req.query.days as string) || 30;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const usage = await prisma.usageRecord.groupBy({
    by: ['feature'],
    where: { createdAt: { gte: since } },
    _sum: { tokensIn: true, tokensOut: true, cost: true },
    _count: true,
  });

  res.json({ success: true, data: usage });
});
