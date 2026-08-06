import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const DEFAULT_PRICE_ID =
  (import.meta as any).env?.VITE_STRIPE_PRICE_ID || 'price_1U1M973VfcJ3qJcs97vRW0op';

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    const publishableKey = (import.meta as any).env?.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51U1LspVfcJ3qJcs9Nl7K2a';

    if (!publishableKey) {
      console.warn('[Stripe Warning]: VITE_STRIPE_PUBLISHABLE_KEY is not defined.');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * Chama a Edge Function para criar um PaymentIntent seguro no backend Stripe
 */
export const createPaymentIntentServer = async ({
  email,
  name,
  phone,
  cpfCnpj,
  address,
  couponCode,
}: {
  email: string;
  name: string;
  phone?: string;
  cpfCnpj?: string;
  address?: string;
  couponCode?: string;
}): Promise<{ clientSecret: string; amount: number } | null> => {
  try {
    const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, phone, cpfCnpj, address, couponCode }),
    });

    const data = await res.json();
    if (data.clientSecret) {
      return { clientSecret: data.clientSecret, amount: data.amount };
    }
    console.error('Erro no createPaymentIntentServer:', data.error);
    return null;
  } catch (err) {
    console.error('Erro de rede no createPaymentIntentServer:', err);
    return null;
  }
};

export const handleStripeCheckout = (_priceId?: string) => {
  window.location.href = '/criar-conta';
};

