import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { rateLimiter, sanitizeText } from '../lib/security';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface EsqueciSenhaProps {
  onBackToLogin?: () => void;
}

export default function EsqueciSenha({ onBackToLogin }: EsqueciSenhaProps) {
  const [email, setEmail] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (rateLimiter.isRateLimited('esqueci-senha', 3, 60000)) {
      setMensagem('Muitas solicitações em pouco tempo. Aguarde 1 minuto.');
      return;
    }

    const emailSanitizado = sanitizeText(email).toLowerCase();

    setCarregando(true);
    
    // Dispara reset de senha enviando o link apontando para /definir-senha
    const { error } = await supabase.auth.resetPasswordForEmail(emailSanitizado, {
      redirectTo: `${window.location.origin}/definir-senha`,
    });

    setCarregando(false);

    if (error) {
      console.warn('Note on resetPasswordForEmail:', error.message);
    }

    // SEGURANÇA: Sempre exibe a mesma mensagem constante para evitar ataques de enumeração de e-mails
    setMensagem('Se esse e-mail estiver cadastrado em nossa plataforma, você receberá um link seguro em instantes para redefinir sua senha.');
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 max-w-md w-full backdrop-blur-2xl shadow-2xl space-y-6">
        <button
          type="button"
          onClick={() => (onBackToLogin ? onBackToLogin() : (window.location.href = '/'))}
          className="flex items-center space-x-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Login</span>
        </button>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Recuperar Senha</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Digite o e-mail associado à sua conta do YouTuber Pro para enviarmos o link de recuperação.
          </p>
        </div>

        {mensagem ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto animate-bounce" />
            <p className="text-xs text-neutral-300 leading-relaxed">{mensagem}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300">E-mail Cadastrado</label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-neutral-600"
                />
                <Mail className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {carregando ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando Link...</span>
                </div>
              ) : (
                <span>Enviar Link de Recuperação</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
