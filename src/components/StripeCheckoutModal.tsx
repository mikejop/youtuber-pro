import React from 'react';
import { handleStripeCheckout } from '../lib/stripe';
import { rateLimiter } from '../lib/security';
import { X, Lock, Check, Sparkles, ShieldCheck, CreditCard, ArrowRight } from 'lucide-react';

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  title = "Desbloqueie o Acesso Completo ao YouTuber Pro",
  description = "Você está tentando acessar um módulo exclusivo para alunos. Ative sua inscrição para liberar todos os 9 módulos, simuladores 3D e kits de aceleração.",
}: StripeCheckoutModalProps) {
  if (!isOpen) return null;

  const handleCheckoutClick = () => {
    if (rateLimiter.isRateLimited('checkout-modal', 4, 30000)) {
      alert('Muitas tentativas em pouco tempo. Por favor, aguarde alguns segundos.');
      return;
    }
    handleStripeCheckout('price_1U1M973VfcJ3qJcs97vRW0op');
  };

  return (
    <div className="fixed inset-0 z-[99995] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-in fade-in duration-200">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-neutral-900/95 border border-neutral-800 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 overflow-hidden">
        
        {/* Glow de Fundo */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0071e3]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all cursor-pointer z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header com Ícone de Cadeado de Destaque */}
        <div className="flex items-center space-x-3.5 border-b border-neutral-800/80 pb-4 relative z-10">
          <div className="w-12 h-12 bg-[#0071e3]/15 border border-[#0071e3]/40 text-[#0071e3] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#0071e3]/10 border border-[#0071e3]/30 text-[#0071e3] text-[10px] font-bold rounded-full uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3" />
              <span>Conteúdo Reservado</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white leading-tight">
              {title}
            </h2>
          </div>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed relative z-10">
          {description}
        </p>

        {/* Card do Preço Principal do YouTuber Pro */}
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-5 space-y-4 relative z-10">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest block">Oferta Especial de Lançamento</span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-3xl md:text-4xl font-black text-white tracking-tight">R$ 67,00</span>
                <span className="text-xs text-neutral-500 line-through">R$ 197,00</span>
              </div>
            </div>
            <span className="text-[11px] font-bold text-[#30d158] bg-[#30d158]/10 border border-[#30d158]/30 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Acesso Vitalício
            </span>
          </div>

          <div className="border-t border-neutral-900 pt-3 space-y-2 text-xs text-neutral-300">
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>Todos os 9 Módulos Práticos de Cinema & Edição</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>Simuladores 3D de Iluminação, CTR e Color Grading</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-4 h-4 text-[#30d158] shrink-0" />
              <span>Garantia de Satisfação de 7 Dias</span>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2.5 relative z-10">
          <button
            onClick={handleCheckoutClick}
            className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Desbloquear Acesso Completo no Stripe</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
            <span>Pagamento Seguro via Stripe • Processamento Instantâneo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
