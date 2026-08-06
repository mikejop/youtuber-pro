import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { sanitizeText, rateLimiter } from '../lib/security';
import { Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

interface DefinirSenhaProps {
  onSuccessRedirect?: () => void;
}

export default function DefinirSenha({ onSuccessRedirect }: DefinirSenhaProps) {
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [sessaoValida, setSessaoValida] = useState<boolean | null>(null);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);

  // Verifica se existe uma sessão válida vinda do link do e-mail (convite ou recuperação)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessaoValida(!!session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setSessaoValida(!!session);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  function validarSenha(senhaInput: string): string | null {
    if (senhaInput.length < 8) return 'A senha precisa ter no mínimo 8 caracteres.';
    if (!/[A-Z]/.test(senhaInput)) return 'Inclua ao menos uma letra maiúscula (A-Z).';
    if (!/[0-9]/.test(senhaInput)) return 'Inclua ao menos um número (0-9).';
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');

    if (rateLimiter.isRateLimited('definir-senha', 3, 30000)) {
      setErro('Muitas tentativas em pouco tempo. Por favor, aguarde alguns segundos.');
      return;
    }

    const erroValidacao = validarSenha(senha);
    if (erroValidacao) {
      setErro(erroValidacao);
      return;
    }

    if (senha !== confirmarSenha) {
      setErro('As senhas não coincidem. Digite novamente.');
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setCarregando(false);

    if (error) {
      console.error('Erro updateUser Supabase Auth:', error.message);
      setErro('Não foi possível definir a senha. O link pode ter expirado ou ser inválido — solicite um novo.');
      return;
    }

    setSucesso(true);

    setTimeout(() => {
      if (onSuccessRedirect) {
        onSuccessRedirect();
      } else {
        window.location.href = '/';
      }
    }, 2500);
  }

  if (sessaoValida === null) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <div className="flex items-center space-x-3 text-neutral-400">
          <div className="w-5 h-5 border-2 border-[#0071e3] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Validando token de acesso seguro...</span>
        </div>
      </div>
    );
  }

  if (!sessaoValida) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Link inválido ou expirado</h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              O link de definição de senha expirou por motivos de segurança. Solicite um novo link clicando em "Esqueci minha senha" na tela de login.
            </p>
          </div>
          <button
            onClick={() => (window.location.href = '/')}
            className="w-full py-3.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Voltar para o Início</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-neutral-900/80 border border-emerald-500/30 rounded-3xl p-8 max-w-md w-full backdrop-blur-xl shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-white">Senha criada com sucesso!</h2>
            <p className="text-sm text-neutral-400">
              Sua nova senha foi gravada e protegida. Você será redirecionado para a plataforma em instantes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-8 max-w-md w-full backdrop-blur-2xl shadow-2xl space-y-6">
        <div className="flex items-center space-x-3 border-b border-neutral-800 pb-4">
          <div className="w-12 h-12 bg-[#0071e3]/10 border border-[#0071e3]/30 text-[#0071e3] rounded-2xl flex items-center justify-center">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Defina sua Senha</h2>
            <p className="text-xs text-neutral-400">YouTuber Pro Academy</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300 flex items-center justify-between">
              <span>Nova Senha</span>
              <span className="text-[10px] text-neutral-500">Mínimo 8 caracteres</span>
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-neutral-600"
              />
              <Lock className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-300">Confirme a Senha</label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#0071e3] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-all placeholder:text-neutral-600"
              />
              <ShieldCheck className="w-4 h-4 text-neutral-500 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          {/* Dicas de Senha Forte UX */}
          <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-3.5 text-xs text-neutral-400 space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className={senha.length >= 8 ? 'text-emerald-400 font-bold' : 'text-neutral-600'}>✓</span>
              <span>Pelo menos 8 caracteres</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={/[A-Z]/.test(senha) ? 'text-emerald-400 font-bold' : 'text-neutral-600'}>✓</span>
              <span>Pelo menos 1 letra maiúscula (A-Z)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={/[0-9]/.test(senha) ? 'text-emerald-400 font-bold' : 'text-neutral-600'}>✓</span>
              <span>Pelo menos 1 número (0-9)</span>
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
            className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-blue-500/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {carregando ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Salvando Senha...</span>
              </div>
            ) : (
              <span>Definir Senha e Acessar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
