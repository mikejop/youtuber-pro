import React, { useState, useEffect } from 'react';

interface PrinciplePreset {
  id: 'contraste' | 'paralelismo' | 'simbolismo' | 'simultaneidade' | 'leitmotiv';
  name: string;
  definition: string;
  cognitiveEffect: string;
  scenes: {
    title: string;
    description: string;
    visualIcon: string;
    dialogueOrAudio: string;
  }[];
}

const PUDOVKIN_PRESETS: PrinciplePreset[] = [
  {
    id: 'contraste',
    name: 'Contraste (Contrast)',
    definition: 'Alternar entre cenas opostas para forçar o cérebro a fazer uma comparação emocional ou conceitual profunda.',
    cognitiveEffect: 'Gera impacto psicológico imediato, acentuando a gravidade, silêncio ou ritmo por pura oposição.',
    scenes: [
      {
        title: 'Cena 1: Caos Urbano',
        description: 'Pessoas correndo estressadas sob buzinas altas no centro de São Paulo.',
        visualIcon: 'Caos Urbano',
        dialogueOrAudio: '[Efeitos de Trânsito Alto e Caótico]'
      },
      {
        title: 'Cena 2: O Contraste Pacífico',
        description: 'Uma monja zen sentada em meditação em uma sala de madeira com incenso subindo sutilmente.',
        visualIcon: 'Paz / Meditação',
        dialogueOrAudio: '[Silêncio absoluto ou gongo distante]'
      },
      {
        title: 'Cena 3: Conclusão',
        description: 'O apresentador diz: "É por isso que sua mente busca pausas no meio da rotina...".',
        visualIcon: 'Apresentação',
        dialogueOrAudio: '"A atenção é o ativo mais precioso da atualidade."'
      }
    ]
  },
  {
    id: 'paralelismo',
    name: 'Paralelismo (Parallelism)',
    definition: 'Mostrar duas ações distintas acontecendo de forma separada no tempo ou espaço, conectando-as por associação.',
    cognitiveEffect: 'Cria uma ponte de causa e efeito instantânea ou traça semelhanças entre mundos diferentes.',
    scenes: [
      {
        title: 'Cena 1: O Criador Frustrado',
        description: 'YouTuber encarando uma tela travada com o símbolo de renderização travado no notebook lento.',
        visualIcon: 'Criador Frustrado',
        dialogueOrAudio: '[Sons de mouse clicando com raiva]'
      },
      {
        title: 'Cena 2: O Criador Eficiente',
        description: 'Criador sorrindo enquanto arrasta arquivos fluidamente em uma máquina veloz e exporta em segundos.',
        visualIcon: 'Criador Eficiente',
        dialogueOrAudio: '[Trilha de música moderna de alta rotação]'
      },
      {
        title: 'Cena 3: Conclusão',
        description: 'Zoom sutil no apresentador: "Escolher a máquina certa decide se seu canal cresce ou morre no gargalo...".',
        visualIcon: 'Apresentação',
        dialogueOrAudio: '"Não gaste tempo precioso esperando renderizar."'
      }
    ]
  },
  {
    id: 'simbolismo',
    name: 'Simbolismo (Symbolism)',
    definition: 'Justapor uma ideia verbal a um elemento visual ou metafórico que representa abstratamente aquela ideia.',
    cognitiveEffect: 'Ressalta metáforas de alto nível intelectivo e reforça conceitos complexos sem precisar de longas explicações.',
    scenes: [
      {
        title: 'Cena 1: A Fala sobre Inflação',
        description: 'Apresentador explicando: "E de repente o seu dinheiro passa a valer menos a cada dia...".',
        visualIcon: 'Foco Financeiro',
        dialogueOrAudio: '"Você trabalha mais e compra muito menos..."'
      },
      {
        title: 'Cena 2: O Elemento Simbólico',
        description: 'Clipe de um balão vermelho flutuando em direção ao céu e estourando contra o sol.',
        visualIcon: 'Balão Rompendo',
        dialogueOrAudio: '[Efeito de estouro de balão com reverberação ecoante]'
      },
      {
        title: 'Cena 3: Fechamento',
        description: 'Corte seco para gráfico mostrando o declínio do poder de compra.',
        visualIcon: 'Gráfico em Queda',
        dialogueOrAudio: '"Isso é o que acontece com a inflação."'
      }
    ]
  },
  {
    id: 'simultaneidade',
    name: 'Simultaneidade (Simultaneity)',
    definition: 'Alternar de forma frenética entre duas ações paralelas que se dirigem ao mesmo clímax, aumentando o ritmo.',
    cognitiveEffect: 'Cria urgência, suspense extremo e eleva a pulsação do espectador pelo ritmo acelerado de cortes.',
    scenes: [
      {
        title: 'Cena 1: Relógio Correndo',
        description: 'Close-up do ponteiro dos segundos de um cronômetro avançando rapidamente.',
        visualIcon: 'Tempo Correndo',
        dialogueOrAudio: '[Som de tic-tac acelerado e tenso]'
      },
      {
        title: 'Cena 2: Render nos 99%',
        description: 'A barra de progresso do software de edição parada nos 99% a instantes do prazo de postagem.',
        visualIcon: 'Aguardando Render',
        dialogueOrAudio: '[Música de fundo em tom crescente dramático]'
      },
      {
        title: 'Cena 3: Conclusão / Alívio',
        description: 'Sucesso na postagem e o criador soltando a respiração de alívio.',
        visualIcon: 'Sucesso e Alívio',
        dialogueOrAudio: '[Som de sino de conclusão e suspiro]'
      }
    ]
  },
  {
    id: 'leitmotiv',
    name: 'Leitmotiv (Tema Recorrente)',
    definition: 'Repetição periódica de uma imagem, som ou movimento de câmera para marcar e fixar um conceito central ou transição.',
    cognitiveEffect: 'Ancoragem mental. Cria uma identidade marcante e um padrão previsível que o público reconhece imediatamente.',
    scenes: [
      {
        title: 'Cena 1: O Clássico "Truque do Zoom"',
        description: 'Em todos os começos de tópicos, a câmera dá um "Punch-in" rápido de zoom de 1.1x acompanhado de um som de vento.',
        visualIcon: 'Swoosh Zoom',
        dialogueOrAudio: '[Som de Swoosh de transição característico]'
      },
      {
        title: 'Cena 2: Repetição',
        description: 'O apresentador fala o próximo tópico e o mesmo zoom e som de vento ocorrem na transição.',
        visualIcon: 'Swoosh Zoom Repetido',
        dialogueOrAudio: '[Swoosh idêntico repetido]'
      },
      {
        title: 'Cena 3: Reconhecimento',
        description: 'O espectador já sabe que o assunto mudou assim que escuta o som característico de assinatura do canal.',
        visualIcon: 'Ancoragem Mental',
        dialogueOrAudio: '"Agora você entende o padrão cognitivo de fixação..."'
      }
    ]
  }
];

