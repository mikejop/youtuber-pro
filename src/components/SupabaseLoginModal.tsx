import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { rateLimiter, sanitizeText } from '../lib/security';
import { X, Mail, Lock, LogIn, AlertCircle, ShieldCheck } from 'lucide-react';

interface SupabaseLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin?: (email: string) => void;
  onNavigateForgotPassword?: () => void;
}

export default function SupabaseLoginModal({
  isOpen,
  onClose,
  onSuccessLogin,
  onNavigateForgotPassword,
}: SupabaseLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);

    if (rateLimiter.isRateLimited('supabase-login', 4, 30000)) {
      setErro('Muitas tentativas de login. Aguarde alguns segundos.');
      return;
    }

    const emailSanitizado = sanitizeText(email).toLowerCase().trim();
    if (!emailSanitizado || !password) {
      setErro('Por favor, informe seu e-mail e senha.');
      return;
    }

    setCarregando(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailSanitizado,
      password: password,
    });

    setCarregando(false);

    if (error) {
      console.warn('Erro no Supabase Auth Login:', error.message);
      setErro('E-mail ou senha incorretos. Verifique suas credenciais.');
      return;
    }

    if (data.session && data.user) {
      console.log('✅ Login efetuado com sucesso via Supabase Auth:', data.user.email);
      if (onSuccessLogin) {
        onSuccessLogin(data.user.email || emailSanitizado);
      }
      onClose();
    }
  }

  async function handleOAuthLogin(provider: 'google' | 'apple' | 'facebook') {
    setErro(null);
    const originUrl = window.location.origin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${originUrl}/auth/callback`,
      },
    });

    if (error) {
      console.warn(`Erro no OAuth (${provider}):`, error.message);
      setErro(`Não foi possível iniciar o login com ${provider}.`);
    }
  }

  return (
    <div className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 bg-neutral-900/95 border border-neutral-800 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-6">
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center space-x-3.5 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 bg-[#0071e3]/10 border border-[#0071e3]/30 text-[#0071e3] rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Entrar na Plataforma</h2>
            <p className="text-xs text-neutral-400">YouTuber Pro Academy</p>
          </div>
        </div>

        {/* Botões de Login Social (OAuth) */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 text-center">
            Entrar com Redes Sociais
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              title="Entrar com Google"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('apple')}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              title="Entrar com Apple"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.35c.67-.82 1.13-1.97.99-3.12-.99.04-2.17.66-2.88 1.48-.63.73-1.18 1.9-1.03 3.03 1.1.09 2.24-.56 2.92-1.39z" />
              </svg>
              <span>Apple</span>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('facebook')}
              className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"
              title="Entrar com Facebook"
            >
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </button>
          </div>
        </div>

        {/* Divisor */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-neutral-800 w-full" />
          <span className="bg-neutral-900 px-3 text-[10px] font-bold text-neutral-500 uppercase tracking-widest absolute">
            Ou com E-mail
          </span>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">E-mail Cadastrado</label>
            <div className="relative">
              <input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-neutral-600"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-300">Sua Senha</label>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateForgotPassword) {
                    onNavigateForgotPassword();
                  } else {
                    window.location.href = '/esqueci-senha';
                  }
                }}
                className="text-[11px] text-[#0071e3] hover:underline font-medium cursor-pointer"
              >
                Esqueci minha senha
              </button>
            </div>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-neutral-600"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {erro && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{erro}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
          >
            {carregando ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Autenticando...</span>
              </div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar no YouTuber Pro</span>
              </>
            )}
          </button>
        </form>

        {/* Rodapé: Criar Conta */}
        <div className="pt-3 border-t border-neutral-800 text-center">
          <button
            type="button"
            onClick={() => {
              onClose();
              window.location.href = '/criar-conta';
            }}
            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            Ainda não tem conta? <strong className="text-[#0071e3] hover:underline">Criar Conta e Assinar</strong>
          </button>
        </div>
      </div>
    </div>
  );
}
