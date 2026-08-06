import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Sparkles } from 'lucide-react';

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simula carregamento progressivo de recursos e escuta window.onload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 10;
      });
    }, 120);

    const handleLoad = () => {
      setProgress(100);
      setTimeout(() => setIsLoading(false), 500);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Fallback de segurança máximo de 3.5 segundos
    const fallbackTimer = setTimeout(() => {
      setProgress(100);
      setIsLoading(false);
    }, 3500);

    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Fundo procedural com brilho ambiente */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-black to-black pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center space-y-8 max-w-sm px-6 text-center">
            {/* Logo com brilho pulsing */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-[#0071e3]/30 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-16 h-16 bg-neutral-900 border border-neutral-700/80 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
                <div className="w-10 h-10 bg-[#0071e3] rounded-xl flex items-center justify-center shadow-inner">
                  <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
                  YouTuber Pro
                </h1>
                <span className="px-2 py-0.5 bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#0071e3] font-bold text-[10px] rounded-full uppercase tracking-wider">
                  Academy
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-medium">Carregando ambiente de cinema & ferramentas...</p>
            </div>

            {/* Barra de Progresso Ultra-Fluida */}
            <div className="w-full space-y-2">
              <div className="w-full bg-neutral-900 border border-neutral-800 rounded-full h-2 overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-gradient-to-r from-[#0071e3] via-blue-400 to-cyan-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                <span className="flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-[#0071e3]" />
                  <span>Inicializando visual...</span>
                </span>
                <span>{progress}%</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
