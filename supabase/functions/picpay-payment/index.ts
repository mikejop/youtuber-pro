import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

// Configurações e Credenciais de Servidor PicPay (Protegidas)
const PICPAY_CLIENT_ID = Deno.env.get('PICPAY_CLIENT_ID') || '33f183d9-a3df-4fe3-bcbd-bc0165e38d93';
const PICPAY_CLIENT_SECRET = Deno.env.get('PICPAY_CLIENT_SECRET') || 'a5wNQcLgscVlvMdqiKxHWJdztFKP2MNY';
const PICPAY_SELLER_TOKEN = Deno.env.get('PICPAY_SELLER_TOKEN') || PICPAY_CLIENT_SECRET;

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-picpay-token',
};

interface PicPayPaymentPayload {
  referenceId: string;
  callbackUrl?: string;
  returnUrl?: string;
  value: number;
  expiresAt?: string;
  buyer: {
    firstName: string;
    lastName: string;
    document: string; // CPF / CNPJ
    email: string;
    phone: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // A) ROTA DE NOTIFICAÇÃO / WEBHOOK DO PICPAY (IPN)
    if (url.pathname.endsWith('/notification') || req.headers.get('x-picpay-token')) {
      const payload = await req.json();
      console.log('🔔 Callback Notificação PicPay Recebida:', payload);

      const referenceId = payload.referenceId;
      const authorizationId = payload.authorizationId;

      if (referenceId) {
        // Consultar Status Oficial do Pagamento na API do PicPay
        const picPayRes = await fetch(`https://appws.picpay.com/ecommerce/public/payments/${referenceId}/status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-picpay-token': PICPAY_SELLER_TOKEN,
          },
        });

        if (picPayRes.ok) {
          const statusData = await picPayRes.json();
          console.log(`ℹ️ Status do Pagamento PicPay (${referenceId}):`, statusData);

          if (statusData.status === 'paid' || statusData.status === 'completed') {
            const customerEmail = statusData.buyer?.email || payload.buyerEmail;

            if (customerEmail) {
              // Atualizar status no Supabase Database
              await supabaseAdmin.from('subscribers').upsert(
                {
                  email: customerEmail.toLowerCase().trim(),
                  status: 'active',
                  updated_at: new Date().toISOString(),
                },
                { onConflict: 'email' }
              );
              console.log(`✅ Acesso liberado no Supabase para cliente PicPay: ${customerEmail}`);
            }
          }
        }
      }

      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // B) ROTA DE CRIAÇÃO DE PAGAMENTO PICPAY (PAYMENT INTENT / PIX)
    const body: PicPayPaymentPayload = await req.json();
    const { referenceId, value, buyer, callbackUrl, returnUrl } = body;

    if (!buyer || !buyer.email || !buyer.document) {
      return new Response(
        JSON.stringify({ error: 'Dados do comprador incompletos (e-mail e CPF são obrigatórios).' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const orderRef = referenceId || `YTP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const paymentValue = value || 67.0; // Valor padrão YouTuber Pro R$ 67,00

    const siteOrigin = Deno.env.get('SITE_URL') || 'https://youtuber-pro.vercel.app';

    const picpayRequestBody = {
      referenceId: orderRef,
      callbackUrl: callbackUrl || `${supabaseUrl}/functions/v1/picpay-payment/notification`,
      returnUrl: returnUrl || `${siteOrigin}/?checkout=success`,
      value: paymentValue,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(), // 24 horas expiração
      buyer: {
        firstName: buyer.firstName || 'Cliente',
        lastName: buyer.lastName || 'YouTuber Pro',
        document: buyer.document.replace(/\D/g, ''),
        email: buyer.email.toLowerCase().trim(),
        phone: buyer.phone ? buyer.phone.replace(/\D/g, '') : '11999999999',
      },
    };

    console.log('🚀 Solicitando Pagamento PicPay API:', orderRef, buyer.email);

    const picPayResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-picpay-token': PICPAY_SELLER_TOKEN,
      },
      body: JSON.stringify(picpayRequestBody),
    });

    const picPayData = await picPayResponse.json();

    if (!picPayResponse.ok) {
      console.error('❌ Erro API PicPay:', picPayData);
      return new Response(
        JSON.stringify({ error: picPayData.message || 'Erro ao gerar pagamento na API PicPay.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: picPayResponse.status }
      );
    }

    console.log('✅ Pagamento PicPay Gerado com Sucesso:', picPayData.paymentUrl);

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: orderRef,
        paymentUrl: picPayData.paymentUrl,
        qrcode: picPayData.qrcode,
        expiresAt: picPayData.expiresAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Erro na Edge Function PicPay:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno ao comunicar com o PicPay.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
