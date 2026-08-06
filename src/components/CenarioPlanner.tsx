import React, { useState } from 'react';

export default function CenarioPlanner() {
  const [foreground, setForeground] = useState<'coffee' | 'mic' | 'plant' | 'none'>('coffee');
  const [presenterAlign, setPresenterAlign] = useState<'left' | 'center' | 'right'>('center');
  const [bgStyle, setBgStyle] = useState<'neon' | 'warm' | 'tech' | 'corporate'>('neon');
  const [bokehBlur, setBokehBlur] = useState<number>(12); // blur in px
  const [showGrid, setShowGrid] = useState<boolean>(true);

  return (
    <div className="space-y-6" id="cenario-planner-root">
      <div>
        <h4 className="text-lg font-medium text-white tracking-tight" id="cenario-title">Planejador de Cenário & Enquadramento Estético</h4>
        <p className="text-xs text-neutral-400">Desenhe a volumetria tridimensional do seu set (Fore, Mid, Back) e controle as regras de proporção óptica.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="cenario-grid">
        {/* Left: Controls Panel (5 columns) */}
        <div className="lg:col-span-5 space-y-5 p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md flex flex-col justify-between" id="cenario-controls-column">
          <div className="space-y-4">
            {/* 1. Foreground Options */}
            <div className="space-y-2" id="control-foreground">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                1. Primeiro Plano (Foreground)
              </label>
              <div className="grid grid-cols-2 gap-2" id="foreground-options">
                {[
                  { id: 'coffee', label: 'Caneca de Café' },
                  { id: 'mic', label: 'Mic Vintage' },
                  { id: 'plant', label: 'Planta Minimalista' },
                  { id: 'none', label: 'Nenhum Elemento' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`fore-btn-${opt.id}`}
                    onClick={() => setForeground(opt.id as any)}
                    className={`p-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                      foreground === opt.id 
                        ? 'bg-pink-500/10 text-pink-400 border border-pink-500/40' 
                        : 'bg-white/5 text-neutral-300 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Midground Alignments */}
            <div className="space-y-2" id="control-midground">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                2. Plano Médio (Apresentador)
              </label>
              <div className="flex gap-2" id="presenter-options">
                {[
                  { id: 'left', label: 'Alinhado Esquerda' },
                  { id: 'center', label: 'No Centro' },
                  { id: 'right', label: 'Alinhado Direita' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`align-btn-${opt.id}`}
                    onClick={() => setPresenterAlign(opt.id as any)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      presenterAlign === opt.id 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/40' 
                        : 'bg-white/5 text-neutral-300 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Background Settings */}
            <div className="space-y-2" id="control-background">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-1">
                3. Plano de Fundo (Background Style)
              </label>
              <div className="grid grid-cols-2 gap-2" id="background-presets">
                {[
                  { id: 'neon', label: 'Cyberpunk Neon', desc: 'LEDs azul e rosa' },
                  { id: 'warm', label: 'Warm Minimalist', desc: 'Luz quente, madeira' },
                  { id: 'tech', label: 'Tech Slate', desc: 'Cinza, luz fria' },
                  { id: 'corporate', label: 'Clean Corporate', desc: 'Estúdio comercial' }
                ].map(opt => (
                  <button
                    key={opt.id}
                    id={`bg-style-btn-${opt.id}`}
                    onClick={() => setBgStyle(opt.id as any)}
                    className={`p-2.5 rounded-xl text-left transition-all ${
                      bgStyle === opt.id 
                        ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/40' 
                        : 'bg-white/5 text-neutral-300 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <p className="text-xs font-semibold">{opt.label}</p>
                    <p className="text-[10px] text-neutral-400">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Bokeh Blur Slider */}
            <div className="space-y-2" id="control-bokeh">
              <div className="flex justify-between items-center text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">Desfoque de Fundo (Bokeh / Abertura f/)</span>
                <span className="text-amber-400 font-mono text-[10px] lowercase" id="f-stop-value">
                  {bokehBlur === 0 ? 'f/8 (totalmente focado)' : bokehBlur <= 6 ? 'f/4 (leve bokeh)' : bokehBlur <= 16 ? 'f/2.0 (lindo desfoque)' : 'f/1.4 (bokeh extremo)'}
                </span>
              </div>
              <input
                id="slider-bokeh"
                type="range"
                min="0"
                max="24"
                value={bokehBlur}
                onChange={(e) => setBokehBlur(Number(e.target.value))}
                className="w-full accent-amber-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Grids / Overlays toggles */}
          <div className="pt-4 border-t border-white/5 flex gap-2" id="overlay-toggles">
            <button
              id="btn-toggle-grid"
              onClick={() => setShowGrid(!showGrid)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all ${
                showGrid 
                  ? 'bg-white text-black shadow-sm' 
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
              }`}
            >
              {showGrid ? 'Ocultar Grade' : 'Mostrar Grade'} (Regra dos Terços)
            </button>
          </div>
        </div>

        {/* Right: Visual Stage Preview (7 columns) */}
        <div className="lg:col-span-7 flex flex-col justify-center" id="cenario-preview-column">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-800 bg-[#070709] shadow-2xl flex items-center justify-center" id="stage-viewport">
            {/* 1. Background Layer (Interactive styles) */}
            <div 
              id="layer-background"
              className="absolute inset-0 transition-all duration-500 ease-out"
              style={{
                filter: `blur(${bokehBlur}px)`,
                transform: 'scale(1.05)', // Prevent white edges when blurring
              }}
            >
              {bgStyle === 'neon' && (
                <div className="w-full h-full bg-gradient-to-tr from-[#140526] via-[#090310] to-[#040c1e] flex justify-around items-center p-8">
                  <div className="w-24 h-48 rounded-full bg-purple-600/30 filter blur-3xl animate-pulse" />
                  <div className="w-32 h-32 rounded-full bg-pink-500/20 filter blur-2xl" />
                  <div className="w-16 h-32 rounded-xl bg-blue-500/30 filter blur-3xl" />
                  <div className="absolute right-12 top-8 w-1 h-32 bg-pink-500 rounded-full opacity-60 shadow-[0_0_20px_#ec4899]" />
                  <div className="absolute left-8 bottom-12 w-1.5 h-24 bg-blue-500 rounded-full opacity-60 shadow-[0_0_20px_#3b82f6]" />
                </div>
              )}
              {bgStyle === 'warm' && (
                <div className="w-full h-full bg-gradient-to-tr from-[#130d07] via-[#0d0702] to-[#1e1408] flex justify-between items-end p-12">
                  <div className="w-48 h-32 rounded-lg bg-amber-900/20 border border-amber-900/10 flex flex-col p-4 space-y-2">
                    <div className="h-2 bg-amber-800/20 rounded w-1/3" />
                    <div className="h-1 bg-amber-800/10 rounded w-1/2" />
                  </div>
                  <div className="w-24 h-48 rounded-md bg-[#25180c]/50 shadow-inner flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-amber-500/40 filter blur-md animate-pulse" />
                  </div>
                  <div className="absolute left-1/4 top-1/4 w-32 h-32 bg-amber-600/20 rounded-full filter blur-3xl" />
                </div>
              )}
              {bgStyle === 'tech' && (
                <div className="w-full h-full bg-gradient-to-tr from-[#0a0f18] via-[#04060b] to-[#161d2d] flex justify-around items-center p-8">
                  <div className="w-40 h-40 rounded-xl bg-neutral-900/60 border border-neutral-800 p-3 relative">
                    <div className="absolute inset-x-4 top-2 h-0.5 bg-cyan-500/40 shadow-[0_0_5px_#06b6d4]" />
                  </div>
                  <div className="w-1.5 h-36 bg-cyan-500/20 shadow-[0_0_15px_#06b6d4] rounded" />
                  <div className="w-2 h-20 bg-blue-500/10 rounded" />
                </div>
              )}
              {bgStyle === 'corporate' && (
                <div className="w-full h-full bg-gradient-to-tr from-[#eef2f6] via-[#f8fafc] to-[#e2e8f0] flex justify-between items-center p-12">
                  <div className="w-32 h-48 bg-white rounded-xl shadow-lg flex flex-col p-3 space-y-4 border border-neutral-100">
                    <div className="h-8 bg-neutral-100 rounded" />
                    <div className="h-2 bg-neutral-100 rounded w-2/3" />
                  </div>
                  <div className="w-40 h-32 bg-emerald-100/40 rounded-full border border-emerald-200/20 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 filter blur-xl" />
                  </div>
                </div>
              )}
            </div>

            {/* 2. Midground Layer (The Presenter Avatar) */}
            <div 
              id="layer-midground"
              className={`absolute inset-x-0 bottom-0 top-1/4 flex transition-all duration-500 ease-out z-20 ${
                presenterAlign === 'left' ? 'justify-start pl-16' : 
                presenterAlign === 'right' ? 'justify-end pr-16' : 
                'justify-center'
              }`}
            >
              {/* Presenter Silhouette */}
              <div className="relative w-44 h-full flex flex-col items-center" id="presenter-silhouette-body">
                {/* Head */}
                <div className="w-20 h-20 rounded-full bg-neutral-200 shadow-xl border border-white/20 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-neutral-800 to-neutral-400" />
                  {/* Eyes / Looking line representation */}
                  <div className={`absolute top-8 flex gap-3 transition-transform duration-300 ${
                    presenterAlign === 'left' ? 'translate-x-2' : 
                    presenterAlign === 'right' ? '-translate-x-2' : 
                    'translate-x-0'
                  }`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                  </div>
                </div>
                {/* Neck */}
                <div className="w-4 h-6 bg-gradient-to-b from-neutral-300 to-neutral-400 -mt-1" />
                {/* Shoulders / Torso */}
                <div className="w-40 h-full rounded-t-[40px] bg-gradient-to-b from-neutral-300 via-neutral-400 to-neutral-600 shadow-xl border-t border-white/30 flex items-start justify-center pt-6">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-800 font-bold opacity-60">Criador</span>
                </div>
              </div>
            </div>

            {/* 3. Foreground Layer (Unblurred Element) */}
            {foreground !== 'none' && (
              <div 
                id="layer-foreground"
                className={`absolute bottom-4 z-30 transition-all duration-500 ease-out flex items-center justify-center ${
                  presenterAlign === 'left' ? 'right-24' : 'left-24'
                }`}
              >
                {foreground === 'coffee' && (
                  <div className="relative group p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center scale-110" id="fore-coffee-graphic">
                    <span className="text-xs font-mono font-bold text-neutral-300">Caneca</span>
                    <div className="absolute -top-4 w-4 h-4 bg-white/20 rounded-full filter blur-md animate-ping" />
                    <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider">Foreground</span>
                  </div>
                )}
                {foreground === 'mic' && (
                  <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center scale-110" id="fore-mic-graphic">
                    <span className="text-xs font-mono font-bold text-neutral-300">Microfone</span>
                    <div className="w-1 h-12 bg-neutral-600 rounded-full mt-1" />
                    <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider mt-1">Foreground</span>
                  </div>
                )}
                {foreground === 'plant' && (
                  <div className="p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl flex flex-col items-center scale-110" id="fore-plant-graphic">
                    <span className="text-xs font-mono font-bold text-neutral-300">Vaso Planta</span>
                    <span className="text-[8px] font-mono uppercase text-neutral-400 tracking-wider mt-1">Foreground</span>
                  </div>
                )}
              </div>
            )}

            {/* 4. Rule of Thirds Overlay */}
            {showGrid && (
              <div className="absolute inset-0 z-40 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30 border border-neutral-700/50" id="grid-thirds-overlay">
                <div className="border-r border-b border-dashed border-neutral-500" />
                <div className="border-r border-b border-dashed border-neutral-500" />
                <div className="border-b border-dashed border-neutral-500" />
                
                <div className="border-r border-b border-dashed border-neutral-500" />
                {/* Focal Points markers */}
                <div className="border-r border-b border-dashed border-neutral-500 relative">
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full" />
                </div>
                <div className="border-b border-dashed border-neutral-500 relative">
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-red-500 rounded-full" />
                </div>

                <div className="border-r border-dashed border-neutral-500" />
                <div className="border-r border-dashed border-neutral-500" />
                <div className="" />
              </div>
            )}

            {/* Camera Frame/Skins Overlay */}
            <div className="absolute inset-4 border border-neutral-500/20 pointer-events-none flex flex-col justify-between p-2 z-40 font-mono text-[9px] text-neutral-500" id="camera-skins">
              <div className="flex justify-between w-full">
                <span>REC</span>
                <span>1080P 24FPS</span>
              </div>
              <div className="flex justify-between w-full">
                <span>ISO 400</span>
                <span>CH1/2</span>
              </div>
            </div>
          </div>

          {/* Educational Feedback */}
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5" id="composition-feedback-card">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              Diagnóstico de Composição Visual:
            </span>
            <p className="text-xs text-neutral-300 mt-1">
              {presenterAlign === 'center' ? (
                'O alinhamento centralizado é ideal para contato direto e íntimo. Ao ativar a Grade, certifique-se de alinhar os seus olhos com a linha horizontal superior da regra dos terços.'
              ) : (
                'O alinhamento lateral (Esquerda/Direita) cria espaço para grafismos, textos explicativos e telas de apoio. Mantenha o seu olhar direcionado para o lado vazio do vídeo (Lookroom).'
              )}
              {bokehBlur > 10 && ' Excelente controle óptico! O desfoque bokeh separa você do fundo de forma cinematográfica, dando destaque à sua silhueta e valor de produção.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
