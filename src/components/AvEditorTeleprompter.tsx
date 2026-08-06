import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_AUDIO_SCRIPT = `[GANCHO - 0 a 10s]
Se você quer gravar vídeos pro YouTube que parecem cinema, pare agora de pesquisar por câmeras caras! 

[PROBLEMA - 10s a 30s]
O segredo que os grandes canais escondem não está no sensor da câmera de dez mil reais, mas na forma de guiar o olhar de quem assiste e na engenharia da iluminação. E a boa notícia é que você consegue fazer isso hoje usando apenas o celular que está no seu bolso.

[DESENVOLVIMENTO - 30s a 2min]
Hoje eu voy te revelar o exato passo a passo de três camadas de cenário, o triângulo de exposição para ter movimento natural e o segredo de exportação que força o algoritmo do YouTube a te dar o codec profissional.`;

const DEFAULT_VIDEO_SCRIPT = `[VÍDEO / B-ROLL]
Cena rápida: Close-up extremo de uma lente de cinema sendo colocada na câmera. Em seguida, corte brusco para tela preta com a pergunta em letras garrafais.

[VÍDEO / B-ROLL]
Apresentador aparece em plano médio, gesticulando com energia. No fundo, luzes de LED azul e rosa dão profundidade. Na mesa, há um smartphone comum posicionado em um tripé simples.

[VÍDEO / B-ROLL]
Insere B-Rolls dinâmicos mostrando o ajuste de luz principal (Key Light), alteração do Shutter Speed e a tela de renderização de exportação marcando 4K.`;

