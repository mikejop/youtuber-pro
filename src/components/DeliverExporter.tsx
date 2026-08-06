import React, { useState } from 'react';

export default function DeliverExporter() {
  const [resolution, setResolution] = useState<'1080p' | '4k'>('4k');
  const [codec, setCodec] = useState<'h264' | 'h265' | 'av1'>('av1');
  const [bitrate, setBitrate] = useState<number>(80);
  const [videoDuration, setVideoDuration] = useState<number>(10); // in minutes

  // Calculate estimated file size in MB
  // Formula: (bitrate in Mbps * duration in seconds) / 8
  const durationInSeconds = videoDuration * 60;
  const fileSizeMb = Math.round((bitrate * durationInSeconds) / 8);

  // Determine YouTube dynamic compression result
  const ytCodec = resolution === '4k' 
    ? (codec === 'av1' ? 'AV01 (Qualidade Cinematográfica)' : 'VP09 (Nitidez Avançada)')
    : 'AVC1 (Alta Compressão - Pixelado em movimentos rápidos)';

  const score = resolution === '4k'
    ? (bitrate >= 60 ? 100 : bitrate >= 40 ? 85 : 60)
    : (bitrate >= 40 ? 55 : 30);

  return (
    <div className="bg-[#1c1c1e] text-white p-6 rounded-2xl border border-white/5 space-y-6 max-w-2xl mx-auto shadow-2xl" id="deliver-exporter-root">
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold tracking-tight">
            Simulador de Render & Codec Delivery
          </h3>
          <p className="text-xs text-neutral-400">Configure as opções para otimizar o player do YouTube.</p>
        </div>
        <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
          Módulo 08
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Controls */}
        <div className="space-y-5">
          {/* Resolution selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 block">Resolução de Exportação:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setResolution('1080p');
                  if (bitrate > 50) setBitrate(40);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  resolution === '1080p'
                    ? 'bg-red-500/10 border-red-500/50 text-red-400'
                    : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'
                }`}
              >
                1080p Full HD
              </button>
              <button
                type="button"
                onClick={() => {
                  setResolution('4k');
                  if (bitrate < 40) setBitrate(80);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                  resolution === '4k'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'
                }`}
              >
                4K Ultra HD (Recomendado)
              </button>
            </div>
          </div>

          {/* Codec Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-300 block">Codec do Arquivo:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'h264', label: 'H.264 (Compatível)' },
                { id: 'h265', label: 'H.265 / HEVC' },
                { id: 'av1', label: 'AV1 (Eficiente)' }
              ].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCodec(c.id as any)}
                  className={`py-2 px-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                    codec === c.id
                      ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                      : 'bg-white/5 border-transparent text-neutral-400 hover:bg-white/10'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bitrate slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-neutral-300">Target Bitrate:</span>
              <span className="font-mono text-blue-400 font-bold">{bitrate} Mbps</span>
            </div>
            <input
              type="range"
              min={10}
              max={120}
              value={bitrate}
              onChange={(e) => setBitrate(Number(e.target.value))}
              className="w-full accent-blue-500 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
              <span>10 Mbps</span>
              <span>Recomendado: {resolution === '4k' ? '80 Mbps' : '40 Mbps'}</span>
              <span>120 Mbps</span>
            </div>
          </div>

          {/* Duration controller */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-neutral-300">Duração do Vídeo:</span>
              <span className="font-mono text-neutral-400">{videoDuration} min</span>
            </div>
            <input
              type="range"
              min={1}
              max={60}
              value={videoDuration}
              onChange={(e) => setVideoDuration(Number(e.target.value))}
              className="w-full accent-neutral-400 bg-neutral-800 rounded-lg h-1.5 cursor-pointer"
            />
          </div>
        </div>

        {/* Right column: Quality simulation results */}
        <div className="bg-neutral-900/60 border border-white/5 p-4 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest block font-bold">Relatório do Algoritmo YouTube</span>
            
            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 block">Codec Atribuído pelo Player:</span>
              <span className={`text-xs font-bold block ${resolution === '4k' ? 'text-emerald-400' : 'text-red-400'}`}>
                {ytCodec}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-neutral-500 block">Tamanho de Arquivo Estimado:</span>
              <span className="text-sm font-mono text-neutral-200 font-bold">
                {fileSizeMb >= 1000 ? `${(fileSizeMb / 1024).toFixed(2)} GB` : `${fileSizeMb} MB`}
              </span>
            </div>

            {/* Score gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-neutral-500">Preservação de Detalhes:</span>
                <span className="font-mono font-bold" style={{ color: score >= 85 ? '#30d158' : score >= 55 ? '#ff9f0a' : '#ff453a' }}>
                  {score}%
                </span>
              </div>
              <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-300 rounded-full"
                  style={{ 
                    width: `${score}%`, 
                    backgroundColor: score >= 85 ? '#30d158' : score >= 55 ? '#ff9f0a' : '#ff453a' 
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 space-y-2">
            {score >= 85 ? (
              <div className="flex gap-2 items-start text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg">
                <p className="leading-tight">
                  <strong>Excelente!</strong> A exportação em {resolution} com {bitrate} Mbps garante que o YouTube usará o melhor codec de renderização, eliminando pixels borrados no player final.
                </p>
              </div>
            ) : score >= 55 ? (
              <div className="flex gap-2 items-start text-xs bg-orange-500/10 border border-orange-500/20 text-orange-400 p-2.5 rounded-lg">
                <p className="leading-tight">
                  <strong>Atenção!</strong> Bitrate mediano. O vídeo ficará aceitável, mas cenas com transições rápidas ou muitos detalhes de fundo podem sofrer pequenas quebras de blocos de pixel.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 items-start text-xs bg-red-500/10 border border-red-500/20 text-red-400 p-2.5 rounded-lg">
                <p className="leading-tight">
                  <strong>Risco Crítico!</strong> Exportar em 1080p bruto sob baixa taxa de bitrate ativa o codec inferior <strong>AVC1</strong> do YouTube, resultando em desfoques e granulação indesejada.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
