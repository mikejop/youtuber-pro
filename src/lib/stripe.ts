import { loadStripe, Stripe } from '@stripe/stripe-js';

/**
 * Client-Side Stripe Loader Singleton & Checkout Trigger
 * Security Note: Only VITE_STRIPE_PUBLISHABLE_KEY and VITE_STRIPE_PRICE_ID are loaded in browser environment.
 * The Secret Key (sk_live_...) MUST NEVER be referenced in client-side TypeScript.
 */

let stripePromise: Promise<Stripe | null>;

export const DEFAULT_PRICE_ID =
  (import.meta as any).env?.VITE_STRIPE_PRICE_ID || 'price_1U1M973VfcJ3qJcs97vRW0op';

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.warn(
        '[Stripe Warning]: VITE_STRIPE_PUBLISHABLE_KEY is not defined in environment variables.'
      );
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Trigger client-side Stripe Checkout session with official price_1U1M973VfcJ3qJcs97vRW0op
 */
export const handleStripeCheckout = async (priceId: string = DEFAULT_PRICE_ID) => {
  try {
    const stripe = await getStripe();
    if (!stripe) {
      console.warn('[Stripe Warning]: Unable to load Stripe JS SDK.');
      return;
    }

    const { error } = await (stripe as any).redirectToCheckout({
      lineItems: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      successUrl: `${window.location.origin}/?checkout=success`,
      cancelUrl: `${window.location.origin}/?checkout=canceled`,
    });

    if (error) {
      console.error('[Stripe Checkout Error]:', error.message);
    }
  } catch (err) {
    console.error('[Stripe Execution Error]:', err);
  }
};
