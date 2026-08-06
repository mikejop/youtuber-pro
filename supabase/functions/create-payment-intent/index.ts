import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.14.0?target=deno';

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || '';
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email, name, phone, cpfCnpj, address, couponCode } = await req.json();

    const BASE_AMOUNT_CENTS = 6700; // R$ 67,00
    let finalAmountCents = BASE_AMOUNT_CENTS;
    let appliedCouponName = '';

    // Validação de Cupom na Stripe caso tenha sido informado
    if (couponCode && couponCode.trim()) {
      const codeClean = couponCode.trim().toUpperCase();
      let couponObj: Stripe.Coupon | null = null;

      try {
        const promoList = await stripe.promotionCodes.list({ code: codeClean, active: true, limit: 1 });
        if (promoList.data.length > 0) {
          couponObj = promoList.data[0].coupon;
        }
      } catch (e: any) {
        console.warn('Nota busca promoCodes:', e.message);
      }

      if (!couponObj) {
        try {
          const ret = await stripe.coupons.retrieve(codeClean);
          if (ret && ret.valid) couponObj = ret;
        } catch (e: any) {
          console.warn('Nota busca coupon:', e.message);
        }
      }

      if (couponObj && couponObj.valid) {
        if (couponObj.percent_off) {
          finalAmountCents = Math.max(0, Math.round(BASE_AMOUNT_CENTS * (1 - couponObj.percent_off / 100)));
        } else if (couponObj.amount_off) {
          finalAmountCents = Math.max(0, BASE_AMOUNT_CENTS - couponObj.amount_off);
        }
        appliedCouponName = couponObj.id;
      }
    }

    // Criar o PaymentIntent oficial na API da Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmountCents,
      currency: 'brl',
      receipt_email: email || undefined,
      description: 'YouTuber Pro - Playbook Visual & Masterclass',
      metadata: {
        customer_email: email || '',
        customer_name: name || '',
        phone: phone || '',
        cpf_cnpj: cpfCnpj || '',
        address: address || '',
        applied_coupon: appliedCouponName || 'none',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        amount: finalAmountCents,
        id: paymentIntent.id,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Erro na Edge Function create-payment-intent:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Erro ao criar intenção de pagamento na Stripe.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
