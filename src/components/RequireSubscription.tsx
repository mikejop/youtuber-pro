import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { handleStripeCheckout } from '../lib/stripe';
import { Lock, ShieldAlert, CheckCircle2, LogOut, ArrowRight, CreditCard } from 'lucide-react';

interface RequireSubscriptionProps {
  children: React.ReactNode;
  onOpenLoginModal?: () => void;
}

export default function RequireSubscription({ children, onOpenLoginModal }: RequireSubscriptionProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isActiveSubscriber, setIsActiveSubscriber] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    async function verifySubscription() {
      setLoading(true);

      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !session.user) {
        setIsAuthenticated(false);
        setIsActiveSubscriber(false);
        setLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setUserEmail(session.user.email || null);

      // Query status from subscribers table for active status
      try {
        const { data: subData, error } = await supabase
          .from('subscribers')
          .select('status')
          .or(`id.eq.${session.user.id},email.eq.${session.user.email}`)
          .single();

        if (error || !subData) {
          console.warn('ℹ️ No active subscription found for user:', session.user.email);
          setIsActiveSubscriber(false);
        } else if (subData.status === 'active') {
          setIsActiveSubscriber(true);
        } else {
          console.warn(`⚠️ User subscription status is "${subData.status}"`);
          setIsActiveSubscriber(false);
        }
      } catch (err: any) {
        console.error('❌ Error checking subscription status:', err);
        setIsActiveSubscriber(false);
      }

      setLoading(false);
    }

    verifySubscription();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, _session) => {
      verifySubscription();
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // 1. Loading State (Nunca libera acesso otimisticamente antes da confirmação)
  if (loading) {
    return (
      <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center p-6 select-none">
        <div className="flex items-center space-x-3 text-neutral-400">
          <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Verificando status da assinatura na comunidade...</span>
        </div>
      </div>
    );
  }

  // 2. Liberar Acesso se o usuário estiver Autenticado E com Assinatura ATIVA
  if (isAuthenticated && isActiveSubscriber) {
    return <>{children}</>;
  }

  // 3. Bloqueio de Acesso para Usuários Não-Pagantes ou Sem Assinatura Ativa (Payment Gate Shield)
  return (
    <div className="fixed inset-0 z-[99990] bg-black/95 backdrop-blur-3xl text-white flex items-center justify-center p-6 overflow-y-auto">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 text-center">
        
        {/* Ícone de Cadeado de Proteção */}
        <div className="relative w-16 h-16 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 bg-[#0071e3]/20 blur-2xl rounded-full animate-pulse" />
          <div className="relative w-14 h-14 bg-neutral-950 border border-[#0071e3]/40 text-[#0071e3] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Lock className="w-7 h-7" />
          </div>
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-bold rounded-full uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Acesso Restrito a Assinantes</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Ative seu Acesso ao YouTuber Pro
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
            {isAuthenticated ? (
              <>
                Sua conta <strong className="text-white">{userEmail}</strong> foi autenticada, mas ainda não possui uma assinatura ativa confirmada.
              </>
            ) : (
              <>
                Você precisa adquirir o Guia de Sobrevivência ou fazer login com a sua conta de comprador para liberar o conteúdo completo.
              </>
            )}
          </p>
        </div>

        {/* Card de Benefícios Rápidos */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-4 text-left space-y-2 text-xs text-neutral-300">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>Acesso vitalício ao Playbook Visual e Ferramentas 3D</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>Simuladores de Iluminação, CTR e Color Grading</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0" />
            <span>Garantia incondicional de devolução em 7 dias</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => handleStripeCheckout('price_1U1M973VfcJ3qJcs97vRW0op')}
            className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Garantir Acesso Instantâneo via Stripe</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {isAuthenticated ? (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.reload();
              }}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-semibold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta ({userEmail})</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (onOpenLoginModal) onOpenLoginModal();
              }}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer"
            >
              Já é aluno? Faça Login aqui
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
