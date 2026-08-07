import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

const PICPAY_CLIENT_ID = Deno.env.get('PICPAY_CLIENT_ID') || 'b6d9038f-d843-4e03-8e0a-36543370d36c';
const PICPAY_CLIENT_SECRET = Deno.env.get('PICPAY_CLIENT_SECRET') || 'dgGxianwpzz0GSPuiY0oZSygV6T2STwk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { referenceId, valor, clienteEmail, buyer } = await req.json();

    const orderRef = referenceId || `PEDIDO_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const amountValue = Number(valor) || 67.0;
    const cleanEmail = (clienteEmail || buyer?.email || '').toLowerCase().trim();

    // 1. Salvar o pedido pendente no Supabase Database
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://txmaffxbrmxlzakxathe.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (cleanEmail) {
      await supabase.from('pedidos').upsert({
        reference_id: orderRef,
        valor: amountValue,
        cliente_email: cleanEmail,
        status: 'pendente',
        payment_method: 'PIX',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'reference_id' });
    }

    // 2. Autenticar no PicPay para obter o Token OAuth 2.0
    let accessToken: string | null = null;
    try {
      const authResponse = await fetch('https://api.picpay.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: PICPAY_CLIENT_ID,
          client_secret: PICPAY_CLIENT_SECRET,
        }),
      });

      if (authResponse.ok) {
        const authData = await authResponse.json();
        accessToken = authData.access_token || null;
      } else {
        const errText = await authResponse.text();
        console.warn('⚠️ Fallback OAuth api.picpay.com:', authResponse.status, errText);
      }
    } catch (oauthErr: any) {
      console.warn('⚠️ Exceção OAuth PicPay:', oauthErr.message);
    }

    // Fallback para OAuth2 checkout-api se necessário
    if (!accessToken) {
      try {
        const auth2Res = await fetch('https://checkout-api.picpay.com/oauth2/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'client_credentials',
            client_id: PICPAY_CLIENT_ID,
            client_secret: PICPAY_CLIENT_SECRET,
          }),
        });
        if (auth2Res.ok) {
          const auth2Data = await auth2Res.json();
          accessToken = auth2Data.access_token || null;
        }
      } catch (e: any) {
        console.warn('⚠️ Exceção OAuth2 checkout-api:', e.message);
      }
    }

    // 3. Gerar o Link de Pagamento no PicPay passando a notificationUrl (WEBHOOK) e returnUrl (Vercel)
    const webhookUrl = `${supabaseUrl}/functions/v1/picpay-webhook`;
    const appReturnUrl = 'https://youtuber-mqb5aganq-dojo-crew.vercel.app/?checkout=success';

    const paymentPayload = {
      referenceId: orderRef,
      value: amountValue,
      paymentMethods: ['PIX'], // Restringe o pagamento apenas para Pix
      notificationUrl: webhookUrl,
      callbackUrl: webhookUrl,
      returnUrl: appReturnUrl,
      buyer: buyer ? {
        firstName: buyer.firstName || 'Cliente',
        lastName: buyer.lastName || 'YouTuber Pro',
        document: buyer.document ? String(buyer.document).replace(/\D/g, '') : '',
        email: cleanEmail,
        phone: buyer.phone ? String(buyer.phone).replace(/\D/g, '') : '11999999999',
      } : undefined,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      headers['x-picpay-token'] = PICPAY_CLIENT_SECRET;
    }

    let paymentResponse = await fetch('https://api.picpay.com/payment-link', {
      method: 'POST',
      headers,
      body: JSON.stringify(paymentPayload),
    });

    if (!paymentResponse.ok) {
      paymentResponse = await fetch('https://checkout-api.picpay.com/v1/payments', {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentPayload),
      });
    }

    if (!paymentResponse.ok) {
      paymentResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
        method: 'POST',
        headers: { ...headers, 'x-picpay-token': PICPAY_CLIENT_SECRET },
        body: JSON.stringify(paymentPayload),
      });
    }

    const paymentData = await paymentResponse.json();

    if (!paymentResponse.ok) {
      console.error('❌ Erro PicPay Payment Link:', paymentData);
      return new Response(
        JSON.stringify({ error: paymentData.message || paymentData.error || 'Erro ao solicitar Pix no PicPay.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: paymentResponse.status }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        referenceId: orderRef,
        paymentUrl: paymentData.paymentUrl || paymentData.checkoutUrl || paymentData.url,
        qrcode: paymentData.qrcode,
        expiresAt: paymentData.expiresAt,
        raw: paymentData,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    console.error('❌ Erro ao criar cobrança PicPay:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno ao criar cobrança PicPay.' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
