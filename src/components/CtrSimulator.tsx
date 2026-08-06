import React, { useState } from 'react';

const THUMB_PRESETS = [
  'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80', // Tech workspace desk
  'https://images.unsplash.com/photo-1616469829581-73993eb86b02?auto=format&fit=crop&w=600&q=80', // YouTuber setup mic
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80', // Code / edit screen laptop
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=600&q=80'  // Gaming / color grading
];

export default function CtrSimulator() {
  const [title, setTitle] = useState('O SEGREDO por trás do Áudio Perfeito dos canais Gigantes (Sem gastar nada)');
  const [thumbUrl, setThumbUrl] = useState(THUMB_PRESETS[1]);
  const [overlayText, setOverlayText] = useState('ÁUDIO CINEMA!');
  const [wordCountOnCapa, setWordCountOnCapa] = useState<number>(2);

  // Analysis variables
  const titleLength = title.length;
  const isTitleOverLimit = titleLength > 65;
  const isThumbTextCluttered = wordCountOnCapa > 4;

  const getTitleRating = () => {
    if (titleLength === 0) return { status: 'none', label: 'Insira um título' };
    if (titleLength > 75) return { status: 'bad', label: 'Muito Longo (será cortado no celular)', color: 'text-red-400' };
    if (titleLength > 60) return { status: 'warning', label: 'Risco de corte em telas pequenas', color: 'text-amber-400' };
    if (titleLength < 25) return { status: 'warning', label: 'Muito curto (desperdiça gatilhos)', color: 'text-amber-400' };
    return { status: 'good', label: 'Excelente comprimento!', color: 'text-emerald-400' };
  };

  const getCapaRating = () => {
    if (wordCountOnCapa > 5) return { status: 'bad', label: 'Poluída (reduz legibilidade sob scroll)', color: 'text-red-400' };
    if (wordCountOnCapa === 0) return { status: 'warning', label: 'Sem texto de apoio (recomenda-se 2-3 palavras)', color: 'text-amber-400' };
    return { status: 'good', label: 'Excelente densidade de texto!', color: 'text-emerald-400' };
  };

  const titleRating = getTitleRating();
  const capaRating = getCapaRating();

  return (
    <div className="space-y-6" id="ctr-simulator-root">
      <div>
        <h4 className="text-lg font-medium text-white tracking-tight" id="ctr-title">Simulador de CTR Feed & Auditor de Embalagem</h4>
        <p className="text-xs text-neutral-400">Teste como seu vídeo se comportará no feed do YouTube e descubra se o seu título será cortado em telas menores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="ctr-simulator-grid">
        {/* Left column: Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-4" id="ctr-inputs-col">
          
          {/* Title Input */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-2" id="input-title-card">
            <div className="flex justify-between items-center text-xs font-semibold text-neutral-300">
              <span className="uppercase tracking-wider">Título do Vídeo (CTR)</span>
              <span className={`font-mono ${isTitleOverLimit ? 'text-red-400' : 'text-neutral-400'}`}>{titleLength} / 100 char</span>
            </div>
            <textarea
              id="input-title"
              rows={2}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs text-white placeholder-neutral-500 glass-input rounded-lg p-2.5 resize-none leading-relaxed focus:outline-none"
              placeholder="Escreva o título do vídeo para testar..."
            />
          </div>

          {/* Thumbnail Select / URL */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3" id="input-thumbnail-card">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">Imagem de Capa (Thumbnail)</span>
            <div className="flex gap-2" id="thumbnail-presets-row">
              {THUMB_PRESETS.map((preset, i) => (
                <button
                  key={i}
                  id={`preset-thumb-btn-${i}`}
                  onClick={() => setThumbUrl(preset)}
                  className={`relative flex-1 aspect-video rounded-lg overflow-hidden border transition-all cursor-pointer ${
                    thumbUrl === preset ? 'border-amber-400 scale-[1.05]' : 'border-neutral-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={preset} alt={`Preset ${i}`} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-400 font-mono">Ou cole o link de uma imagem externa:</span>
              <input
                id="input-thumb-url"
                type="text"
                value={thumbUrl}
                onChange={(e) => setThumbUrl(e.target.value)}
                className="w-full text-xs text-white glass-input rounded-lg p-2 focus:outline-none"
                placeholder="Link da imagem..."
              />
            </div>
          </div>

          {/* Text Overlay on Thumbnail */}
          <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-3" id="input-overlay-card">
            <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">Texto Escrito na Capa</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-mono">Texto simulado:</span>
                <input
                  id="input-thumb-text"
                  type="text"
                  value={overlayText}
                  onChange={(e) => setOverlayText(e.target.value)}
                  className="w-full text-xs text-white glass-input rounded-lg p-2 focus:outline-none"
                  placeholder="Texto da capa..."
                />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-400 font-mono">Nº de Palavras na Capa:</span>
                <div className="flex items-center gap-2">
                  <input
                    id="slider-word-count"
                    type="range"
                    min="0"
                    max="10"
                    value={wordCountOnCapa}
                    onChange={(e) => setWordCountOnCapa(Number(e.target.value))}
                    className="flex-1 accent-amber-400 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold text-white">{wordCountOnCapa}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right column: Feed Simulator and analysis (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between" id="ctr-simulation-col">
          
          {/* YouTube Mobile Feed Simulation container */}
          <div className="p-4 rounded-2xl bg-neutral-900/20 border border-neutral-800 space-y-3" id="mobile-feed-simulator">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
              YOUTUBE MOBILE APP FEED PREVIEW
            </span>

            {/* Simulated Feed card */}
            <div className="w-full max-w-sm mx-auto bg-black rounded-xl overflow-hidden border border-neutral-800 shadow-xl" id="youtube-feed-card">
              {/* Image Thumbnail wrapper */}
              <div className="relative aspect-video w-full bg-neutral-900" id="feed-card-thumb">
                <img src={thumbUrl} alt="Thumbnail Preview" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                
                {/* Simulated Custom Text Overlay inside thumbnail */}
                {overlayText && wordCountOnCapa > 0 && (
                  <div className="absolute left-3 bottom-3 bg-red-600 text-white font-bold text-lg px-2.5 py-1 tracking-tight rotate-[-2deg] uppercase shadow-lg select-none" id="feed-card-overlay-text">
                    {overlayText}
                  </div>
                )}

                {/* Video Timestamp mark bottom-right */}
                <span className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-white select-none">12:35</span>
              </div>

              {/* Card Meta Content details */}
              <div className="p-3 flex gap-3" id="feed-card-details">
                {/* Channel icon avatar circle */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 flex-shrink-0 flex items-center justify-center font-bold text-xs text-black select-none">
                  YP
                </div>
                
                {/* Text strings */}
                <div className="space-y-1.5" id="feed-card-meta">
                  {/* Title text */}
                  <h5 className="text-xs font-semibold text-white leading-tight line-clamp-2 pr-4 font-sans" id="feed-card-title">
                    {title || 'Digite o título para visualizar...'}
                  </h5>
                  {/* Channel and Stats */}
                  <div className="text-[10px] text-neutral-400 font-mono" id="feed-card-stats">
                    <p className="font-semibold flex items-center gap-0.5 text-neutral-300">
                      Youtuber Pro Academy 
                      <span className="text-blue-500 text-[10px]" title="Canal Verificado">✓</span>
                    </p>
                    <p>150 mil visualizações • há 2 horas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time automated auditing panel */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" id="auditing-panel">
            {/* Title Analysis */}
            <div className="space-y-1" id="audit-title-box">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Análise de Título:</span>
              <div className="flex items-center gap-1.5 mt-1" id="audit-title-badge">
                <span className={`text-xs font-bold ${titleRating.color}`}>{titleRating.label}</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                Títulos com 30 a 55 caracteres retêm excelente leitura e garantem que nenhuma palavra-chave vital seja oculta pelas elipses do YouTube no celular.
              </p>
            </div>

            {/* Capa Analysis */}
            <div className="space-y-1" id="audit-capa-box">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Análise da Capa:</span>
              <div className="flex items-center gap-1.5 mt-1" id="audit-capa-badge">
                <span className={`text-xs font-bold ${capaRating.color}`}>{capaRating.label}</span>
              </div>
              <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                Menos é mais! Imagens limpas focando em 3 elementos principais são processadas em milissegundos pelo olho do usuário durante o scroll de feeds.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
