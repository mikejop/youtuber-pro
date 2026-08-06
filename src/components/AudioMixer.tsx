import React, { useState, useEffect } from 'react';

export default function AudioMixer() {
  const [voiceVolume, setVoiceVolume] = useState<number>(85); // 0 to 100
  const [musicVolume, setMusicVolume] = useState<number>(20); // 0 to 100
  const [sfxVolume, setSfxVolume] = useState<number>(75);    // 0 to 100
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Map 0-100 linear sliders to logarithmic dB metrics
  // 100 -> 0dB
  // 0 -> -60dB (infinity)
  const calculateDB = (vol: number) => {
    if (vol === 0) return '-∞ dB';
    const db = Math.round((vol / 100) * 60 - 60);
    return `${db > 0 ? '+' : ''}${db} dB`;
  };

  const getVoiceDB = () => Math.round((voiceVolume / 100) * 60 - 60);
  const getMusicDB = () => Math.round((musicVolume / 100) * 60 - 60);
  const getSfxDB = () => Math.round((sfxVolume / 100) * 60 - 60);

  // Evaluation states
  const [mixStatus, setMixStatus] = useState<'perfect' | 'loud-music' | 'quiet-voice' | 'clipping-sfx'>('perfect');

  useEffect(() => {
    const voiceDB = getVoiceDB();
    const musicDB = getMusicDB();
    const sfxDB = getSfxDB();

    if (musicDB > -20 && voiceVolume > 0) {
      setMixStatus('loud-music');
    } else if (voiceDB < -12 && voiceVolume > 0) {
      setMixStatus('quiet-voice');
    } else if (sfxDB > -5) {
      setMixStatus('clipping-sfx');
    } else {
      setMixStatus('perfect');
    }
  }, [voiceVolume, musicVolume, sfxVolume]);

  return (
    <div className="space-y-6" id="audio-mixer-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-lg font-medium text-white tracking-tight" id="audio-mixer-title">Mesa de Mixagem & Hierarquia Sonora</h4>
          <p className="text-xs text-neutral-400">Misture os canais de áudio da sua timeline seguindo a regra de decibéis de ouro do cinema.</p>
        </div>
        <button
          id="btn-play-mixer"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            isPlaying 
              ? 'bg-red-500/10 text-red-400 border border-red-500/30' 
              : 'bg-white text-black hover:bg-neutral-200'
          }`}
        >
          {isPlaying ? 'Desativar Monitor' : 'Ativar Monitor de Áudio'}
        </button>
      </div>

      {/* Main Console Box (Apple Glassmorphism Slate styling) */}
      <div className="p-6 rounded-2xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md space-y-6" id="mixer-console-box">
        
        {/* Dynamic Spectrum Display when playing */}
        <div className="h-20 rounded-xl bg-black/60 border border-white/5 p-4 flex flex-col justify-between overflow-hidden relative" id="spectrum-container">
          <div className="flex justify-between items-center z-10">
            <span className="text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">Master Output Stereo Spectrum</span>
            {isPlaying && (
              <span className="text-[9px] font-mono text-red-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE MONITORING
              </span>
            )}
          </div>

          {/* Animated Waveform Equalizer Rows */}
          <div className="flex items-end gap-1 h-8" id="eq-bars-row">
            {Array.from({ length: 42 }).map((_, idx) => {
              // Create staggered delays and heights
              const randomDelay = Math.random() * 0.8;
              const randomDuration = 0.5 + Math.random() * 0.8;
              const maxBarHeight = 
                mixStatus === 'loud-music' ? 'h-7' : 
                mixStatus === 'clipping-sfx' ? 'h-8' : 'h-5';
              const barColor = 
                mixStatus === 'clipping-sfx' && idx > 30 ? 'bg-red-500' : 
                mixStatus === 'loud-music' ? 'bg-indigo-400' : 'bg-emerald-400';

              return (
                <div
                  key={idx}
                  id={`eq-bar-${idx}`}
                  className={`flex-1 rounded-sm transition-all duration-300 ${barColor}`}
                  style={{
                    height: isPlaying ? '100%' : '15%',
                    maxHeight: isPlaying ? `${15 + Math.sin(idx * 0.5) * 40 + Math.random() * 45}%` : '4px',
                    animation: isPlaying ? `bounce ${randomDuration}s ease-in-out ${randomDelay}s infinite alternate` : 'none'
                  }}
                />
              );
            })}
          </div>

          {/* Decibel markings */}
          <div className="flex justify-between text-[8px] font-mono text-neutral-600 mt-1" id="db-ticks">
            <span>-60 dB</span>
            <span>-30 dB</span>
            <span>-18 dB</span>
            <span>-12 dB</span>
            <span>-6 dB</span>
            <span className="text-red-500">0 dB (CLIP)</span>
          </div>
        </div>

        {/* Triple Channel Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2" id="mixer-faders">
          
          {/* Channel 1: Voice */}
          <div className="flex flex-col space-y-3 p-4 rounded-xl bg-black/30 border border-white/5" id="fader-channel-voice">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">CH 01</span>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Voz Principal (Voice)</h5>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400" id="voice-db-text">{calculateDB(voiceVolume)}</span>
            </div>
            <div className="flex gap-4 items-center h-24 justify-center" id="voice-fader-track">
              {/* Vertical Fader Slider */}
              <input
                id="fader-voice"
                type="range"
                min="0"
                max="100"
                value={voiceVolume}
                onChange={(e) => setVoiceVolume(Number(e.target.value))}
                className="accent-emerald-400 cursor-pointer h-1 bg-neutral-800 rounded-lg w-full"
              />
            </div>
            <p className="text-[10px] text-neutral-500 text-center">Foco primordial. Deve flutuar entre -6dB e -3dB para dar o "peso" verbal ideal.</p>
          </div>

          {/* Channel 2: Music */}
          <div className="flex flex-col space-y-3 p-4 rounded-xl bg-black/30 border border-white/5" id="fader-channel-music">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">CH 02</span>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Trilha (Music)</h5>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-400" id="music-db-text">{calculateDB(musicVolume)}</span>
            </div>
            <div className="flex gap-4 items-center h-24 justify-center" id="music-fader-track">
              <input
                id="fader-music"
                type="range"
                min="0"
                max="100"
                value={musicVolume}
                onChange={(e) => setMusicVolume(Number(e.target.value))}
                className="accent-indigo-400 cursor-pointer h-1 bg-neutral-800 rounded-lg w-full"
              />
            </div>
            <p className="text-[10px] text-neutral-500 text-center">Som de fundo. Deve ficar entre -25dB e -30dB para nunca sufocar a fala principal.</p>
          </div>

          {/* Channel 3: SFX */}
          <div className="flex flex-col space-y-3 p-4 rounded-xl bg-black/30 border border-white/5" id="fader-channel-sfx">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">CH 03</span>
                <h5 className="text-xs font-bold text-white uppercase tracking-wider">Efeitos (SFX)</h5>
              </div>
              <span className="text-xs font-mono font-bold text-pink-400" id="sfx-db-text">{calculateDB(sfxVolume)}</span>
            </div>
            <div className="flex gap-4 items-center h-24 justify-center" id="sfx-fader-track">
              <input
                id="fader-sfx"
                type="range"
                min="0"
                max="100"
                value={sfxVolume}
                onChange={(e) => setSfxVolume(Number(e.target.value))}
                className="accent-pink-400 cursor-pointer h-1 bg-neutral-800 rounded-lg w-full"
              />
            </div>
            <p className="text-[10px] text-neutral-500 text-center">Impactos e transições. Deve oscilar entre -15dB e -10dB para marcar pontuações.</p>
          </div>

        </div>
      </div>

      {/* Real-time evaluation advice */}
      <div className="p-4 rounded-xl border" id="mixer-eval-box">
        {mixStatus === 'perfect' && (
          <div className="flex gap-3" id="eval-perfect">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 self-start text-xs font-bold">
              [✓]
            </div>
            <div>
              <h6 className="text-xs font-bold text-white uppercase tracking-wide">
                Mixagem Profissional de Ouro!
              </h6>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Excelente trabalho! Seus canais estão perfeitamente balanceados. A voz do apresentador lidera a narrativa, a música embala o fundo de forma agradável e os efeitos dão dinamismo sem assustar o espectador. Seu som está pronto para ser postado!
              </p>
            </div>
          </div>
        )}

        {mixStatus === 'loud-music' && (
          <div className="flex gap-3" id="eval-loud-music">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 self-start text-xs font-bold">
              [!]
            </div>
            <div>
              <h6 className="text-xs font-bold text-red-400 uppercase tracking-wide">
                Alerta de Áudio: Trilha sonora está alta demais!
              </h6>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                A música de fundo está ultrapassando <span className="font-bold text-red-400 font-mono">-20 dB</span>. Isso vai competir diretamente com o tom de voz principal, cansando o ouvido do espectador e derrubando a retention do vídeo nas primeiras horas. 
                <span className="font-bold text-indigo-400 block mt-1.5">Correção: Reduza o fader da Trilha Sonora para ficar entre -25dB e -30dB (em torno de 15% a 25% no fader).</span>
              </p>
            </div>
          </div>
        )}

        {mixStatus === 'quiet-voice' && (
          <div className="flex gap-3" id="eval-quiet-voice">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 self-start text-xs font-bold">
              [!]
            </div>
            <div>
              <h6 className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                Alerta de Áudio: Voz principal baixa demais!
              </h6>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Seu canal de voz está abaixo de <span className="font-bold text-amber-400 font-mono">-12 dB</span>. O público terá extrema dificuldade para entender a explicação, especialmente no celular. 
                <span className="font-bold text-emerald-400 block mt-1.5">Correção: Suba o fader de Voz para oscilar entre -6dB e -3dB (em torno de 80% a 95% no fader).</span>
              </p>
            </div>
          </div>
        )}

        {mixStatus === 'clipping-sfx' && (
          <div className="flex gap-3" id="eval-clipping-sfx">
            <div className="p-2 rounded-lg bg-red-500/10 text-red-500 self-start text-xs font-bold">
              [!]
            </div>
            <div>
              <h6 className="text-xs font-bold text-red-400 uppercase tracking-wide">
                Alerta de Áudio: SFX estourando / Clipping digital!
              </h6>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                Seus efeitos sonoros de transições estão beirando <span className="font-bold text-red-400 font-mono">-5 dB a 0 dB</span>. Isso causa clipping (estouro digital) de áudio nas caixas de som e fones do público, o que é extremamente irritante. 
                <span className="font-bold text-pink-400 block mt-1.5">Correção: Abaixe o fader de SFX para ficar entre -15dB e -10dB (em torno de 60% a 75% no fader).</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bounce keyframes injected inline */}
      <style>{`
        @keyframes bounce {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(0.2); }
        }
      `}</style>
    </div>
  );
}
