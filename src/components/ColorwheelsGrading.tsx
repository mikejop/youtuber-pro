import React, { useState } from 'react';

export default function ColorwheelsGrading() {
  const [profile, setProfile] = useState<'log' | 'rec709'>('log');
  const [lutPreset, setLutPreset] = useState<'none' | 'orange-teal' | 'vintage' | 'cyberpunk'>('none');
  
  // Grading Parameters
  const [shadowsBlue, setShadowsBlue] = useState<number>(0);  // -50 to 50
  const [midtonesWarm, setMidtonesWarm] = useState<number>(0);  // -50 to 50
  const [highlightsExposure, setHighlightsExposure] = useState<number>(0); // -50 to 50

  const handleReset = () => {
    setProfile('log');
    setLutPreset('none');
    setShadowsBlue(0);
    setMidtonesWarm(0);
    setHighlightsExposure(0);
  };

  const applyPreset = (preset: 'none' | 'orange-teal' | 'vintage' | 'cyberpunk') => {
    setLutPreset(preset);
    setProfile('rec709'); // Converting from log automatically
    if (preset === 'orange-teal') {
      setShadowsBlue(25);   // Cyan/Blue shadows
      setMidtonesWarm(30);  // Warm Orange skins
      setHighlightsExposure(10);
    } else if (preset === 'vintage') {
      setShadowsBlue(-10);
      setMidtonesWarm(20);
      setHighlightsExposure(-15);
    } else if (preset === 'cyberpunk') {
      setShadowsBlue(40);
      setMidtonesWarm(-20);
      setHighlightsExposure(20);
    } else {
      setShadowsBlue(0);
      setMidtonesWarm(0);
      setHighlightsExposure(0);
    }
  };

  // Build the dynamic CSS filters and overlay styles based on parameters
  const getImageStyle = () => {
    let filterString = '';
    
    if (profile === 'log') {
      // Gray, low contrast, washed out
      filterString = 'saturate(45%) contrast(70%) brightness(108%) sepia(10%)';
    } else {
      // Rec709 (Normalized base)
      let contrast = 115 + (highlightsExposure * 0.4);
      let saturation = 110 + (midtonesWarm * 0.5);
      let brightness = 100 + (highlightsExposure * 0.3);
      filterString = `contrast(${contrast}%) saturate(${saturation}%) brightness(${brightness}%)`;
    }

    return {
      filter: filterString,
      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
    };
  };

  // Overlay color blend representing Shadows (Lift) and Midtones (Gamma) color wheel offsets
  const getOverlayStyle = () => {
    if (profile === 'log') return { opacity: 0 };

    let r = 128;
    let g = 128;
    let b = 128;

    // Shift red/green/blue based on shadowsBlue and midtonesWarm
    if (shadowsBlue > 0) {
      b += shadowsBlue * 2;
      r -= shadowsBlue * 1; // cooler shadows
    }
    if (midtonesWarm > 0) {
      r += midtonesWarm * 2;
      g += midtonesWarm * 0.8;
      b -= midtonesWarm * 1.5; // warmer midtones
    }

    return {
      backgroundColor: `rgb(${r}, ${g}, ${b})`,
      mixBlendMode: 'color-burn' as any,
      opacity: Math.max(Math.abs(shadowsBlue), Math.abs(midtonesWarm)) * 0.005,
      transition: 'all 0.4s ease'
    };
  };

  return (
    <div className="space-y-6" id="color-grading-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-lg font-medium text-white tracking-tight" id="color-title">Laboratório de Correção & Color Grading</h4>
          <p className="text-xs text-neutral-400">Aprenda a revelar perfis LOG lavados de alta latitude e aplicar gradações criativas de cinema.</p>
        </div>
        <button
          id="btn-reset-grading"
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          Restaurar Original
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="color-grid">
        
        {/* Left Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4" id="color-controls-col">
          
          {/* Profile Select */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-2" id="profile-selector">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Espaço de Cor / Perfil</span>
            <div className="flex gap-2" id="profile-toggles">
              <button
                id="btn-profile-log"
                onClick={() => { setProfile('log'); setLutPreset('none'); }}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  profile === 'log' 
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-neutral-400 border border-white/5 hover:text-white'
                }`}
              >
                S-Log / RAW (Cinza)
              </button>
              <button
                id="btn-profile-rec709"
                onClick={() => setProfile('rec709')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  profile === 'rec709' && lutPreset === 'none'
                    ? 'bg-white text-black' 
                    : 'bg-white/5 text-neutral-400 border border-white/5 hover:text-white'
                }`}
              >
                Rec.709 (Conversão)
              </button>
            </div>
          </div>

          {/* Hollywood LUT Presets */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-2" id="lut-presets-box">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Aplicar Visual Criativo (LUT)</span>
            <div className="grid grid-cols-2 gap-2" id="presets-buttons">
              {[
                { id: 'none', label: 'Sem Efeito (Rec.709)' },
                { id: 'orange-teal', label: 'Hollywood Teal & Orange' },
                { id: 'vintage', label: 'Vintage Warm Film' },
                { id: 'cyberpunk', label: 'Cyberpunk Acid Blue' }
              ].map(lut => (
                <button
                  key={lut.id}
                  id={`lut-preset-btn-${lut.id}`}
                  onClick={() => applyPreset(lut.id as any)}
                  className={`p-2.5 rounded-xl text-xs font-medium text-left transition-all cursor-pointer ${
                    lutPreset === lut.id 
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                      : 'bg-white/5 text-neutral-300 border border-white/5 hover:border-white/10'
                  }`}
                >
                  {lut.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color Wheel Adjusters */}
          <div className="p-3.5 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-4" id="wheels-adjusters">
            <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block">Ajustes Finos (Lift, Gamma, Gain)</span>
            
            {/* Shadows */}
            <div className="space-y-1" id="shadows-slider">
              <div className="flex justify-between text-xs font-medium text-neutral-300">
                <span>Shadows / Lift (Sombra azulada)</span>
                <span className="font-mono text-[10px] text-blue-400">{shadowsBlue > 0 ? `+${shadowsBlue}` : shadowsBlue}</span>
              </div>
              <input
                id="slider-shadows-blue"
                type="range"
                min="-50"
                max="50"
                value={shadowsBlue}
                disabled={profile === 'log'}
                onChange={(e) => setShadowsBlue(Number(e.target.value))}
                className="w-full accent-blue-400 h-1 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Midtones */}
            <div className="space-y-1" id="midtones-slider">
              <div className="flex justify-between text-xs font-medium text-neutral-300">
                <span>Midtones / Gamma (Pele quente)</span>
                <span className="font-mono text-[10px] text-amber-500">{midtonesWarm > 0 ? `+${midtonesWarm}` : midtonesWarm}</span>
              </div>
              <input
                id="slider-midtones-warm"
                type="range"
                min="-50"
                max="50"
                value={midtonesWarm}
                disabled={profile === 'log'}
                onChange={(e) => setMidtonesWarm(Number(e.target.value))}
                className="w-full accent-amber-500 h-1 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>

            {/* Highlights */}
            <div className="space-y-1" id="highlights-slider">
              <div className="flex justify-between text-xs font-medium text-neutral-300">
                <span>Highlights / Gain (Exposição do Brilho)</span>
                <span className="font-mono text-[10px] text-white">{highlightsExposure > 0 ? `+${highlightsExposure}` : highlightsExposure}</span>
              </div>
              <input
                id="slider-highlights-exposure"
                type="range"
                min="-50"
                max="50"
                value={highlightsExposure}
                disabled={profile === 'log'}
                onChange={(e) => setHighlightsExposure(Number(e.target.value))}
                className="w-full accent-white h-1 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-30"
              />
            </div>
          </div>

        </div>

        {/* Right Frame Viewport (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-center" id="color-viewport-col">
          
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl bg-[#000]" id="color-viewer">
            
            {/* Viewfinder Vector Frame represents the footage clip */}
            <div 
              className="absolute inset-0 w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url("/img/bg/bg_studio.webp")',
                ...getImageStyle()
              }}
              id="clip-image-layer"
            />

            {/* Dynamic Color overlay representing wheels alterations */}
            <div 
              className="absolute inset-0 pointer-events-none transition-all duration-300 mix-blend-color"
              style={getOverlayStyle()}
              id="clip-color-overlay"
            />

            {/* Top info and indicators */}
            <div className="absolute inset-4 flex flex-col justify-between pointer-events-none z-10 text-[9px] font-mono text-white/75" id="viewfinder-labels">
              <div className="flex justify-between">
                <span className="bg-black/50 px-2 py-0.5 rounded border border-white/5 uppercase">
                  {profile === 'log' ? 'Input: FLAT S-LOG3' : `LUT: ${lutPreset.toUpperCase()}`}
                </span>
                <span className="bg-black/50 px-2 py-0.5 rounded border border-white/5">LUT REC.709 ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span className="bg-black/50 px-2 py-0.5 rounded border border-white/5">SCOPE: WAVEFORM OK</span>
                <span className="bg-black/50 px-2 py-0.5 rounded border border-white/5">COLOR DEPTH: 10-BIT</span>
              </div>
            </div>
          </div>

          {/* Educational advise card */}
          <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/5" id="color-coaching-box">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              Engenharia de Cores:
            </span>
            <p className="text-xs text-neutral-300 mt-1" id="color-coaching-text">
              {profile === 'log' ? (
                'O perfil LOG de fábrica retém o alcance dinâmico estendido para evitar perda de dados nas luzes e sombras, mas fica sem graça e cinza na tela. Clique em "Rec.709" ou selecione um visual de LUT para convertê-lo e revelar as cores reais!'
              ) : lutPreset === 'orange-teal' ? (
                'O clássico Teal & Orange de Hollywood joga tons complementares opostos: frios/azulados nas sombras de fundo (Teal) e quentes e amarelados nos tons de pele humanos (Orange), criando o máximo de separação cromática possível.'
              ) : (
                'Sucesso! Seu sinal de cor foi devidamente mapeado no espaço Rec.709. Agora ajuste Lift, Gamma e Gain para harmonizar as cores do cenário com o tom de pele natural do apresentador.'
              )}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
