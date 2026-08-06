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

  async function handleOAuthLogin(provider: 'google' | 'linkedin_oidc') {
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
      setErro(`Não foi possível iniciar o login com social.`);
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
            <p className="text-xs text-neutral-400">YouTuber Pro</p>
          </div>
        </div>

        {/* Botões de Login Social (Google & LinkedIn) */}
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 text-center">
            Entrar com Redes Sociais
          </p>
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
              title="Entrar com Google"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>

            {/* LinkedIn */}
            <button
              type="button"
              onClick={() => handleOAuthLogin('linkedin_oidc')}
              className="flex items-center justify-center space-x-2 py-3 px-4 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
              title="Entrar com LinkedIn"
            >
              <svg className="w-4 h-4 shrink-0 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
              <span>LinkedIn</span>
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