export default function PudovkinSequencer() {
  const [activePresetId, setActivePresetId] = useState<'contraste' | 'paralelismo' | 'simbolismo' | 'simultaneidade' | 'leitmotiv'>('contraste');
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const activePreset = PUDOVKIN_PRESETS.find(p => p.id === activePresetId)!;

  // Handle sequence loop timing
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      // If we are starting from the end or beginning
      if (currentSceneIndex === -1 || currentSceneIndex === 2) {
        setCurrentSceneIndex(0);
      } else {
        timer = setTimeout(() => {
          if (currentSceneIndex < 2) {
            setCurrentSceneIndex(prev => prev + 1);
          } else {
            setIsPlaying(false);
          }
        }, 2200); // 2.2 seconds per scene
      }
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentSceneIndex]);

  // When active preset changes, reset animation states
  useEffect(() => {
    setIsPlaying(false);
    setCurrentSceneIndex(-1);
  }, [activePresetId]);

  return (
    <div className="space-y-6" id="pudovkin-root">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h4 className="text-lg font-medium text-white tracking-tight" id="pudovkin-title">Laboratório de Montagem Cinematográfica</h4>
          <p className="text-xs text-neutral-400">Aplique os 5 princípios clássicos de Pudovkin no corte dinâmico do YouTube.</p>
        </div>
        <div className="flex flex-wrap gap-1 glass-light p-1 rounded-lg" id="pudovkin-presets-bar">
          {PUDOVKIN_PRESETS.map(preset => (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              onClick={() => setActivePresetId(preset.id)}
              className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                activePresetId === preset.id 
                  ? 'bg-white text-black' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {preset.id}
            </button>
          ))}
        </div>
      </div>

      {/* Info card of current principle */}
      <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 backdrop-blur-md" id="principle-info-card">
        <h5 className="text-sm font-bold text-amber-400 uppercase tracking-wide">
          {activePreset.name}
        </h5>
        <p className="text-xs text-neutral-300 mt-1.5 leading-relaxed">{activePreset.definition}</p>
        <div className="mt-3 text-[10px] font-mono text-neutral-400 border-t border-white/5 pt-2 flex items-center gap-1.5">
          <span className="font-bold text-neutral-500 uppercase">Efeito Cognitivo:</span> {activePreset.cognitiveEffect}
        </div>
      </div>

      {/* Interactive Storyboard Cut Simulator */}
      <div className="space-y-4" id="storyboard-simulator">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="scenes-storyboard-grid">
          {activePreset.scenes.map((scene, index) => {
            const isSceneActive = currentSceneIndex === index;
            const isCutDone = currentSceneIndex > index;
            
            return (
              <div
                key={index}
                id={`scene-box-${index}`}
                className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[170px] ${
                  isSceneActive 
                    ? 'bg-amber-500/10 border-amber-400/60 shadow-[0_0_15px_rgba(245,158,11,0.15)] scale-[1.02]' 
                    : isCutDone
                    ? 'bg-neutral-950/20 border-neutral-800 opacity-60'
                    : 'bg-neutral-900/40 border-neutral-800'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isSceneActive ? 'bg-amber-400 text-black' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      CORTE {index + 1}
                    </span>
                    {isSceneActive && (
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    )}
                  </div>
                  <h6 className={`text-xs font-bold transition-colors ${isSceneActive ? 'text-white' : 'text-neutral-300'}`}>{scene.title}</h6>
                  <p className="text-xs text-neutral-400 mt-1 leading-relaxed">{scene.description}</p>
                </div>

                {/* Simulated Graphic Representation */}
                <div className="my-3 flex items-center justify-center h-14 rounded-lg bg-neutral-950/50 border border-white/5 relative overflow-hidden" id={`scene-graphic-${index}`}>
                  <span className="text-xs font-semibold text-neutral-300 animate-pulse" id={`scene-text-label-${index}`}>{scene.visualIcon}</span>
                  {isSceneActive && (
                    <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
                  )}
                </div>

                {/* Subtitle / Dialogue track */}
                <div className="p-1.5 rounded bg-black/40 border border-white/5" id={`scene-audio-${index}`}>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-neutral-500 block">Áudio da Timeline:</span>
                  <p className="text-[10px] font-mono text-neutral-300 italic truncate" id={`scene-audio-text-${index}`}>{scene.dialogueOrAudio}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Storyboard Animation Timeline Control Bar */}
        <div className="glass-card p-3 rounded-xl flex items-center justify-between gap-4" id="storyboard-controls">
          <div className="flex items-center gap-2">
            <button
              id="btn-play-storyboard"
              onClick={() => {
                setIsPlaying(!isPlaying);
                if (currentSceneIndex === 2) {
                  setCurrentSceneIndex(-1);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-white hover:bg-neutral-200 text-black transition-all cursor-pointer"
            >
              {isPlaying ? 'Pausar Sequência' : 'Rodar Sequência de Cortes'}
            </button>
            <button
              id="btn-reset-storyboard"
              onClick={() => {
                setIsPlaying(false);
                setCurrentSceneIndex(-1);
              }}
              className="p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-all cursor-pointer"
              title="Reiniciar timeline"
            >
              Reset
            </button>
          </div>

          <div className="flex-1 max-w-sm flex items-center gap-2" id="storyboard-timeline-bar">
            <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">Linha de Tempo:</span>
            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden flex" id="timeline-slots">
              {[0, 1, 2].map((idx) => (
                <div 
                  key={idx} 
                  id={`timeline-slot-${idx}`}
                  className={`flex-1 h-full border-r border-black/40 transition-all duration-300 ${
                    currentSceneIndex === idx ? 'bg-amber-400 animate-pulse' : currentSceneIndex > idx ? 'bg-amber-500/40' : 'bg-transparent'
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {currentSceneIndex === -1 ? '0.0s' : `${((currentSceneIndex + 1) * 2.2).toFixed(1)}s`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
