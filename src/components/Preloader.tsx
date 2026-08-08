import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Preloader Minimalista e Elegante
 */
export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLoad = () => {
      setTimeout(() => setIsLoading(false), 300);
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Fallback de segurança máximo de 1.8 segundos para abertura instantânea
    const fallbackTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1800);

    return () => {
      window.removeEventListener('load', handleLoad);
      clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center space-y-5 overflow-hidden select-none"
        >
          {/* Logo Minimalista Azul YouTuber Pro conforme a referência visual */}
          <motion.h1
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#0071e3] to-[#00c7fc]"
          >
            YouTuber Pro
          </motion.h1>

          {/* Spinner Minimalista e Discreto */}
          <div className="w-5 h-5 border-2 border-[#00c7fc] border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
