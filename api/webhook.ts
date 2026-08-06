import type { Request, Response } from 'express';
import Stripe from 'stripe';
import { handleCheckoutSessionCompleted } from '../src/lib/stripeWebhookHandler';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-02-24.acacia' as any })
  : null;

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!stripe) {
    return res.status(500).json({ error: 'Stripe is not configured on server.' });
  }

  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    const rawBody = (req as any).rawBody || req.body;
    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } else {
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const result = await handleCheckoutSessionCompleted(session, stripe);
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(200).json({ received: true });
}
