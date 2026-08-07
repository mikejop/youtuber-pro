import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, userId } = await req.json();

    if (!email || !email.trim()) {
      return new Response(JSON.stringify({ paid: false, reason: 'Email não informado' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. PRIMEIRO PASSO: Verificar no Supabase na tabela 'subscribers'
    const { data: dbSub } = await supabaseAdmin
      .from('subscribers')
      .select('status, id, email')
      .or(`email.eq.${cleanEmail}${userId ? `,id.eq.${userId}` : ''}`)
      .maybeSingle();

    if (dbSub?.status === 'active') {
      console.log(`[check-subscription] Cliente PAGO encontrado no Supabase: ${cleanEmail}`);
      return new Response(
        JSON.stringify({ paid: true, source: 'supabase', status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // 2. SEGUNDO PASSO: Fallback para a API da Stripe (se não achou no Supabase ou inativo)
    console.log(`[check-subscription] Não encontrado no Supabase como pago. Buscando na Stripe para: ${cleanEmail}`);

    let isStripePaid = false;
    let stripeCustomerId: string | null = null;

    // 2.1 Buscar PaymentIntents concluídos na Stripe
    try {
      const paymentIntents = await stripe.paymentIntents.list({ limit: 100 });
      const matchingPi = paymentIntents.data.find(
        (pi) =>
          pi.status === 'succeeded' &&
          (pi.receipt_email?.toLowerCase() === cleanEmail ||
            pi.metadata?.customer_email?.toLowerCase() === cleanEmail)
      );

      if (matchingPi) {
        isStripePaid = true;
        if (typeof matchingPi.customer === 'string') {
          stripeCustomerId = matchingPi.customer;
        }
      }
    } catch (piErr: any) {
      console.warn('⚠️ Erro ao listar PaymentIntents na Stripe:', piErr.message);
    }

    // 2.2 Se não encontrou nos PaymentIntents, busca em Customers & Checkout Sessions
    if (!isStripePaid) {
      try {
        const customers = await stripe.customers.list({ email: cleanEmail, limit: 1 });
        if (customers.data.length > 0) {
          const cust = customers.data[0];
          stripeCustomerId = cust.id;

          const sessions = await stripe.checkout.sessions.list({ customer: cust.id, limit: 10 });
          const paidSession = sessions.data.find((s) => s.payment_status === 'paid');
          if (paidSession) {
            isStripePaid = true;
          }
        }
      } catch (custErr: any) {
        console.warn('⚠️ Erro ao listar Customers/Sessions na Stripe:', custErr.message);
      }
    }

    // 3. TERCEIRO PASSO: Se a Stripe confirmou o pagamento, salva automaticamente no Supabase!
    if (isStripePaid) {
      console.log(`[check-subscription] Stripe confirmou pagamento de ${cleanEmail}! Sincronizando com Supabase...`);

      const payload: any = {
        email: cleanEmail,
        status: 'active',
        updated_at: new Date().toISOString(),
      };
      if (userId) payload.id = userId;
      if (stripeCustomerId) payload.stripe_customer_id = stripeCustomerId;

      const { error: upsertErr } = await supabaseAdmin
        .from('subscribers')
        .upsert(payload, { onConflict: 'email' });

      if (upsertErr) {
        console.error('⚠️ Erro ao auto-sincronizar cliente pago no Supabase:', upsertErr.message);
      }

      return new Response(
        JSON.stringify({ paid: true, source: 'stripe_synced', status: 'active' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Se nem no Supabase nem na Stripe constar pagamento
    return new Response(
      JSON.stringify({ paid: false, source: 'none', status: dbSub?.status || 'inactive' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Erro na Edge Function check-subscription:', err);
    return new Response(
      JSON.stringify({ paid: false, error: err.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
