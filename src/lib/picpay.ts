/**
 * Helper do Cliente para Interação com a API do PicPay e Supabase Edge Functions
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

/**
 * Gerador de Payload Pix Padrão BR Code (EMV QRCPS) para Cobrança Instantânea sem erros de CORS
 */
function generatePixBRCode(pixKey: string, value: number, referenceId: string): string {
  const valueStr = value.toFixed(2);
  const merchantName = 'YOUTUBER PRO';
  const merchantCity = 'SAO PAULO';

  const formatField = (id: string, val: string) => {
    const len = val.length.toString().padStart(2, '0');
    return `${id}${len}${val}`;
  };

  const merchantAccountInfo =
    formatField('00', 'br.gov.bcb.pix') +
    formatField('01', pixKey);

  const additionalData = formatField('05', referenceId.substring(0, 25));

  let payload =
    formatField('00', '01') +
    formatField('26', merchantAccountInfo) +
    formatField('52', '0000') +
    formatField('53', '986') +
    formatField('54', valueStr) +
    formatField('58', 'BR') +
    formatField('59', merchantName) +
    formatField('60', merchantCity) +
    formatField('62', additionalData) +
    '6304';

  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  const crcHex = (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0');
  return `${payload}${crcHex}`;
}

export const createPicPayPaymentServer = async (
  params: CreatePicPayPaymentParams
): Promise<PicPayPaymentResponse> => {
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

  // 1. Tenta acionar a Edge Function do Supabase 'criar-cobranca-picpay'
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
      if (data.paymentUrl || data.checkoutUrl || data.url || data.qrcode?.content || data.success) {
        return {
          success: true,
          referenceId: orderRef,
          paymentUrl: data.paymentUrl || data.checkoutUrl || data.url,
          qrcode: data.qrcode || {
            content: data.qrcodeContent,
            base64: data.qrcodeBase64,
          },
          expiresAt: data.expiresAt,
        };
      }
    }
  } catch (edgeErr) {
    console.warn('⚠️ Nota Edge Function criar-cobranca-picpay:', edgeErr);
  }

  // 2. GERADOR BR CODE PIX INSTANTÂNEO (EVITA ERRO LOAD FAILED DO BROWSER E EXECUTA 100% DAS VEZES)
  console.log('⚡ Gerando QR Code e Chave Pix Copia e Cola via BR Code Standard...');
  const picpayChavePix = 'b6d9038f-d843-4e03-8e0a-36543370d36c';
  const pixPayloadString = generatePixBRCode(picpayChavePix, valor, orderRef);
  const qrcodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayloadString)}`;

  return {
    success: true,
    referenceId: orderRef,
    paymentUrl: 'https://picpay.com',
    qrcode: {
      content: pixPayloadString,
      base64: qrcodeImageUrl,
    },
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
};
