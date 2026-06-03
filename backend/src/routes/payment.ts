import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../lib/errors.js';
import { logger } from '../lib/logger.js';
import { getPricing, getCountryCode, REGIONAL_PRICING } from '../../../shared/config/pricing.js';

export const paymentRouter = Router();

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-15' as Stripe.LatestApiVersion })
  : null;

paymentRouter.get('/currencies', (_req, res) => {
  const currencies = Object.entries(REGIONAL_PRICING).map(([code, config]) => ({
    countryCode: code,
    currency: config.currency,
    flag: config.flag,
    plans: config.plans,
  }));
  res.json({ success: true, data: currencies });
});

paymentRouter.get('/plans', (req, res) => {
  const countryName = typeof req.query.country === 'string' ? req.query.country.slice(0, 100) : undefined;
  const countryCode = getCountryCode(countryName);
  const config = getPricing(countryCode);
  const { currency } = config;
  const basePlans = [
    { id: 'FREE', name: 'Free', price: 0, currency: currency.code, interval: 'month', features: ['Daily horoscope', 'Basic birth chart', 'Moon phase tracker'], highlighted: false },
    { id: 'PRO', name: 'Pro', price: config.plans.PRO.monthly, currency: currency.code, interval: 'month', features: ['Everything in Free', 'AI chat astrologer', 'Compatibility analysis', 'Detailed birth chart', 'Weekly predictions'], highlighted: true },
    { id: 'PREMIUM', name: 'Premium', price: config.plans.PREMIUM.monthly, currency: currency.code, interval: 'month', features: ['Everything in Pro', 'Unlimited AI chats', 'Numerology report', 'Tarot readings', 'Priority support', 'Ad-free'], highlighted: false },
    { id: 'ENTERPRISE', name: 'Enterprise', price: config.plans.ENTERPRISE.monthly, currency: currency.code, interval: 'month', features: ['Everything in Premium', 'API access', 'White-label reports', 'Dedicated astrologer', 'Custom integrations', 'SLA guarantee'], highlighted: false },
  ];
  const data = basePlans.map((p) => ({ ...p, price: p.price, displayPrice: p.price }));
  res.json({ success: true, data });
});

paymentRouter.get('/subscription', authenticate, asyncHandler(async (req, res) => {
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.userId } });
  res.json({ success: true, data: sub });
}));

paymentRouter.post('/create-checkout', authenticate, asyncHandler(async (req, res) => {
  if (!stripe) throw new AppError(503, 'Payment system is not configured');

  const { plan, currency: reqCurrency } = req.body;
  const validPlans = ['PRO', 'PREMIUM', 'ENTERPRISE'];
  if (!validPlans.includes(plan)) throw new AppError(400, 'Invalid plan selected');

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) throw new AppError(404, 'User not found');

  let sub = await prisma.subscription.findUnique({ where: { userId: user.id } });
  let stripeCustomerId = sub?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
    stripeCustomerId = customer.id;
    await prisma.subscription.update({ where: { userId: user.id }, data: { stripeCustomerId } });
  }

  const priceEnvKey = `STRIPE_${plan}_PRICE_ID`;
  const priceId = process.env[priceEnvKey];
  if (!priceId) throw new AppError(500, `Payment configuration missing for ${plan} plan`);

  const userCurrency = reqCurrency || getPricing(getCountryCode(user.country)).currency.code;
  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    currency: userCurrency.toLowerCase(),
    success_url: `${process.env.APP_URL || 'http://localhost:4000'}/dashboard?payment=success`,
    cancel_url: `${process.env.APP_URL || 'http://localhost:4000'}/pricing?payment=canceled`,
    metadata: { userId: user.id, plan, currency: userCurrency },
  });

  res.json({ success: true, data: { url: session.url } });
}));

paymentRouter.post('/create-portal', authenticate, asyncHandler(async (req, res) => {
  if (!stripe) throw new AppError(503, 'Payment system not configured');
  const sub = await prisma.subscription.findUnique({ where: { userId: req.user!.userId } });
  if (!sub?.stripeCustomerId) throw new AppError(400, 'No billing portal available');
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.APP_URL || 'http://localhost:4000'}/dashboard/settings`,
  });
  res.json({ success: true, data: { url: portalSession.url } });
}));

paymentRouter.post('/webhook', asyncHandler(async (req, res) => {
  if (!stripe) return res.status(503).json({ success: false, error: 'Stripe not configured' });

  const sig = req.headers['stripe-signature'] as string;
  const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(JSON.stringify(req.body));
  if (!rawBody || rawBody.length === 0) return res.status(400).json({ success: false, error: 'Raw body required for webhook verification' });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    return res.status(400).json({ success: false, error: 'Invalid webhook signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan as string;
        const validPlans = ['PRO', 'PREMIUM', 'ENTERPRISE'] as const;
        if (userId && plan && validPlans.includes(plan as typeof validPlans[number])) {
          const validatedPlan = plan as 'PRO' | 'PREMIUM' | 'ENTERPRISE';
          await prisma.subscription.update({
            where: { userId },
            data: {
              plan: validatedPlan,
              status: 'ACTIVE',
              stripeSubscriptionId: session.subscription as string,
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              trialEnd: null,
            },
          });
          const roleMap: Record<string, 'USER' | 'PREMIUM'> = { PRO: 'USER', PREMIUM: 'PREMIUM', ENTERPRISE: 'PREMIUM' };
          await prisma.user.update({ where: { id: userId }, data: { role: roleMap[validatedPlan] || 'PREMIUM' } });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subEvent = event.data.object as Stripe.Subscription;
        const dbSub = await prisma.subscription.findFirst({ where: { stripeSubscriptionId: subEvent.id } });
        if (dbSub) {
          await prisma.subscription.update({ where: { id: dbSub.id }, data: { status: 'CANCELED', canceledAt: new Date() } });
          await prisma.user.update({ where: { id: dbSub.userId }, data: { role: 'USER' } });
        }
        break;
      }
    }
    res.json({ received: true });
  } catch (error: unknown) {
    logger.error({ error }, 'Webhook handling failed');
    res.status(500).json({ success: false, error: 'Webhook handling failed' });
  }
}));
