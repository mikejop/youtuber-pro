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

/**
 * Autenticação PicPay OAuth2 (Troca de client_id e client_secret por Access Token Bearer)
 * Endpoint oficial: POST https://checkout-api.picpay.com/oauth2/token
 */
async function getPicPayAccessToken(): Promise<string | null> {
  try {
    const authRes = await fetch('https://checkout-api.picpay.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: PICPAY_CLIENT_ID,
        client_secret: PICPAY_CLIENT_SECRET,
      }),
    });

    if (!authRes.ok) {
      const errText = await authRes.text();
      console.warn('⚠️ Nota OAuth2 PicPay checkout-api:', authRes.status, errText);
      return null;
    }

    const authData = await authRes.json();
    if (authData.access_token) {
      console.log('✅ Access Token Bearer PicPay obtido com sucesso!');
      return authData.access_token;
    }
    return null;
  } catch (err: any) {
    console.warn('⚠️ Exceção ao obter token OAuth2 PicPay:', err.message);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);

  try {
    // 1. Obter o Bearer Access Token da API do PicPay
    const accessToken = await getPicPayAccessToken();

    // 2. Montar headers com autenticação Bearer ou fallback com x-picpay-token
    const apiHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      apiHeaders['Authorization'] = `Bearer ${accessToken}`;
    } else {
      apiHeaders['x-picpay-token'] = PICPAY_SELLER_TOKEN;
    }

    // A) ROTA DE NOTIFICAÇÃO / WEBHOOK DO PICPAY (IPN)
    if (url.pathname.endsWith('/notification') || req.headers.get('x-picpay-token')) {
      const payload = await req.json();
      console.log('🔔 Callback Notificação PicPay Recebida:', payload);

      const referenceId = payload.referenceId;

      if (referenceId) {
        // Consultar Status Oficial do Pagamento na API do PicPay com Autenticação Bearer
        let statusRes = await fetch(`https://checkout-api.picpay.com/v1/payments/${referenceId}/status`, {
          method: 'GET',
          headers: apiHeaders,
        });

        if (!statusRes.ok) {
          statusRes = await fetch(`https://appws.picpay.com/ecommerce/public/payments/${referenceId}/status`, {
            method: 'GET',
            headers: { ...apiHeaders, 'x-picpay-token': PICPAY_SELLER_TOKEN },
          });
        }

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          console.log(`ℹ️ Status do Pagamento PicPay (${referenceId}):`, statusData);

          if (statusData.status === 'paid' || statusData.status === 'completed') {
            const customerEmail = statusData.buyer?.email || payload.buyerEmail;

            if (customerEmail) {
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

    // B) ROTA DE CRIAÇÃO DE PAGAMENTO PICPAY
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
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      buyer: {
        firstName: buyer.firstName || 'Cliente',
        lastName: buyer.lastName || 'YouTuber Pro',
        document: buyer.document.replace(/\D/g, ''),
        email: buyer.email.toLowerCase().trim(),
        phone: buyer.phone ? buyer.phone.replace(/\D/g, '') : '11999999999',
      },
    };

    console.log('🚀 Solicitando Pagamento PicPay API (Bearer OAuth2):', orderRef, buyer.email);

    // Tenta primeiro o endpoint oficial Checkout API com Bearer token
    let picPayResponse = await fetch('https://checkout-api.picpay.com/v1/payments', {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(picpayRequestBody),
    });

    if (!picPayResponse.ok) {
      // Fallback para o endpoint E-commerce público se necessário
      picPayResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
        method: 'POST',
        headers: { ...apiHeaders, 'x-picpay-token': PICPAY_SELLER_TOKEN },
        body: JSON.stringify(picpayRequestBody),
      });
    }

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
