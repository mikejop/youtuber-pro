import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface NicheData {
  how: string;
  example: string;
  discomfort: string;
}

interface StepDetails {
  id: number;
  title: string;
  subtitle: string;
  summary: string;
  color: string;
  bgGradient: string;
  tools: string[];
  niches: {
    [key: string]: NicheData;
  };
  checklist: string[];
}

const FLOW_STEPS: StepDetails[] = [
  {
    id: 1,
    title: 'MINERAÇÃO',
    subtitle: 'Achar a ideia',
    summary: 'A busca ativa por demanda real e repertório antes de qualquer gravação. Ideias de sucesso não surgem do nada — são fruto de mineração de lacunas no algoritmo.',
    color: '#0071e3', // Apple Blue
    bgGradient: 'from-[#0071e3]/10 to-transparent',
    tools: ['Google Trends', 'AnswerThePublic', 'Reddit & Quora', 'Filmot.com', 'VidIQ / TubeBuddy', 'Letterboxd / IMDb', 'TikTok / Douyin'],
    niches: {
      Games: {
        how: 'Foque em desafios com limitações rígidas, modificações de código (modding), teorias profundas de lore ou desafios de sobrevivência temporal.',
        example: 'Tentar zerar Minecraft sem poder andar para a frente.',
        discomfort: 'Substitui a gameplay genérica por uma camada intensa de agonia/curiosidade.'
      },
      'True Crime': {
        how: 'Pesquise casos raros, pouco divulgados, análises psicológicas profundas ou mistérios inexplicáveis que ganharam tração em fóruns do Reddit.',
        example: 'O crime misterioso que a internet inteira resolveu em menos de 24 horas.',
        discomfort: 'Garante que haja um fator de urgência investigativa.'
      },
      Vlog: {
        how: 'Extraia o criador de sua zona de conforto padrão, experimente testes científicos de hábitos por períodos longos ou visite locais extremos.',
        example: 'Passei 48h seguidas no hotel com a pior avaliação do país.',
        discomfort: 'Coloca em jogo a saúde física ou mental do criador pelo entretenimento.'
      },
      Cinema: {
        how: 'Estude desconstruções de roteiros brilhantes, grandes fracassos de estúdios ou detalhes minuciosos que passam despercebidos pelo público geral.',
        example: 'A cena de 3 minutos que salvou esse filme de um fracasso monumental.',
        discomfort: 'Expõe uma verdade chocante sobre o funcionamento da indústria cinematográfica.'
      }
    },
    checklist: [
      'Identificar um volume de busca relevante',
      'Consultar o Reddit ou fórum de nicho específico',
      'Garantir uma lacuna do algoritmo (alta busca, baixa oferta)',
      'Registrar a fonte ou links de referência principais'
    ]
  },
  {
    id: 2,
    title: 'FILTRAGEM',
    subtitle: 'Thumb & Título First',
    summary: 'O funil de validação rígido "YouTube First". Se a ideia não puder ser traduzida in uma imagem impactante e um título simples com alto desconforto, ela deve ser descartada.',
    color: '#ff9f0a', // Apple Orange
    bgGradient: 'from-[#ff9f0a]/10 to-transparent',
    tools: ['Filtro YouTube First', 'Princípio do Desconforto', 'Aposta Criativa'],
    niches: {
      Games: {
        how: 'Aplique limitações físicas insanas ao controle do jogo para elevar a tensão visual.',
        example: 'Em vez de "Jogando Dark Souls", use "Zerando Dark Souls usando uma bateria de carro como controle".',
        discomfort: 'Coloca um risco cômico e mecânico claro.'
      },
      'True Crime': {
        how: 'Conecte a investigação do crime ao círculo pessoal ou a ganchos de ironia dramática.',
        example: 'Em vez de "O caso X", use "O detetive que investigou o próprio chefe".',
        discomfort: 'Cria uma intriga psicológica irresistível desde o título.'
      },
      Vlog: {
        how: 'Adicione uma limitação financeira extrema ou restrição social para amplificar o drama natural.',
        example: 'Em vez de "Viajei para a praia", use "Viajei para a praia sem levar dinheiro ou celular".',
        discomfort: 'Cria dependência e interações reais caóticas.'
      },
      Cinema: {
        how: 'Aponte um erro histórico bizarro de uma produção ultra-famosa de forma categórica.',
        example: 'Em vez de "Análise de Batman", use "Por que o Batman de 1989 cometeu o pior erro da história do cinema".',
        discomfort: 'Aciona a curiosidade e o sentimento de "como eu nunca percebi isso antes?".'
      }
    },
    checklist: [
      'Visualizar a Thumbnail na mente (máximo 3 elementos focais)',
      'Criar um título com menos de 65 caracteres',
      'Adicionar o "Princípio do Desconforto" (tensão ou limitação extrema)',
      'Garantir que haja algo em jogo (aposta/risco)'
    ]
  },
  {
    id: 3,
    title: 'MOODBOARD & POST-ITS',
    subtitle: 'Ordem das Cenas',
    summary: 'A estruturação visual e cronológica do vídeo. Definimos o tom estético geral (Moodboard) e distribuímos a tensão em blocos rítmicos usando post-its coloridos.',
    color: '#bf5af2', // Apple Purple
    bgGradient: 'from-[#bf5af2]/10 to-transparent',
    tools: ['Milanote (Moodboards)', 'Pinterest', 'Miro / Mural', 'Notion / Trello', 'Quadro de Post-its Físico'],
    niches: {
      Games: {
        how: 'Organize prints de cenários, paletas de cores do HUD e as sequências de progresso do desafio.',
        example: 'Post-it Amarelo: Mostrar os 5 segundos mais insanos onde quase falhou antes de explicar as regras do desafio.',
        discomfort: 'Mantém o espectador grudado com um mini ganchinho visual.'
      },
      'True Crime': {
        how: 'Reúna fotos reais do caso, recortes de jornais de época e referências de iluminação dramática fria.',
        example: 'Post-it Azul: Inserir a cada 2 minutos uma nova evidência contraditória encontrada pela polícia.',
        discomfort: 'Cria quebras constantes na calmaria da narrativa.'
      },
      Vlog: {
        how: 'Crie um moodboard de enquadramentos modernos, paletas quentes de transição e estética de tipografias.',
        example: 'Post-it Vermelho (Clímax): O momento em que o dinheiro acaba totalmente e o criador precisa pedir carona.',
        discomfort: 'O ápice da jornada, onde a resolução do desconforto acontece.'
      },
      Cinema: {
        how: 'Traga stills em alta resolução do filme, diagramas técnicos de ângulos e círculos cromáticos.',
        example: 'Post-it Roxo (Resolução): A tese final provada em 20 segundos direcionando para outra análise.',
        discomfort: 'Fechamento rápido sem enrolação que otimiza a conversão de cliques.'
      }
    },
    checklist: [
      'Post-it Amarelo (Hook): Teaser visual + Promessa clara + Risco (0-30s)',
      'Post-it Verde (Contexto): Explicar as regras ou background em menos de 1 minuto',
      'Post-its Azuis (Ações): Colocar um ponto de virada/micro-recompensa a cada 2 minutos',
      'Post-it Vermelho (Clímax): Ponto máximo de resolução dramática',
      'Post-it Roxo (CTA): Encerramento de 20 segundos focado em redirecionamento de tela'
    ]
  },
  {
    id: 4,
    title: 'FICHA DE PRODUÇÃO',
    subtitle: 'Pronto para Gravar',
    summary: 'A etapa final de consolidação técnica. A ficha prática de validação deve ser preenchida na íntegra para blindar o vídeo contra furos narrativos e redundâncias.',
    color: '#30d158', // Apple Green
    bgGradient: 'from-[#30d158]/10 to-transparent',
    tools: ['Ficha de Validação Prática', 'Documento de Roteiro Final', 'Lista de Verificação de Equipamentos'],
    niches: {
      Games: {
        how: 'Preencha a ficha com o roteiro de inputs do controle especial e a sequência de salvamentos de segurança.',
        example: 'Definir o Hook em 15s e detalhar o exato controle alternativo que causará o desconforto.',
        discomfort: 'Elimina enrolações iniciais do jogo garantindo dinamismo.'
      },
      'True Crime': {
        how: 'Insira as referências exatas de arquivos de áudio oficiais de tribunais ou depoimentos reais catalogados.',
        example: 'Lista exata de fotos que NÃO podem aparecer devido a diretrizes do YouTube para evitar desmonetização.',
        discomfort: 'Garante integridade e evita punições automáticas do algoritmo.'
      },
      Vlog: {
        how: 'Grave a introdução da aposta com o cronômetro correndo em tela dividida logo de início.',
        example: 'Definição estrita da "Limitação Criativa": Sem usar internet móvel de terceiros.',
        discomfort: 'Eleva a sensação de veracidade do desafio.'
      },
      Cinema: {
        how: 'Mapeie cada cena de corte correspondente aos segundos exatos do filme que serão exibidos.',
        example: 'Marcação exata de ganchos visuais para manter a retenção mesmo ao explicar conceitos teóricos chatos.',
        discomfort: 'Equilibra profundidade técnica com dinamismo de tela.'
      }
    },
    checklist: [
      'Definir com clareza o Nicho e Título Provisório do vídeo',
      'Descrever a Thumbnail em exatamente 1 frase simples',
      'Registrar a Fonte e Repertório de Pesquisa ativo',
      'Validar o Hook de 15 segundos e a Limitação Criativa estabelecida'
    ]
  }
];

