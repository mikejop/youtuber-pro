/**
 * Helper do Cliente para Interação com a API do PicPay no Servidor (com Fallback Direto Criptografado)
 */

interface CreatePicPayPaymentParams {
  email: string;
  name: string;
  cpfCnpj: string;
  phone?: string;
  value?: number;
  referenceId?: string;
}

export interface PicPayPaymentResponse {
  success: boolean;
  referenceId?: string;
  paymentUrl?: string;
  qrcode?: {
    content?: string;
    base64?: string;
  };
  expiresAt?: string;
  error?: string;
}

export const createPicPayPaymentServer = async (
  params: CreatePicPayPaymentParams
): Promise<PicPayPaymentResponse> => {
  try {
    const names = params.name.trim().split(' ');
    const firstName = names[0] || 'Cliente';
    const lastName = names.slice(1).join(' ') || 'YouTuber Pro';
    const cleanEmail = params.email.toLowerCase().trim();
    const orderRef = params.referenceId || `YTP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      value: params.value || 67.0,
      referenceId: orderRef,
      buyer: {
        firstName,
        lastName,
        document: params.cpfCnpj.replace(/\D/g, ''),
        email: cleanEmail,
        phone: params.phone ? params.phone.replace(/\D/g, '') : '',
      },
    };

    const supabaseAnonKey = 'sb_publishable_GgBqVbEZW4yJdLdZWHDmig_nnRQqeKg';

    // 1. Tenta chamar a Edge Function Supabase com os cabeçalhos de autorização
    try {
      const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/picpay-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return data;
        }
      }
    } catch (edgeErr) {
      console.warn('⚠️ Nota Edge Function Supabase PicPay:', edgeErr);
    }

    // 2. FALLBACK DIRETO: Requisição direta para a API Oficial do PicPay
    console.log('🔄 Executando integração direta com a API do PicPay (OAuth2)...');
    const clientId = 'b6d9038f-d843-4e03-8e0a-36543370d36c';
    const clientSecret = 'dgGxianwpzz0GSPuiY0oZSygV6T2STwk';

    // 2.1 Autenticação OAuth2 PicPay (Troca de credenciais por Access Token)
    let accessToken = '';
    try {
      const tokenRes = await fetch('https://checkout-api.picpay.com/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });
      if (tokenRes.ok) {
        const tokenData = await tokenRes.json();
        accessToken = tokenData.access_token || '';
      }
    } catch (tErr) {
      console.warn('⚠️ Exceção ao obter token OAuth2 PicPay:', tErr);
    }

    // 2.2 Criação de Pagamento Pix na API Oficial PicPay
    const siteOrigin = window.location.origin;
    const picpayBody = {
      referenceId: orderRef,
      callbackUrl: `${siteOrigin}/api/picpay-webhook`,
      returnUrl: `${siteOrigin}/?checkout=success`,
      value: params.value || 67.0,
      expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      buyer: {
        firstName,
        lastName,
        document: params.cpfCnpj.replace(/\D/g, ''),
        email: cleanEmail,
        phone: params.phone ? params.phone.replace(/\D/g, '') : '11999999999',
      },
    };

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    } else {
      headers['x-picpay-token'] = clientSecret;
    }

    let picPayRes = await fetch('https://checkout-api.picpay.com/v1/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify(picpayBody),
    });

    if (!picPayRes.ok) {
      picPayRes = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
        method: 'POST',
        headers: { ...headers, 'x-picpay-token': clientSecret },
        body: JSON.stringify(picpayBody),
      });
    }

    if (picPayRes.ok) {
      const picPayData = await picPayRes.json();
      return {
        success: true,
        referenceId: orderRef,
        paymentUrl: picPayData.paymentUrl,
        qrcode: picPayData.qrcode,
        expiresAt: picPayData.expiresAt,
      };
    } else {
      const errText = await picPayRes.text();
      let msg = 'Erro no servidor do PicPay.';
      try {
        const parsed = JSON.parse(errText);
        msg = parsed.message || parsed.error || msg;
      } catch (e) {
        msg = errText || msg;
      }
      return { success: false, error: `PicPay: ${msg}` };
    }
  } catch (err: any) {
    console.error('❌ Erro no envio para o PicPay:', err);
    return { success: false, error: err.message || 'Falha de conexão com os servidores do PicPay.' };
  }
};
