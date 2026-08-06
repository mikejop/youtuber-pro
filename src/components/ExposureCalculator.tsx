import React, { useState, useEffect } from 'react';

export default function ExposureCalculator() {
  const [fps, setFps] = useState<24 | 30 | 60 | 120>(24);
  const [aperture, setAperture] = useState<number>(2.8); // f/stops
  const [iso, setIso] = useState<number>(400);

  // Available Aperture Stops
  const apertureStops = [1.4, 1.8, 2.8, 4.0, 5.6, 8.0, 11, 16];

  // Calculated Shutter Speed based on 180-degree rule
  const calculatedShutter = fps * 2;

  // Exposure value calculation logic
  // Shutter coefficient: 1 / calculatedShutter
  // Aperture coefficient: 1 / (aperture * aperture)
  // ISO: iso
  // We can calculate a relative Lux score to guide the user:
  // EV = Log2( (Aperture^2 * Shutter) / ISO )
  // Let's make an intuitive, highly visual "Exposure Indicator Meter"
  const [exposureScore, setExposureScore] = useState<string>('Normal');
  const [evValue, setEvValue] = useState<number>(0);

  useEffect(() => {
    // Relative exposure formula for visualization
    const shutterFraction = 1 / calculatedShutter;
    const apertureFraction = 1 / (aperture * aperture);
    const lightLevel = shutterFraction * apertureFraction * iso * 50; // scaling factor

    // Let's map lightLevel to an EV offset index
    // Ideal range is say 0.8 to 1.5. Below is underexposed, above is overexposed.
    if (lightLevel < 0.4) {
      setExposureScore('Subexposto (Muito Escuro)');
      setEvValue(-2);
    } else if (lightLevel < 0.85) {
      setExposureScore('Subexposto Leve');
      setEvValue(-1);
    } else if (lightLevel > 2.5) {
      setExposureScore('Superexposto (Estourado)');
      setEvValue(2);
    } else if (lightLevel > 1.6) {
      setExposureScore('Superexposto Leve');
      setEvValue(1);
    } else {
      setExposureScore('Exposição Perfeita (0 EV)');
      setEvValue(0);
    }
  }, [fps, aperture, iso, calculatedShutter]);

  return (
    <div className="space-y-6" id="exposure-root">
      <div>
        <h4 className="text-lg font-medium text-white tracking-tight" id="exposure-title">Simulador do Triângulo de Exposição & Regra dos 180°</h4>
        <p className="text-xs text-neutral-400">Garante desfoque de movimento natural regulando Shutter, ISO e Abertura sob as leis da física óptica.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="exposure-grid">
        {/* Left: Input sliders (7 columns) */}
        <div className="md:col-span-7 space-y-5" id="exposure-inputs-col">
          {/* 1. FPS & Shutter rule */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3" id="exposure-fps-card">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
              Taxa de Quadros (FPS) para cálculo do Shutter Speed ideal
            </label>
            <div className="grid grid-cols-4 gap-2" id="fps-options-grid">
              {([24, 30, 60, 120] as const).map(frameRate => (
                <button
                  key={frameRate}
                  id={`fps-btn-${frameRate}`}
                  onClick={() => setFps(frameRate)}
                  className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    fps === frameRate 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-white/5 text-neutral-400 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {frameRate} fps
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex justify-between items-center" id="shutter-speed-display-box">
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Velocidade do Obturador (Regra 180°):</span>
              <span className="text-sm font-mono font-bold text-emerald-400" id="shutter-calculated">1/{calculatedShutter}s</span>
            </div>
            <p className="text-[10px] text-neutral-500 italic">
              A Regra dos 180 Graus define o Shutter Speed como o dobro da taxa de frames (1/2x FPS) para criar o Motion Blur natural idêntico ao olho humano.
            </p>
          </div>

          {/* 2. Aperture control */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3" id="exposure-aperture-card">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Abertura do Diafragma (f/stop)
              </label>
              <span className="text-xs font-mono font-bold text-blue-400" id="aperture-f-display">f/{aperture}</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5" id="aperture-stops-grid">
              {apertureStops.map(stop => (
                <button
                  key={stop}
                  id={`aperture-stop-btn-${stop.toString().replace('.', '-')}`}
                  onClick={() => setAperture(stop)}
                  className={`py-1.5 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${
                    aperture === stop 
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30' 
                      : 'bg-white/5 text-neutral-500 border border-white/5 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {stop}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-neutral-500 italic">
              Aberturas menores (f/1.4, f/1.8) deixam passar MUITA luz e criam o clássico desfoque de fundo (bokeh). Aberturas grandes (f/8, f/11) deixam o cenário todo em foco nítido, mas exigem muita iluminação.
            </p>
          </div>

          {/* 3. ISO control */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3" id="exposure-iso-card">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                Sensibilidade Digital (ISO)
              </label>
              <span className="text-xs font-mono font-bold text-pink-400" id="iso-display">ISO {iso}</span>
            </div>
            <input
              id="slider-iso"
              type="range"
              min="100"
              max="6400"
              step="100"
              value={iso}
              onChange={(e) => setIso(Number(e.target.value))}
              className="w-full accent-pink-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-neutral-500 italic">
              ISO amplifica o sinal digital do sensor de forma eletrônica. ISOs baixos (100, 400) gravam imagens cristalinas sem ruído. ISOs altos (3200+) adicionam granulação pesada e reduzem as cores do vídeo.
            </p>
          </div>
        </div>

        {/* Right: Calculated Indicators & Meter (5 columns) */}
        <div className="md:col-span-5 space-y-4 flex flex-col justify-between" id="exposure-outputs-col">
          <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-5" id="metrics-card">
            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">MÉTRICAS DO SENSOR EM TEMPO REAL</span>

            {/* A. Exposure EV Meter */}
            <div className="space-y-1.5" id="metric-exposure-meter">
              <span className="text-xs font-semibold text-neutral-400">Exposição / Fotômetro</span>
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400 pb-1">
                <span>-2 EV (Escuro)</span>
                <span>0 EV (Ideal)</span>
                <span>+2 EV (Estourado)</span>
              </div>
              <div className="relative h-2 bg-neutral-800 rounded-full overflow-hidden flex items-center justify-center" id="exposure-level-bar">
                {/* Meter ticker cursor */}
                <div 
                  className={`absolute h-4 w-1.5 rounded-full z-10 transition-all duration-300 ${
                    evValue === 0 ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 
                    Math.abs(evValue) === 1 ? 'bg-amber-400' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                  }`}
                  style={{
                    left: `${50 + (evValue * 22)}%`
                  }}
                  id="exposure-ticker"
                />
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-neutral-600" />
              </div>
              <div className="flex items-center gap-1.5 mt-2" id="exposure-diagnostic">
                <span className={`text-xs font-bold ${
                  evValue === 0 ? 'text-emerald-400' : 
                  Math.abs(evValue) === 1 ? 'text-amber-400' : 'text-red-500'
                }`} id="exposure-desc-text">
                  {exposureScore}
                </span>
              </div>
            </div>

            {/* B. Noise Grain impact */}
            <div className="space-y-1.5" id="metric-noise">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-400">Nível de Ruído (Granulação)</span>
                <span className={`font-mono text-[10px] font-bold ${
                  iso <= 400 ? 'text-emerald-400' : iso <= 1600 ? 'text-amber-400' : 'text-red-500'
                }`} id="noise-rating">
                  {iso <= 400 ? 'Baixíssimo (Imagem Limpa)' : iso <= 1600 ? 'Moderado' : 'Alto (Imagem Pixelada)'}
                </span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden" id="noise-progress-wrapper">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    iso <= 400 ? 'bg-emerald-400' : iso <= 1600 ? 'bg-amber-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${(iso / 6400) * 100}%` }}
                  id="noise-progress-bar"
                />
              </div>
            </div>

            {/* C. Bokeh Impact */}
            <div className="space-y-1.5" id="metric-bokeh">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-neutral-400">Desfoque do Fundo (Bokeh)</span>
                <span className={`font-mono text-[10px] font-bold ${
                  aperture <= 2.8 ? 'text-blue-400' : aperture <= 5.6 ? 'text-neutral-300' : 'text-neutral-500'
                }`} id="bokeh-rating">
                  {aperture <= 1.8 ? 'Extremo (Bokeh de Cinema)' : aperture <= 2.8 ? 'Profissional' : aperture <= 5.6 ? 'Fundo Levemente Visível' : 'Fundo Totalmente Focado'}
                </span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden" id="bokeh-progress-wrapper">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    aperture <= 1.8 ? 'bg-blue-400' : aperture <= 2.8 ? 'bg-cyan-400' : 'bg-neutral-600'
                  }`}
                  style={{ width: `${100 - ((apertureStops.indexOf(aperture) / (apertureStops.length - 1)) * 100)}%` }}
                  id="bokeh-progress-bar"
                />
              </div>
            </div>
          </div>

          {/* Educational advice card */}
          <div className="p-3 rounded-xl bg-white/5 border border-white/5" id="exposure-coaching-box">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              Dica de Exposição Pro:
            </span>
            <p className="text-xs text-neutral-300 mt-1" id="coaching-text">
              {evValue < 0 ? (
                'Sua imagem está escura! Para corrigir a subexposição sem adicionar ruído digital de ISO, tente primeiro aumentar a iluminação física do set ou usar uma lente com menor f/stop (abertura maior).'
              ) : evValue > 0 ? (
                'Sua imagem está estourada! Para diminuir a luz que bate no sensor mantendo o motion blur natural (Regra dos 180°), você pode baixar o ISO para 100 ou usar um Filtro ND físico na lente.'
              ) : (
                'Excelente equilíbrio de exposição! Você garantiu movimento orgânico (Regra dos 180°), baixíssimo nível de ruído e desfoque ideal do fundo para sua produção.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
