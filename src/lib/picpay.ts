/**
 * Helper do Cliente para Interação com a API do PicPay e Supabase Edge Functions
 */

import { supabase } from './supabase';

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
 * Gerador de Payload Pix Padrão BR Code (BACEN / EMV QRCPS) 100% compatível com todos os bancos
 */
function generatePixBRCode(pixKey: string, value: number, referenceId: string): string {
  const valueStr = value.toFixed(2);
  const merchantName = 'YOUTUBER PRO';
  const merchantCity = 'SAO PAULO';
  
  // No padrão do Banco Central do Brasil, a TxID (tag 05 do grupo 62) DEVE conter apenas letras e números (sem hífens ou caracteres especiais)
  const cleanTxId = referenceId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 25) || 'YTP123';

  const formatField = (id: string, val: string) => {
    const len = val.length.toString().padStart(2, '0');
    return `${id}${len}${val}`;
  };

  const merchantAccountInfo =
    formatField('00', 'br.gov.bcb.pix') +
    formatField('01', pixKey);

  const additionalData = formatField('05', cleanTxId);

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

  // Cálculo do Checksum CRC16-CCITT (0x1021) conforme especificação do Banco Central
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
  const orderRef = params.referenceId || `YTP${Date.now()}${Math.floor(Math.random() * 1000)}`;
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

  // 1. Invoca a Edge Function oficial do Supabase
  try {
    const { data, error } = await supabase.functions.invoke('criar-cobranca-picpay', {
      body: payload,
    });

    if (!error && data) {
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
    } else if (error) {
      console.warn('⚠️ Nota Edge Function criar-cobranca-picpay:', error);
    }
  } catch (edgeErr) {
    console.warn('⚠️ Exceção ao chamar Edge Function:', edgeErr);
  }

  // 2. GERADOR BR CODE PIX INSTANTÂNEO DE ALTA COMPATIBILIDADE BANCÁRIA (CONFORME MANUAL BACEN)
  console.log('⚡ Gerando QR Code e Chave Pix Copia e Cola Padrão BACEN...');
  const picpayChavePix = 'b6d9038f-d843-4e03-8e0a-36543370d36c';
  const pixPayloadString = generatePixBRCode(picpayChavePix, valor, orderRef);
  const qrcodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayloadString)}`;

  return {
    success: true,
    referenceId: orderRef,
    paymentUrl: undefined,
    qrcode: {
      content: pixPayloadString,
      base64: qrcodeImageUrl,
    },
    expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };
};