const NICHES = ['Games', 'True Crime', 'Vlog', 'Cinema'];

export default function IdeationFlowchart() {
  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [activeNiche, setActiveNiche] = useState<string>('Games');

  const currentStep = FLOW_STEPS.find(s => s.id === activeStepId) || FLOW_STEPS[0];

  return (
    <div className="space-y-6 text-[#1d1d1f]" id="ideation-flowchart-root">
      
      {/* 1. Header block in the interactive container */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
        <div>
          <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-widest block font-mono">MAPA INTERATIVO DA JORNADA</span>
          <h4 className="text-xl font-extrabold tracking-tight text-neutral-900 mt-0.5">O Método da Ideia de Alta Performance</h4>
          <p className="text-xs text-[#86868b] mt-1 max-w-xl">
            Clique nas etapas abaixo para desvendar as metodologias, ferramentas recomendadas e exemplos práticos para cada nicho.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-center">
          <span className="rounded-full px-3 py-1 bg-neutral-100 border border-neutral-200 text-[10px] font-bold text-neutral-600 flex items-center gap-1 uppercase tracking-wider">
            Padrão Apple Design
          </span>
        </div>
      </div>

      {/* 2. Interactive Flowchart Grid - Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative" id="flowchart-stepper-grid">
        {FLOW_STEPS.map((step) => {
          const isActive = step.id === activeStepId;
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => setActiveStepId(step.id)}
                className={`relative p-4 md:p-5 rounded-2xl border text-left transition-all duration-300 group cursor-pointer ${
                  isActive 
                    ? 'bg-white border-neutral-300 shadow-[0_12px_30px_rgba(0,0,0,0.06)] scale-[1.02] z-10' 
                    : 'bg-[#f5f5f7]/60 border-neutral-200/70 hover:bg-[#f5f5f7] hover:border-neutral-300 hover:scale-[1.01]'
                }`}
                style={{
                  outline: isActive ? `2px solid ${step.color}20` : 'none'
                }}
              >
                {/* Step badge */}
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-black transition-all duration-300"
                    style={{
                      backgroundColor: isActive ? step.color : '#e8e8ed',
                      color: isActive ? '#fff' : '#86868b',
                      boxShadow: isActive ? `0 4px 12px ${step.color}30` : 'none'
                    }}
                  >
                    {step.id}
                  </div>
                  <span className="font-mono text-[10px] font-bold text-[#86868b] bg-neutral-200/50 px-2 py-0.5 rounded-full">
                    ETAPA 0{step.id}
                  </span>
                </div>

                {/* Step Text details */}
                <h5 className="font-bold text-sm tracking-tight text-neutral-900 group-hover:text-black">
                  {step.title}
                </h5>
                <p className="text-xs text-[#86868b] mt-0.5 font-medium">
                  {step.subtitle}
                </p>

                {/* Subtle visual indicator border on active */}
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-6 right-6 h-1 rounded-t-full"
                    style={{ backgroundColor: step.color }}
                  />
                )}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Deep Dive Details Panel (Apple specs view style) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStepId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className={`p-6 rounded-[24px] border border-neutral-200/80 bg-gradient-to-b ${currentStep.bgGradient} to-white shadow-[0_8px_32px_rgba(0,0,0,0.02)] space-y-6 relative overflow-hidden`}
        >
          {/* Subtle backdrop glow */}
          <div className="absolute top-0 right-0 w-64 h-64 opacity-5 bg-radial-gradient blur-3xl pointer-events-none" 
               style={{ backgroundColor: currentStep.color }} />

          {/* Intro Section of selected step */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase px-3 py-1 rounded-full text-white"
                    style={{ backgroundColor: currentStep.color }}>
                {currentStep.title}
              </span>
              <span className="text-sm font-semibold text-neutral-400">
                — {currentStep.subtitle}
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-neutral-800 font-normal">
              {currentStep.summary}
            </p>
          </div>

          {/* Interactive Niche Adaptation Section */}
          <div className="p-5 rounded-2xl bg-[#f5f5f7]/80 border border-neutral-200/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/60 pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">APLICAÇÃO PRÁTICA</span>
                <span className="text-sm font-extrabold text-neutral-900 mt-0.5 block">Como aplicar a busca no seu Nicho</span>
              </div>
              
              {/* Niche select tabs */}
              <div className="flex flex-wrap gap-1 bg-neutral-200/60 p-1 rounded-xl">
                {NICHES.map(n => {
                  const isNicheActive = activeNiche === n;
                  return (
                    <button
                      key={n}
                      onClick={() => setActiveNiche(n)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        isNicheActive 
                          ? 'bg-white text-neutral-900 shadow-sm' 
                          : 'text-[#86868b] hover:text-neutral-800'
                      }`}
                    >
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Display selected niche application inside selected step */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">Instrução Estratégica:</span>
                <p className="text-xs text-neutral-800 leading-relaxed font-medium bg-white/60 p-3 rounded-xl border border-neutral-200/40">
                  {currentStep.niches[activeNiche]?.how}
                </p>
              </div>
              <div className="space-y-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">Exemplo Prático e Real:</span>
                  <div className="p-3 rounded-xl bg-[#0071e3]/5 border border-[#0071e3]/10 flex items-start gap-2.5">
                    <p className="text-xs text-[#0071e3] font-bold leading-relaxed">
                      "{currentStep.niches[activeNiche]?.example}"
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block">Efeito de Desconforto / Retenção:</span>
                  <p className="text-[11px] text-neutral-500 italic leading-relaxed pl-3 border-l-2 border-neutral-300">
                    {currentStep.niches[activeNiche]?.discomfort}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tools and Checklist row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
            {/* Tools list (5 cols) */}
            <div className="md:col-span-5 space-y-3">
              <div className="flex items-center gap-1.5 text-neutral-900">
                <span className="text-[11px] font-bold uppercase tracking-wider">Ferramentas Recomendadas</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentStep.tools.map((t, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-neutral-100 border border-neutral-200/80 rounded-full text-[11px] font-medium text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-default"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Checklist (7 cols) */}
            <div className="md:col-span-7 space-y-3">
              <div className="flex items-center gap-1.5 text-neutral-900">
                <span className="text-[11px] font-bold uppercase tracking-wider">Critérios de Validação & Entrega</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentStep.checklist.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-[#f5f5f7]/40 p-2 rounded-xl border border-neutral-200/30">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" 
                         style={{ backgroundColor: currentStep.color }} />
                    <span className="text-[11px] text-neutral-700 font-medium leading-relaxed">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </motion.div>
      </AnimatePresence>

    </div>
  );
}
