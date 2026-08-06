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
    const { code } = await req.json();
    const cleanCode = (code || '').trim();

    if (!cleanCode) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Código de cupom não informado.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // 1. Busca por Código de Promoção Ativo na Stripe
    let promotionCodeObj: Stripe.PromotionCode | null = null;
    let couponObj: Stripe.Coupon | null = null;

    try {
      const promoList = await stripe.promotionCodes.list({
        code: cleanCode,
        active: true,
        limit: 1,
      });

      if (promoList.data.length > 0) {
        promotionCodeObj = promoList.data[0];
        couponObj = promotionCodeObj.coupon;
      }
    } catch (e: any) {
      console.warn('Nota busca promotionCodes:', e.message);
    }

    // 2. Fallback: Busca por ID direto do Cupom na Stripe
    if (!couponObj) {
      try {
        const retrievedCoupon = await stripe.coupons.retrieve(cleanCode);
        if (retrievedCoupon && retrievedCoupon.valid) {
          couponObj = retrievedCoupon;
        }
      } catch (e: any) {
        console.warn('Nota busca coupons:', e.message);
      }
    }

    if (!couponObj || !couponObj.valid) {
      return new Response(
        JSON.stringify({ valid: false, message: 'Cupom inválido, inativo ou expirado.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        code: cleanCode.toUpperCase(),
        couponId: couponObj.id,
        promotionCodeId: promotionCodeObj?.id || null,
        percentOff: couponObj.percent_off || null,
        amountOff: couponObj.amount_off ? couponObj.amount_off / 100 : null,
        currency: couponObj.currency || 'brl',
        name: couponObj.name || cleanCode.toUpperCase(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Erro na Edge Function validate-coupon:', err);
    return new Response(
      JSON.stringify({ valid: false, message: 'Erro ao validar cupom na Stripe.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
