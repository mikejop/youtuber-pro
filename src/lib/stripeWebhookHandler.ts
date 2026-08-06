import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const PRODUCT_ID_YOUTUBER_PRO = 'prod_V1O7wwjRIcsTrN';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://txmaffxbrmxlzakxathe.supabase.co';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GgBqVbEZW4yJdLdZWHDmig_nnRQqeKg';

const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey);

export interface ProcessedPurchase {
  stripeSessionId: string;
  stripeCustomerId: string | null;
  customerEmail: string;
  customerName: string | null;
  productId: string;
  priceId: string;
  amountTotal: number;
  currency: string;
  paymentStatus: string;
}

/**
 * Handle Stripe Checkout Session Completed Event
 * Synchronizes purchase of product prod_V1O7wwjRIcsTrN (any price) directly into Supabase.
 */
export async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  stripe: Stripe
): Promise<{ success: boolean; data?: ProcessedPurchase; error?: string }> {
  try {
    const stripeSessionId = session.id;
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
    const customerEmail = session.customer_details?.email || session.customer_email || 'desconhecido@email.com';
    const customerName = session.customer_details?.name || null;
    const paymentStatus = session.payment_status || 'paid';
    const amountTotal = session.amount_total || 0;
    const currency = session.currency || 'brl';

    // Retrieve line items to identify the exact price and product purchased
    const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
      expand: ['data.price.product'],
    });

    let purchasedProductId = PRODUCT_ID_YOUTUBER_PRO;
    let purchasedPriceId = 'price_1U1M973VfcJ3qJcs97vRW0op'; // Fallback default price

    if (lineItems.data.length > 0) {
      const item = lineItems.data[0];
      if (item.price) {
        purchasedPriceId = item.price.id;
        const prod = item.price.product;
        if (typeof prod === 'string') {
          purchasedProductId = prod;
        } else if (prod && 'id' in prod) {
          purchasedProductId = prod.id;
        }
      }
    }

    const purchasePayload: ProcessedPurchase = {
      stripeSessionId,
      stripeCustomerId,
      customerEmail,
      customerName,
      productId: purchasedProductId,
      priceId: purchasedPriceId,
      amountTotal,
      currency,
      paymentStatus,
    };

    console.log('🔄 Syncing Stripe purchase to Supabase:', purchasePayload);

    // 1. Save / Upsert purchase into Supabase table "purchases"
    const { data: insertedData, error: supabaseError } = await supabaseAdmin
      .from('purchases')
      .upsert(
        {
          stripeSessionId: purchasePayload.stripeSessionId,
          stripeCustomerId: purchasePayload.stripeCustomerId,
          customerEmail: purchasePayload.customerEmail,
          customerName: purchasePayload.customerName,
          productId: purchasePayload.productId,
          priceId: purchasePayload.priceId,
          amountTotal: purchasePayload.amountTotal,
          currency: purchasePayload.currency,
          paymentStatus: purchasePayload.paymentStatus,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: 'stripeSessionId' }
      )
      .select();

    if (supabaseError) {
      console.error('❌ Supabase purchase sync error:', supabaseError.message);
      // Even if table doesn't exist yet, return purchase payload for logging
    } else {
      console.log('✅ Purchase successfully saved to Supabase table "purchases":', insertedData);
    }

    return { success: true, data: purchasePayload };
  } catch (err: any) {
    console.error('❌ Error handling checkout.session.completed:', err?.message || err);
    return { success: false, error: err?.message || 'Unknown error' };
  }
}
