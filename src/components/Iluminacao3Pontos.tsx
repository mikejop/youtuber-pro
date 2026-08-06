import React, { useState } from 'react';

export default function Iluminacao3Pontos() {
  const [keyIntensity, setKeyIntensity] = useState<number>(80);
  const [keyKelvin, setKeyKelvin] = useState<number>(4500); // 2700 to 6500
  const [fillIntensity, setFillIntensity] = useState<number>(30);
  const [backIntensity, setBackIntensity] = useState<number>(70);
  const [backColor, setBackColor] = useState<'cyan' | 'pink' | 'amber' | 'white'>('pink');

  // Convert kelvin temperature to dynamic hex or rgb color representation
  const getKelvinColor = (k: number) => {
    if (k < 3500) return 'rgba(251, 191, 36, 0.45)'; // Very warm amber
    if (k < 5000) return 'rgba(255, 255, 255, 0.4)'; // Neutral soft white
    return 'rgba(147, 197, 253, 0.45)'; // Cool daylight blue
  };

  const getBackColorHex = (color: string) => {
    switch (color) {
      case 'cyan': return 'rgba(6, 182, 212, 0.7)';
      case 'pink': return 'rgba(236, 72, 153, 0.7)';
      case 'amber': return 'rgba(245, 158, 11, 0.7)';
      default: return 'rgba(255, 255, 255, 0.7)';
    }
  };

  const getBackGlowHex = (color: string) => {
    switch (color) {
      case 'cyan': return 'rgba(6, 182, 212, 0.45)';
      case 'pink': return 'rgba(236, 72, 153, 0.45)';
      case 'amber': return 'rgba(245, 158, 11, 0.45)';
      default: return 'rgba(255, 255, 255, 0.45)';
    }
  };

  return (
    <div className="space-y-6" id="lighting-3point-root">
      <div>
        <h4 className="text-lg font-medium text-white tracking-tight" id="lighting-title">Simulador de Iluminação de 3 Pontos</h4>
        <p className="text-xs text-neutral-400">Controle as potências e temperaturas do set clássico de estúdio de cinema e veja a resposta visual no criador.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="lighting-grid">
        {/* Left: Dynamic controls */}
        <div className="lg:col-span-5 space-y-4 p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md" id="lighting-controls-col">
          {/* 1. Key Light */}
          <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/5" id="light-control-key">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">Key Light (Luz Principal)</span>
              <span className="font-mono text-[10px] text-amber-400">{keyIntensity}% | {keyKelvin}K</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-12">Intensidade:</span>
                <input
                  id="slider-key-intensity"
                  type="range"
                  min="0"
                  max="100"
                  value={keyIntensity}
                  onChange={(e) => setKeyIntensity(Number(e.target.value))}
                  className="flex-1 accent-amber-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-neutral-400 w-12">Cor/Temp:</span>
                <input
                  id="slider-key-kelvin"
                  type="range"
                  min="2700"
                  max="6500"
                  step="100"
                  value={keyKelvin}
                  onChange={(e) => setKeyKelvin(Number(e.target.value))}
                  className="flex-1 accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2. Fill Light */}
          <div className="space-y-2 p-3 rounded-lg bg-white/5 border border-white/5" id="light-control-fill">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">Fill Light (Luz de Preenchimento)</span>
              <span className="font-mono text-[10px] text-blue-300">{fillIntensity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 w-12">Intensidade:</span>
              <input
                id="slider-fill-intensity"
                type="range"
                min="0"
                max="100"
                value={fillIntensity}
                onChange={(e) => setFillIntensity(Number(e.target.value))}
                className="flex-1 accent-blue-300 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Backlight */}
          <div className="space-y-3 p-3 rounded-lg bg-white/5 border border-white/5" id="light-control-back">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
              <span className="flex items-center gap-1.5">Backlight (Recorte / Cabelo)</span>
              <span className="font-mono text-[10px] text-pink-400">{backIntensity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400 w-12">Intensidade:</span>
              <input
                id="slider-back-intensity"
                type="range"
                min="0"
                max="100"
                value={backIntensity}
                onChange={(e) => setBackIntensity(Number(e.target.value))}
                className="flex-1 accent-pink-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-neutral-400">Escolha de Cor:</span>
              <div className="flex gap-2" id="backlight-color-picks">
                {[
                  { id: 'cyan', bg: 'bg-cyan-500', label: 'Neon' },
                  { id: 'pink', bg: 'bg-pink-500', label: 'Cyber' },
                  { id: 'amber', bg: 'bg-amber-500', label: 'Warm' },
                  { id: 'white', bg: 'bg-neutral-100', label: 'Soft' }
                ].map(col => (
                  <button
                    key={col.id}
                    id={`back-color-${col.id}`}
                    onClick={() => setBackColor(col.id as any)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                      backColor === col.id 
                        ? 'border-white text-white' 
                        : 'border-white/10 text-neutral-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${col.bg}`} />
                    {col.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Lighting simulation visualizer */}
        <div className="lg:col-span-7 flex flex-col justify-center" id="lighting-visualizer-col">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-800 bg-[#040405] shadow-2xl flex items-center justify-center" id="studio-overhead-view">
            {/* Background color glow matching Backlight */}
            <div 
              className="absolute inset-0 transition-all duration-300 filter blur-3xl opacity-40 mix-blend-screen"
              style={{
                background: `radial-gradient(circle, ${getBackGlowHex(backColor)} 0%, rgba(0,0,0,0) 70%)`,
                opacity: (backIntensity / 100) * 0.5
              }}
              id="lighting-bg-glow"
            />

            {/* Base Studio Portrait Silhouette */}
            <div className="relative w-48 h-full flex flex-col items-center justify-end pb-4" id="studio-portrait">
              {/* BACKLIGHT GOW OVER HEAD & SHOULDERS */}
              <div 
                className="absolute inset-x-0 bottom-4 top-1/4 filter blur-[6px] rounded-t-[50px] mix-blend-screen transition-all duration-300 pointer-events-none"
                style={{
                  borderTop: `6px solid ${getBackColorHex(backColor)}`,
                  borderLeft: `3px solid ${getBackColorHex(backColor)}`,
                  borderRight: `3px solid ${getBackColorHex(backColor)}`,
                  opacity: (backIntensity / 100) * 0.85
                }}
                id="lighting-backlight-rim"
              />

              {/* Head */}
              <div className="w-24 h-24 rounded-full bg-neutral-900 border border-neutral-800 relative overflow-hidden shadow-2xl" id="portrait-head">
                {/* 1. KEY LIGHT HIGHLIGHT (Top-Right of face) */}
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-300 mix-blend-screen"
                  style={{
                    background: `radial-gradient(circle at 75% 25%, ${getKelvinColor(keyKelvin)} 0%, rgba(0,0,0,0) 65%)`,
                    opacity: keyIntensity / 100
                  }}
                  id="portrait-key-light"
                />

                {/* 2. FILL LIGHT SOFT GLOW (Left side of face) */}
                <div 
                  className="absolute inset-0 rounded-full transition-all duration-300 mix-blend-screen"
                  style={{
                    background: `radial-gradient(circle at 20% 70%, rgba(147, 197, 253, 0.25) 0%, rgba(0,0,0,0) 60%)`,
                    opacity: fillIntensity / 100
                  }}
                  id="portrait-fill-light"
                />

                {/* Flat drawing represent facial shadow contrast */}
                <div className="absolute inset-0 border-l-[30px] border-black/35 rounded-full pointer-events-none mix-blend-multiply" />
              </div>

              {/* Neck */}
              <div className="w-5 h-8 bg-neutral-950 -mt-1.5 relative overflow-hidden">
                <div 
                  className="absolute inset-0 mix-blend-screen"
                  style={{
                    background: `linear-gradient(90deg, rgba(0,0,0,0) 40%, ${getKelvinColor(keyKelvin)} 100%)`,
                    opacity: keyIntensity / 100
                  }}
                />
              </div>

              {/* Shoulders */}
              <div className="w-44 h-40 rounded-t-[50px] bg-neutral-900 border-t border-neutral-800 relative overflow-hidden" id="portrait-shoulders">
                {/* Key Light on shoulders */}
                <div 
                  className="absolute inset-0 mix-blend-screen"
                  style={{
                    background: `radial-gradient(circle at 80% 0%, ${getKelvinColor(keyKelvin)} 0%, rgba(0,0,0,0) 70%)`,
                    opacity: keyIntensity / 100
                  }}
                />
                {/* Fill Light on shoulders */}
                <div 
                  className="absolute inset-0 mix-blend-screen"
                  style={{
                    background: `radial-gradient(circle at 20% 0%, rgba(147, 197, 253, 0.2) 0%, rgba(0,0,0,0) 70%)`,
                    opacity: fillIntensity / 100
                  }}
                />
              </div>
            </div>

            {/* Light Source Overlays (Overhead 2D Indicators positioned on screen corners) */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-amber-400/20" id="indicator-key">
              <span className="text-[8px] font-mono font-bold text-amber-400">KEY LIGHT (45° Diagonal)</span>
            </div>

            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-blue-400/20" id="indicator-fill">
              <span className="text-[8px] font-mono font-bold text-blue-300">FILL LIGHT (30% Int.)</span>
            </div>

            <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md border border-pink-400/20" id="indicator-back">
              <span className="text-[8px] font-mono font-bold text-pink-400">BACKLIGHT (Separação)</span>
            </div>
          </div>

          {/* Educational Feedback */}
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5" id="lighting-rules-card">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              Princípios da Iluminação Pro:
            </span>
            <p className="text-xs text-neutral-300 mt-1">
              {fillIntensity > keyIntensity ? (
                <span className="text-red-400 font-medium">Aviso de Exposição: A Luz de Preenchimento (Fill) está mais forte que a Principal (Key). Isso causa uma imagem achatada sem volume cromático e sombras. Reduza a Fill para cerca de 30% da Key.</span>
              ) : (
                `Excelente! A Key Light (Luz Principal) a ${keyIntensity}% cria o contraste adequado no rosto, enquanto a Fill Light a ${fillIntensity}% preenche as sombras escuras sem eliminá-las completamente. O Backlight destacado com cor cria uma borda nítida de separação contra o cenário.`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
