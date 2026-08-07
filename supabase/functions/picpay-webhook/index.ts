import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.8';

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Método não permitido', { status: 405 });
  }

  try {
    const body = await req.json();
    console.log('🔔 Webhook PicPay Recebido:', JSON.stringify(body));

    // O PicPay envia os dados no corpo do JSON
    const transaction = body?.data?.transaction || body?.transaction || body;
    const paymentType = String(transaction?.paymentType || body?.paymentType || body?.paymentMethod || 'PIX').toUpperCase();
    const status = String(transaction?.status || body?.status || '').toUpperCase();
    const referenceId = transaction?.referenceId || body?.referenceId || body?.id || body?.reference_id;

    // Verificar se o pagamento foi concluído e feito via PIX
    const isPix = paymentType === 'PIX' || body?.pix !== undefined || body?.paymentMethod === 'PIX';
    const isPaid = status === 'PAID' || status === 'COMPLETED' || status === 'PAYED' || status === 'PAGO';

    if (isPix && isPaid && referenceId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://txmaffxbrmxlzakxathe.supabase.co';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_SECRET_KEY') || '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      // 1. Atualizar o status do pedido no banco de dados para pago_pix
      const { data: updatedPedido, error } = await supabase
        .from('pedidos')
        .update({
          status: 'pago_pix',
          payment_method: 'PIX',
          updated_at: new Date().toISOString(),
        })
        .eq('reference_id', referenceId)
        .select()
        .maybeSingle();

      if (error) {
        console.error('❌ Erro ao atualizar status no banco pedidos:', error.message);
      } else {
        console.log(`✅ Sucesso: Pedido ${referenceId} atualizado para pago_pix!`);
      }

      // 2. Resolver o e-mail do cliente e liberar o acesso na tabela 'subscribers'
      const customerEmail = updatedPedido?.cliente_email || transaction?.buyer?.email || body?.buyer?.email;

      if (customerEmail) {
        const cleanEmail = String(customerEmail).toLowerCase().trim();
        await supabase.from('subscribers').upsert(
          {
            email: cleanEmail,
            status: 'active',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'email' }
        );
        console.log(`✅ Acesso de assinante ativado no Supabase para: ${cleanEmail}`);
      }
    } else {
      console.log(`ℹ️ Ignorado ou pendente: (Método: ${paymentType}, Status: ${status}, Ref: ${referenceId})`);
    }

    // Retorna HTTP 200 para confirmar o recebimento ao PicPay
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: any) {
    console.error('❌ Erro ao processar Webhook PicPay:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
});
