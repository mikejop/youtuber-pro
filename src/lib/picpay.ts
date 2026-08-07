/**
 * Helper do Cliente para Interação com a API do PicPay e Supabase Edge Functions (criar-cobranca-picpay)
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
    const valor = params.value || 67.0;

    const payload = {
      referenceId: orderRef,
      valor: valor,
      clienteEmail: cleanEmail,
      buyer: {
        firstName,
        lastName,
        document: params.cpfCnpj.replace(/\D/g, ''),
        email: cleanEmail,
        phone: params.phone ? params.phone.replace(/\D/g, '') : '',
      },
    };

    const supabaseAnonKey = 'sb_publishable_GgBqVbEZW4yJdLdZWHDmig_nnRQqeKg';

    // 1. Chamada para a Edge Function oficial 'criar-cobranca-picpay'
    try {
      const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/criar-cobranca-picpay', {
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
        if (data.paymentUrl || data.checkoutUrl || data.url || data.success) {
          return {
            success: true,
            referenceId: orderRef,
            paymentUrl: data.paymentUrl || data.checkoutUrl || data.url,
            qrcode: data.qrcode,
            expiresAt: data.expiresAt,
          };
        }
      }
    } catch (edgeErr) {
      console.warn('⚠️ Nota Edge Function criar-cobranca-picpay:', edgeErr);
    }

    // 2. Chamada para a Edge Function alternativa 'picpay-payment'
    try {
      const resAlt = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/picpay-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (resAlt.ok) {
        const dataAlt = await resAlt.json();
        if (dataAlt.success || dataAlt.paymentUrl) {
          return {
            success: true,
            referenceId: orderRef,
            paymentUrl: dataAlt.paymentUrl,
            qrcode: dataAlt.qrcode,
            expiresAt: dataAlt.expiresAt,
          };
        }
      }
    } catch (altErr) {
      console.warn('⚠️ Nota Edge Function picpay-payment:', altErr);
    }

    // 3. FALLBACK DIRETO: Conexão via OAuth 2.0 (api.picpay.com / checkout-api.picpay.com)
    console.log('🔄 Executando integração direta OAuth 2.0 PicPay...');
    const clientId = 'b6d9038f-d843-4e03-8e0a-36543370d36c';
    const clientSecret = 'dgGxianwpzz0GSPuiY0oZSygV6T2STwk';

    let accessToken = '';
    try {
      const tokenRes = await fetch('https://api.picpay.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
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
      console.warn('⚠️ Exceção ao obter token OAuth api.picpay.com:', tErr);
    }

    const siteOrigin = window.location.origin;
    const picpayBody = {
      referenceId: orderRef,
      callbackUrl: 'https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/picpay-webhook',
      notificationUrl: 'https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/picpay-webhook',
      returnUrl: `${siteOrigin}/?checkout=success`,
      value: valor,
      paymentMethods: ['PIX'],
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

    let picPayRes = await fetch('https://api.picpay.com/payment-link', {
      method: 'POST',
      headers,
      body: JSON.stringify(picpayBody),
    });

    if (!picPayRes.ok) {
      picPayRes = await fetch('https://checkout-api.picpay.com/v1/payments', {
        method: 'POST',
        headers,
        body: JSON.stringify(picpayBody),
      });
    }

    if (picPayRes.ok) {
      const picPayData = await picPayRes.json();
      return {
        success: true,
        referenceId: orderRef,
        paymentUrl: picPayData.paymentUrl || picPayData.checkoutUrl || picPayData.url,
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
