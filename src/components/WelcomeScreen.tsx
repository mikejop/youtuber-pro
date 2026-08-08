import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ArrowRight, ShieldCheck, User } from 'lucide-react';

interface WelcomeScreenProps {
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  onContinue: () => void;
}

export default function WelcomeScreen({ userName, userEmail, userAvatar, onContinue }: WelcomeScreenProps) {
  const displayName = userName.trim() ? userName.trim().split(' ')[0] : 'Criador';

  // Auto-continuar após 4.5 segundos se o usuário não clicar antes
  useEffect(() => {
    const timer = setTimeout(() => {
      onContinue();
    }, 4500);
    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] bg-[#0a0a0c] text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden"
      >
        {/* Glow de Iluminação de Fundo de Alta Performance */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#0071e3]/20 via-[#00c7fc]/15 to-[#30d158]/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Card Central Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-lg w-full bg-neutral-900/80 border border-white/10 rounded-3xl p-8 md:p-10 text-center space-y-6 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        >
          {/* Badge & Avatar do Usuário */}
          <div className="flex flex-col items-center justify-center space-y-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-tr from-[#0071e3] to-[#00c7fc] text-white flex items-center justify-center shadow-lg shadow-blue-500/25 border-2 border-white/20"
            >
              {userAvatar ? (
                <img src={userAvatar} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-semibold uppercase tracking-wider"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Acesso Confirmado & Liberado</span>
            </motion.div>
          </div>

          {/* Mensagem de Boas-Vindas sem Elementos de Carregamento */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="text-3xl md:text-4xl font-extrabold tracking-tight text-white"
            >
              Seja bem-vindo(a), <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] via-[#00c7fc] to-[#30d158]">{displayName}</span>!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="text-sm text-neutral-400 leading-relaxed max-w-md mx-auto"
            >
              Seu acesso ao <strong className="text-white font-semibold">YouTuber Pro</strong> foi ativado com sucesso. Todo o Playbook Visual e Ferramentas 3D estão prontos para você.
            </motion.p>
          </div>

          {/* Cards de Destaque / Garantia */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="grid grid-cols-2 gap-3 pt-2 text-left text-xs"
          >
            <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider block">Status da Conta</span>
              <span className="text-emerald-400 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Assinatura Ativa</span>
              </span>
            </div>
            <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider block">Modalidade</span>
              <span className="text-white font-bold truncate block">Acesso Vitalício</span>
            </div>
          </motion.div>

          {/* Botão Principal de Entrada Direta */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            className="pt-2"
          >
            <button
              onClick={onContinue}
              className="w-full py-4 bg-[#0071e3] hover:bg-[#0077ed] active:scale-[0.99] text-white font-bold text-sm md:text-base rounded-2xl transition-all shadow-xl shadow-blue-500/25 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Acessar o Guia de Sobrevivência</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
