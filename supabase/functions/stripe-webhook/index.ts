import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || '';

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const PRODUCT_ID_YOUTUBER_PRO = 'prod_V1O7wwjRIcsTrN';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const signature = req.headers.get('stripe-signature');
  const bodyText = await req.text();

  let event: Stripe.Event;

  try {
    if (stripeWebhookSecret && signature) {
      event = await stripe.webhooks.constructEventAsync(bodyText, signature, stripeWebhookSecret);
    } else {
      event = JSON.parse(bodyText);
    }
  } catch (err: any) {
    console.error(`❌ Signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const stripeSessionId = session.id;
    const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
    const customerEmail = session.customer_details?.email || session.customer_email || 'desconhecido@email.com';
    const customerName = session.customer_details?.name || null;
    const paymentStatus = session.payment_status || 'paid';
    const amountTotal = session.amount_total || 0;
    const currency = session.currency || 'brl';

    // Retrieve line items to identify the exact price and product purchased
    let purchasedProductId = PRODUCT_ID_YOUTUBER_PRO;
    let purchasedPriceId = 'price_1U1M973VfcJ3qJcs97vRW0op';

    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
        expand: ['data.price.product'],
      });

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
    } catch (lineErr: any) {
      console.warn('⚠️ Could not fetch line items:', lineErr.message);
    }

    console.log('🔄 Edge Function: Syncing Stripe purchase to Supabase:', {
      stripeSessionId,
      customerEmail,
      purchasedProductId,
      purchasedPriceId,
      amountTotal,
    });

    // 1. Save purchase details to Supabase table "purchases"
    const { data: insertedData, error: dbError } = await supabaseAdmin
      .from('purchases')
      .upsert(
        {
          stripeSessionId,
          stripeCustomerId,
          customerEmail,
          customerName,
          productId: purchasedProductId,
          priceId: purchasedPriceId,
          amountTotal,
          currency,
          paymentStatus,
          updatedAt: new Date().toISOString(),
        },
        { onConflict: 'stripeSessionId' }
      )
      .select();

    if (dbError) {
      console.error('❌ Supabase DB insert error:', dbError.message);
    } else {
      console.log('✅ Purchase saved to Supabase DB via Edge Function:', insertedData);
    }

    // 2. Automatically Create & Invite the user in Supabase Authentication (auth.users)
    try {
      const originUrl = Deno.env.get('SITE_URL') || 'https://youtuber-pro.vercel.app';
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(customerEmail, {
        redirectTo: `${originUrl}/definir-senha`,
        data: {
          full_name: customerName,
          purchased_product_id: purchasedProductId,
        },
      });

      if (authError) {
        console.warn('ℹ️ Supabase Auth Invite note (user may already exist):', authError.message);
      } else {
        console.log('✉️ User invited and created in Supabase Auth:', authUser.user?.email);
      }
    } catch (inviteErr: any) {
      console.error('⚠️ Could not invite user via Supabase Auth Admin:', inviteErr.message);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
