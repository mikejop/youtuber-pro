import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { rateLimiter, sanitizeText } from '../lib/security';
import { X, Mail, Lock, LogIn, AlertCircle, KeyRound, ShieldCheck } from 'lucide-react';

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
      </div>
    </div>
  );
}