export default function AvEditorTeleprompter() {
  const [audioScript, setAudioScript] = useState(DEFAULT_AUDIO_SCRIPT);
  const [videoScript, setVideoScript] = useState(DEFAULT_VIDEO_SCRIPT);
  const [isPrompterOpen, setIsPrompterOpen] = useState(false);
  
  // Teleprompter states
  const [isPlaying, setIsPlaying] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(3); // 1 to 10
  const [fontSize, setFontSize] = useState(32); // px

  const prompterRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Smooth scrolling loop
  useEffect(() => {
    if (isPlaying && isPrompterOpen && prompterRef.current) {
      const scrollContainer = prompterRef.current;
      const scroll = () => {
        if (scrollContainer) {
          // speed factor scaled
          const step = scrollSpeed * 0.4;
          scrollContainer.scrollTop += step;
          
          // If hit bottom, pause
          if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
            setIsPlaying(false);
          } else {
            animationFrameRef.current = requestAnimationFrame(scroll);
          }
        }
      };
      animationFrameRef.current = requestAnimationFrame(scroll);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, isPrompterOpen, scrollSpeed]);

  const handleResetPrompter = () => {
    setIsPlaying(false);
    if (prompterRef.current) {
      prompterRef.current.scrollTop = 0;
    }
  };

  const loadTemplate = () => {
    setAudioScript(DEFAULT_AUDIO_SCRIPT);
    setVideoScript(DEFAULT_VIDEO_SCRIPT);
  };

  return (
    <div className="space-y-6" id="av-editor-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-lg font-medium text-white tracking-tight" id="av-editor-title">Roteirador Audiovisual (2 Colunas)</h4>
          <p className="text-xs text-neutral-400">Escreva o áudio (sua fala) e planeje as tomadas de cobertura (B-Roll) correspondentes.</p>
        </div>
        <button
          id="btn-preload-template"
          onClick={loadTemplate}
          className="flex items-center gap-1 text-xs font-medium text-amber-400 hover:text-amber-300 py-1 px-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 transition-all cursor-pointer"
        >
          Carregar Exemplo de Gancho
        </button>
      </div>

      {/* Two Column Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="av-editor-grid">
        {/* Left: Audio/Voz */}
        <div className="flex flex-col space-y-2 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md" id="audio-column">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              Coluna 1: Áudio (O que você fala)
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Leitura do Teleprompter</span>
          </div>
          <textarea
            id="audio-script-input"
            value={audioScript}
            onChange={(e) => setAudioScript(e.target.value)}
            rows={10}
            className="w-full bg-transparent border-0 text-white placeholder-neutral-500 text-sm focus:ring-0 resize-none font-sans focus:outline-none leading-relaxed h-[240px] pr-2 overflow-y-auto"
            placeholder="Digite aqui o roteiro de voz, falas do apresentador e indicações verbais..."
          />
        </div>

        {/* Right: Video/B-Roll */}
        <div className="flex flex-col space-y-2 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md" id="video-column">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              Coluna 2: Vídeo (B-Roll & Grafismo)
            </span>
            <span className="text-[10px] text-neutral-500 font-mono">Estética de Apoio</span>
          </div>
          <textarea
            id="video-script-input"
            value={videoScript}
            onChange={(e) => setVideoScript(e.target.value)}
            rows={10}
            className="w-full bg-transparent border-0 text-white placeholder-neutral-500 text-sm focus:ring-0 resize-none font-sans focus:outline-none leading-relaxed h-[240px] pr-2 overflow-y-auto"
            placeholder="Planeje o que aparece na tela: cortes de câmera, imagens de apoio (B-Roll), zooms, textos na tela e slides..."
          />
        </div>
      </div>

      {/* Prompter Trigger */}
      <div className="flex justify-end" id="av-editor-actions">
        <button
          id="btn-trigger-prompter"
          onClick={() => {
            setIsPrompterOpen(true);
            setIsPlaying(false);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-medium transition-all shadow-lg text-sm cursor-pointer"
        >
          Lançar Modo Teleprompter
        </button>
      </div>

      {/* TELEPROMPTER FULLSCREEN MODAL */}
      {isPrompterOpen && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-between p-6 animate-fade-in" id="teleprompter-overlay">
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-neutral-800" id="prompter-header">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold tracking-wider uppercase font-mono text-neutral-400">MODO TELEPROMPTER PRO</span>
            </div>
            <button
              id="btn-close-prompter"
              onClick={() => {
                setIsPrompterOpen(false);
                setIsPlaying(false);
              }}
              className="px-4 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs border border-neutral-800 cursor-pointer"
            >
              Sair do Prompter
            </button>
          </div>

          {/* Central Scrolling Window */}
          <div className="flex-1 flex justify-center items-center relative my-4 overflow-hidden" id="prompter-scroller-outer">
            {/* Guide line indicator in center */}
            <div className="absolute left-0 right-0 h-16 pointer-events-none border-y border-red-500/30 bg-red-500/5 z-10 flex items-center justify-start pl-4" id="reading-guideline">
              <span className="text-[10px] font-mono text-red-500 tracking-widest uppercase">LINHA DE LEITURA</span>
            </div>

            {/* Reading Text Container */}
            <div
              id="prompter-scroller"
              ref={prompterRef}
              className="w-full max-w-3xl h-[400px] overflow-y-auto px-8 py-24 scroll-smooth text-center select-none"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div 
                className="text-neutral-300 font-medium leading-relaxed"
                style={{ fontSize: `${fontSize}px` }}
                id="prompter-text-body"
              >
                {audioScript.split('\n').map((line, i) => (
                  <p key={i} className={`mb-6 ${line.startsWith('[') ? 'text-amber-400 font-bold text-lg' : ''}`}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Controls Footer */}
          <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 max-w-4xl mx-auto w-full" id="prompter-controls">
            {/* Playbacks */}
            <div className="flex items-center gap-3">
              <button
                id="btn-prompter-play"
                onClick={() => setIsPlaying(!isPlaying)}
                className="px-6 py-2.5 rounded-full bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all cursor-pointer"
                title={isPlaying ? 'Pausar' : 'Iniciar'}
              >
                {isPlaying ? 'Pausar' : 'Iniciar'}
              </button>
              <button
                id="btn-prompter-reset"
                onClick={handleResetPrompter}
                className="px-4 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-800 text-xs font-bold transition-all cursor-pointer"
                title="Voltar ao início"
              >
                Reiniciar
              </button>
            </div>

            {/* Speed Adjuster */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <span className="text-xs font-mono text-neutral-400">Velocidade:</span>
              <input
                id="prompter-speed-slider"
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(Number(e.target.value))}
                className="flex-1 accent-amber-400 h-1 rounded-lg bg-neutral-800 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-6">{scrollSpeed}x</span>
            </div>

            {/* Font Sizer */}
            <div className="flex items-center gap-3 w-full max-w-xs">
              <span className="text-xs font-mono text-neutral-400">Fonte:</span>
              <input
                id="prompter-font-slider"
                type="range"
                min="20"
                max="60"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="flex-1 accent-white h-1 rounded-lg bg-neutral-800 cursor-pointer"
              />
              <span className="text-xs font-mono text-white w-10">{fontSize}px</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
