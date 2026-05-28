import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';

export const paymentRouter = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-15' as Stripe.LatestApiVersion })
  : null;

const PLANS = {
  FREE: { priceId: '', name: 'Free', amount: 0 },
  PRO: { priceId: process.env.STRIPE_PRO_PRICE_ID || '', name: 'Pro', amount: 999 },
  PREMIUM: { priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '', name: 'Premium', amount: 1999 },
  ENTERPRISE: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '', name: 'Enterprise', amount: 4999 },
};

paymentRouter.get('/plans', (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'FREE', name: 'Free', price: 0, currency: 'usd', interval: 'month', features: ['Daily horoscope', 'Basic birth chart', 'Moon phase tracker'], highlighted: false },
      { id: 'PRO', name: 'Pro', price: 9.99, currency: 'usd', interval: 'month', features: ['Everything in Free', 'AI chat astrologer', 'Compatibility analysis', 'Detailed birth chart', 'Weekly predictions'], highlighted: true },
      { id: 'PREMIUM', name: 'Premium', price: 19.99, currency: 'usd', interval: 'month', features: ['Everything in Pro', 'Unlimited AI chats', 'Numerology report', 'Tarot readings', 'Priority support', 'Ad-free experience'], highlighted: false },
      { id: 'ENTERPRISE', name: 'Enterprise', price: 49.99, currency: 'usd', interval: 'month', features: ['Everything in Premium', 'API access', 'White-label reports', 'Dedicated astrologer', 'Custom integrations', 'SLA guarantee'], highlighted: false },
    ],
  });
});

paymentRouter.get('/subscription', authenticate, async (req, res) => {
  const sub = await prisma.subscription.findUnique({
    where: { userId: req.user!.userId },
  });
  res.json({ success: true, data: sub });
});

paymentRouter.post('/create-checkout', authenticate, async (req, res) => {
  if (!stripe) throw new AppError(503, 'Payment system not configured');

  const { plan } = req.body;
  const planConfig = PLANS[plan as keyof typeof PLANS];
  if (!planConfig || plan === 'FREE') throw new AppError(400, 'Invalid plan');

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new AppError(404, 'User not found');

  let stripeCustomerId = (await prisma.subscription.findUnique({ where: { userId: user.id } }))?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
    stripeCustomerId = customer.id;
    await prisma.subscription.update({ where: { userId: user.id }, data: { stripeCustomerId } });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: planConfig.priceId, quantity: 1 }],
    success_url: `${process.env.APP_URL || 'http://localhost:4000'}/dashboard?payment=success`,
    cancel_url: `${process.env.APP_URL || 'http://localhost:4000'}/pricing?payment=canceled`,
    metadata: { userId: user.id, plan },
  });

  res.json({ success: true, data: { url: session.url } });
});

paymentRouter.post('/create-portal', authenticate, async (req, res) => {
  if (!stripe) throw new AppError(503, 'Payment system not configured');

  const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.userId } });
  if (!sub?.stripeCustomerId) throw new AppError(400, 'No customer portal available');

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.APP_URL || 'http://localhost:4000'}/dashboard/settings`,
  });

  res.json({ success: true, data: { url: portalSession.url } });
});

paymentRouter.post('/webhook', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as string;
        if (userId && plan) {
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: plan as 'PRO' | 'PREMIUM' | 'ENTERPRISE',
              status: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              trialEnd: null,
            },
          });
          await prisma.user.update({ where: { id: userId }, data: { role: 'PREMIUM' } });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const dbSub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: sub.id } });
        if (dbSub) {
          await prisma.subscription.update({ where: { id: dbSub.id }, data: { status: 'CANCELED', canceledAt: new Date() } });
          await prisma.user.update({ where: { id: dbSub.userId }, data: { role: 'USER' } });
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (error) {
    logger.error({ error }, 'Webhook handling failed');
    res.status(500).json({ error: 'Webhook handling failed' });
  }
});
