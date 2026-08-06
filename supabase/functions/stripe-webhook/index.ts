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

/**
 * Helper to resolve user_id from auth.users by email
 */
async function getUserIdByEmail(email: string): Promise<string | null> {
  try {
    const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error || !usersData?.users) return null;
    const targetUser = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );
    return targetUser?.id || null;
  } catch (err: any) {
    console.warn('⚠️ Could not resolve user_id by email:', err.message);
    return null;
  }
}

/**
 * Helper to upsert into subscribers table securely with service_role key
 */
async function upsertSubscriberRecord({
  email,
  stripeCustomerId,
  status,
  userId,
}: {
  email: string;
  stripeCustomerId?: string | null;
  status: string;
  userId?: string | null;
}) {
  const cleanEmail = email.toLowerCase().trim();
  const resolvedUserId = userId || (await getUserIdByEmail(cleanEmail));

  if (!resolvedUserId) {
    console.warn(`⚠️ Warning: No Auth user ID found for ${cleanEmail}. Upserting subscriber by email.`);
  }

  const payload: any = {
    email: cleanEmail,
    status: status,
    updated_at: new Date().toISOString(),
  };

  if (resolvedUserId) {
    payload.id = resolvedUserId;
  }
  if (stripeCustomerId) {
    payload.stripe_customer_id = stripeCustomerId;
  }

  const { data, error } = await supabaseAdmin
    .from('subscribers')
    .upsert(payload, { onConflict: 'email' })
    .select();

  if (error) {
    console.error(`❌ Error updating subscriber (${cleanEmail}) -> status=${status}:`, error.message);
  } else {
    console.log(`✅ Subscriber status updated (${cleanEmail}) -> status=${status}:`, data);
  }
}

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

  console.log(`🔔 Stripe Webhook Received: ${event.type}`);

  switch (event.type) {
    // 1. COMPRA OU ASSINATURA CONCLUÍDA
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const stripeSessionId = session.id;
      const stripeCustomerId = typeof session.customer === 'string' ? session.customer : session.customer?.id || null;
      const customerEmail = session.customer_details?.email || session.customer_email || 'desconhecido@email.com';
      const customerName = session.customer_details?.name || null;
      const paymentStatus = session.payment_status || 'paid';
      const amountTotal = session.amount_total || 0;
      const currency = session.currency || 'brl';

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

      // 1.1 Salvar compra na tabela "purchases"
      await supabaseAdmin.from('purchases').upsert(
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
      );

      // 1.2 Convidar/Criar usuário no Supabase Auth
      let createdUserId: string | null = null;
      try {
        const originUrl = Deno.env.get('SITE_URL') || 'https://youtuber-pro.vercel.app';
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(customerEmail, {
          redirectTo: `${originUrl}/definir-senha`,
          data: {
            full_name: customerName,
            purchased_product_id: purchasedProductId,
          },
        });

        if (authUser?.user) {
          createdUserId = authUser.user.id;
        } else if (authError) {
          createdUserId = await getUserIdByEmail(customerEmail);
        }
      } catch (inviteErr: any) {
        console.error('⚠️ Could not invite user via Auth Admin:', inviteErr.message);
      }

      // 1.3 Atualizar a tabela "subscribers" com status='active'
      await upsertSubscriberRecord({
        email: customerEmail,
        stripeCustomerId: stripeCustomerId,
        status: 'active',
        userId: createdUserId,
      });

      break;
    }

    // 2. ASSINATURA ATUALIZADA (Status alterado)
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;
      const status = subscription.status; // active, past_due, canceled, trialing, etc.

      // Tenta recuperar o email do customer na Stripe se disponível
      let customerEmail: string | null = null;
      if (stripeCustomerId) {
        try {
          const cust = await stripe.customers.retrieve(stripeCustomerId);
          if (!cust.deleted) {
            customerEmail = cust.email;
          }
        } catch (e: any) {
          console.warn('⚠️ Could not retrieve customer email:', e.message);
        }
      }

      if (customerEmail) {
        await upsertSubscriberRecord({
          email: customerEmail,
          stripeCustomerId: stripeCustomerId,
          status: status,
        });
      }
      break;
    }

    // 3. ASSINATURA CANCELADA
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id || null;

      let customerEmail: string | null = null;
      if (stripeCustomerId) {
        try {
          const cust = await stripe.customers.retrieve(stripeCustomerId);
          if (!cust.deleted) {
            customerEmail = cust.email;
          }
        } catch (e: any) {
          console.warn('⚠️ Could not retrieve customer email:', e.message);
        }
      }

      if (customerEmail) {
        await upsertSubscriberRecord({
          email: customerEmail,
          stripeCustomerId: stripeCustomerId,
          status: 'canceled',
        });
      }
      break;
    }

    // 4. FALHA NO PAGAMENTO DA FATURA
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id || null;
      const customerEmail = invoice.customer_email || null;

      if (customerEmail) {
        await upsertSubscriberRecord({
          email: customerEmail,
          stripeCustomerId: stripeCustomerId,
          status: 'past_due',
        });
      }
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
});
