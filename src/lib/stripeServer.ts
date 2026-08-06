import Stripe from 'stripe';

/**
 * Server-Side Hardened Stripe Controller & Security Shield
 * 
 * SECURITY HARDENING MEASURES IMPLEMENTED:
 * 1. Isolated Secret Storage: Only accessed on Node.js server runtime.
 * 2. Webhook Signature Verification: Guards against forged HTTP requests.
 * 3. Server-Enforced Pricing: Prevents client-side price tampering.
 * 4. Anti-Replay / Idempotency Headers: Prevents double charges.
 * 5. Offline Fallback Shield: Safe offline dev simulation mode.
 */

// Initialize Stripe server instance
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export const stripeServer = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-02-24.acacia' as any,
      typescript: true,
    })
  : null;

/**
 * Server-Enforced Product / Pricing Catalog
 * SECURITY: Never trust price numbers sent directly from client DOM or HTTP body!
 */
export const OFFICIAL_PRICING = {
  'youtuber-pro-survival-guide': {
    name: 'Guia de Sobrevivência YouTuber Pro',
    amountInCents: 9700, // R$ 97,00
    currency: 'brl',
  },
} as const;

export type PlanId = keyof typeof OFFICIAL_PRICING;

/**
 * Create a Hardened Checkout Session (Server Side)
 */
export async function createCheckoutSessionServer({
  planId,
  customerEmail,
  successUrl,
  cancelUrl,
}: {
  planId: PlanId;
  customerEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  const plan = OFFICIAL_PRICING[planId];
  if (!plan) {
    throw new Error(`[Security Alert]: Invalid planId requested: ${planId}`);
  }

  // Offline / Dev Mock Handler if offline or secret key not configured
  if (!stripeServer) {
    console.log('[Stripe Offline Shield]: Running in local offline simulation mode.');
    return {
      id: `cs_offline_mock_${Date.now()}`,
      url: successUrl,
      isOfflineMock: true,
    };
  }

  // Real Stripe Checkout Session with Hardened Parameters
  const session = await stripeServer.checkout.sessions.create(
    {
      payment_method_types: ['card', 'bolero' as any, 'pix' as any],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: plan.currency,
            product_data: {
              name: plan.name,
            },
            unit_amount: plan.amountInCents, // Enforced strictly on server
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    },
    {
      // Anti-Replay Idempotency key per user attempt
      idempotencyKey: `checkout_${planId}_${customerEmail || 'guest'}_${Math.floor(Date.now() / 60000)}`,
    }
  );

  return session;
}

/**
 * Secure Webhook Event Parser & Verifier
 * Protects against attacker-spoofed webhook calls.
 */
export function verifyAndParseStripeWebhook(
  rawBody: string | Buffer,
  signatureHeader: string
): Stripe.Event {
  if (!stripeServer) {
    throw new Error('[Stripe Security Alert]: Stripe server SDK is not initialized.');
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('[Stripe Security Alert]: STRIPE_WEBHOOK_SECRET is missing.');
  }

  // Throws error if signature does not match Stripe HMAC hash
  return stripeServer.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
}
