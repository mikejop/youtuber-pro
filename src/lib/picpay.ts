/**
 * Helper do Cliente para Interação com a API do PicPay no Servidor (Edge Function)
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

    const res = await fetch('https://txmaffxbrmxlzakxathe.supabase.co/functions/v1/picpay-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        value: params.value || 67.0,
        referenceId: params.referenceId,
        buyer: {
          firstName,
          lastName,
          document: params.cpfCnpj,
          email: params.email,
          phone: params.phone || '',
        },
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return data;
    }
    return { success: false, error: data.error || 'Erro ao comunicar com a API do PicPay.' };
  } catch (err: any) {
    console.error('Erro de conexão com PicPay Server:', err);
    return { success: false, error: 'Falha de conexão com os servidores do PicPay.' };
  }
};
