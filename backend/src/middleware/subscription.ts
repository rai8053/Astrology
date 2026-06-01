import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';

function isTrialActive(sub: { plan: string; status: string; trialEnd: Date | null }): boolean {
  if (sub.plan !== 'FREE') return true;
  if (sub.status === 'ACTIVE') return true;
  if (sub.status === 'TRIALING' && sub.trialEnd && sub.trialEnd > new Date()) return true;
  return false;
}

export async function requirePremium(req: Request, _res: Response, next: NextFunction) {
  try {
    const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.userId } });
    if (!sub || !isTrialActive(sub)) {
      throw new AppError(403, 'Upgrade to Premium to access this feature');
    }
    next();
  } catch (err) {
    next(err);
  }
}
