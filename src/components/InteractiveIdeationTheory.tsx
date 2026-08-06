import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TabData {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  color: string;
  lightBg: string;
  borderClr: string;
}

// 20-step gradient spanning Green (1-7), Yellow/Orange (8-14), and Red (15-20)
const POSITION_COLORS = [
  // 1 to 7: Greens (from intense green/emerald to lime/yellow-green)
  { pos: 1, name: 'Verde Puro', hex: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'border-green-500/50', text: 'text-green-400', badgeBg: 'bg-green-500/20' },
  { pos: 2, name: 'Verde Esmeralda', hex: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'border-emerald-500/50', text: 'text-emerald-400', badgeBg: 'bg-emerald-500/20' },
  { pos: 3, name: 'Verde Floresta', hex: '#15803d', bg: 'rgba(21, 128, 61, 0.12)', border: 'border-green-600/50', text: 'text-green-500', badgeBg: 'bg-green-600/20' },
  { pos: 4, name: 'Verde Claro', hex: '#4ade80', bg: 'rgba(74, 222, 128, 0.12)', border: 'border-green-400/50', text: 'text-green-300', badgeBg: 'bg-green-400/20' },
  { pos: 5, name: 'Verde Menta', hex: '#86efac', bg: 'rgba(134, 239, 172, 0.12)', border: 'border-green-300/50', text: 'text-green-200', badgeBg: 'bg-green-300/20' },
  { pos: 6, name: 'Verde Oliva', hex: '#84cc16', bg: 'rgba(132, 204, 22, 0.12)', border: 'border-lime-500/50', text: 'text-lime-400', badgeBg: 'bg-lime-500/20' },
  { pos: 7, name: 'Verde Lima', hex: '#a3e635', bg: 'rgba(163, 230, 53, 0.12)', border: 'border-lime-400/50', text: 'text-lime-300', badgeBg: 'bg-lime-400/20' },

  // 8 to 14: Yellows (from pure yellow to deep amber/orange-yellow)
  { pos: 8, name: 'Amarelo Limão', hex: '#fef08a', bg: 'rgba(254, 240, 138, 0.12)', border: 'border-yellow-200/50', text: 'text-yellow-200', badgeBg: 'bg-yellow-200/20' },
  { pos: 9, name: 'Amarelo Sol', hex: '#facc15', bg: 'rgba(250, 204, 21, 0.12)', border: 'border-yellow-400/50', text: 'text-yellow-400', badgeBg: 'bg-yellow-400/20' },
  { pos: 10, name: 'Amarelo Ouro', hex: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', border: 'border-yellow-500/50', text: 'text-yellow-500', badgeBg: 'bg-yellow-500/20' },
  { pos: 11, name: 'Âmbar Médio', hex: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'border-amber-500/50', text: 'text-amber-400', badgeBg: 'bg-amber-500/20' },
  { pos: 12, name: 'Âmbar Escuro', hex: '#d97706', bg: 'rgba(217, 119, 6, 0.12)', border: 'border-amber-600/50', text: 'text-amber-500', badgeBg: 'bg-amber-600/20' },
  { pos: 13, name: 'Laranja Claro', hex: '#ff9f0a', bg: 'rgba(255, 159, 10, 0.12)', border: 'border-orange-400/50', text: 'text-orange-400', badgeBg: 'bg-orange-400/20' },
  { pos: 14, name: 'Laranja Escuro', hex: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'border-orange-500/50', text: 'text-orange-500', badgeBg: 'bg-orange-500/20' },

  // 15 to 20: Reds (from orange-red/coral to deep blood red)
  { pos: 15, name: 'Laranja Coral', hex: '#ff453a', bg: 'rgba(255, 69, 58, 0.12)', border: 'border-red-400/50', text: 'text-red-400', badgeBg: 'bg-red-400/20' },
  { pos: 16, name: 'Vermelho Coral', hex: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'border-red-500/50', text: 'text-red-500', badgeBg: 'bg-red-500/20' },
  { pos: 17, name: 'Vermelho Vivo', hex: '#dc2626', bg: 'rgba(220, 38, 38, 0.12)', border: 'border-red-600/50', text: 'text-red-600', badgeBg: 'bg-red-600/20' },
  { pos: 18, name: 'Vermelho Escuro', hex: '#b91c1c', bg: 'rgba(185, 28, 28, 0.12)', border: 'border-red-700/50', text: 'text-red-700', badgeBg: 'bg-red-700/20' },
  { pos: 19, name: 'Carmesim', hex: '#991b1b', bg: 'rgba(153, 27, 27, 0.12)', border: 'border-red-800/50', text: 'text-red-800', badgeBg: 'bg-red-800/20' },
  { pos: 20, name: 'Vermelho Puro', hex: '#7f1d1d', bg: 'rgba(127, 29, 29, 0.12)', border: 'border-red-900/50', text: 'text-red-900', badgeBg: 'bg-red-900/20' }
];

export default function InteractiveIdeationTheory() {
  const [activeTab, setActiveTab] = useState<string>('mineracao');
  const [selectedNiche, setSelectedNiche] = useState<string>('Games');
  
  // Interactive Ficha Form State
  const [fichaData, setFichaData] = useState({
    nicho: 'Games',
    titulo: '',
    thumb: '',
    fonte: '',
    hook: '',
    desconforto: '',
    limitação: '',
    postits: {
      amarelo: '',
      verde: '',
      azul: '',
      vermelho: '',
      roxo: ''
    }
  });

  const [fichaSubmitted, setFichaSubmitted] = useState(false);

  // --- NEW STATES FOR TAB 1: MINERAÇÃO ---
  const [activeLayer, setActiveLayer] = useState<number>(1);
  const [selectedToolTab, setSelectedToolTab] = useState<'gratuitas' | 'pagas'>('gratuitas');
  const [aiNiche, setAiNiche] = useState<string>('Games');
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [copiedNotion, setCopiedNotion] = useState<boolean>(false);
  const [twistNiche, setTwistNiche] = useState<string>('Games');

  const boardRef = React.useRef<HTMLDivElement>(null);

  // 20 preloaded, highly viral, engaging High-Concept ideas for different niches
  const INITIAL_IDEAS = [
    { id: '1', text: 'Passei 7 dias dormindo igual a um astronauta da NASA em gravidade zero' },
    { id: '2', text: 'Zerei o Minecraft sem dar um único passo para frente (W quebrado!)' },
    { id: '3', text: 'O crime mais burro da história: ladrão ligou para o banco reclamando do cofre vazio' },
    { id: '4', text: 'Como 3 segundos de CGI mal feito destruíram um blockbuster de 200 milhões de dólares' },
    { id: '5', text: 'Adotei a rotina de produtividade extrema de Elon Musk por uma semana' },
    { id: '6', text: 'Construí um computador funcional dentro do Minecraft usando apenas redstone' },
    { id: '7', text: 'O mistério do avião que pousou 37 anos atrasado e sumiu logo em seguida' },
    { id: '8', text: 'Fiquei 24 horas trancado na maior biblioteca do mundo à noite' },
    { id: '9', text: 'A história secreta de como o Tetris quase causou uma guerra diplomática' },
    { id: '10', text: 'Contratei os 5 piores profissionais do Fiverr para fazer o meu logotipo' },
    { id: '11', text: 'Zerei o jogo mais difícil do mundo jogando apenas com os pés' },
    { id: '12', text: 'A ciência oculta por trás da voz hipnotizante dos dubladores de cinema' },
    { id: '13', text: 'Viajei de ponta a ponta do país gastando menos de 50 reais' },
    { id: '14', text: 'Passei uma semana comendo apenas comidas pretas e brancas' },
    { id: '15', text: 'Como uma única linha de código errada desligou a internet mundial por 4 horas' },
    { id: '16', text: 'Zerei o jogo do dinossauro do Google Chrome (Sim, ele tem um final!)' },
    { id: '17', text: 'Passei 48 horas imitando a rotina matinal secreta de um monge budista' },
    { id: '18', text: 'O dia em que a Pepsi quase teve a sexta maior frota militar do planeta' },
    { id: '19', text: 'Coloquei 100 mil moedas de um centavo na banheira para ver se dava pra nadar' },
    { id: '20', text: 'Escrevi um roteiro inteiro usando apenas sugestões automáticas do meu teclado' }
  ];

  const [ideaBank, setIdeaBank] = useState<any[]>(INITIAL_IDEAS);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [miningFormSuccess, setMiningFormSuccess] = useState<boolean>(false);
  const [miningActionMessage, setMiningActionMessage] = useState<string>('');

  // --- NEW STATES FOR TAB 2: FILTRAGEM ---
  const [selectedUpgradeNiche, setSelectedUpgradeNiche] = useState<string>('Games');
  const [sandboxTitle, setSandboxTitle] = useState<string>('Zerei Minecraft sem dar um único passo para frente (W quebrado!)');
  const [sandboxViews, setSandboxViews] = useState<string>('450 mil visualizações');
  const [sandboxPublished, setSandboxPublished] = useState<string>('há 2 dias');
  const [sandboxThumbBg, setSandboxThumbBg] = useState<string>('games');
  const [sandboxOverlay, setSandboxOverlay] = useState<string>('red_arrow_circle');
  const [customBoringIdea, setCustomBoringIdea] = useState<string>('');
  const [customUpgradedIdea, setCustomUpgradedIdea] = useState<string>('');
  const [hasUpgraded, setHasUpgraded] = useState<boolean>(false);
  const [clickSimulatedCount, setClickSimulatedCount] = useState<number>(0);
  const [isClickSuccess, setIsClickSuccess] = useState<boolean>(false);

  // --- NEW STATES FOR TAB 3: MOODBOARD & POST-ITS ---
  const [postitNichePreset, setPostitNichePreset] = useState<string>('Games');
  const [postitList, setPostitList] = useState<any[]>([
    { id: 'p1', type: 'yellow', title: 'HOOK (0-30s)', desc: 'Mostro o final trágico de mim caindo na lava na última fase e prometo: "Se eu andar para a frente uma única vez, o mundo reseta por completo!"', duration: '20s' },
    { id: 'p2', type: 'green', title: 'CONTEXTO (Até 1:30)', desc: 'Explico a regra do mod customizado que configurei e mostro os primeiros desafios bobos.', duration: '45s' },
    { id: 'p3', type: 'blue', title: 'AÇÃO 1 (Minuto 2)', desc: 'Primeira quase-falha ao tentar abrir um baú de costas. O chat do jogo começa a trollar.', duration: '1m 15s' },
    { id: 'p4', type: 'blue', title: 'AÇÃO 2 (Minuto 5)', desc: 'Cruzar uma ravina gigante usando pontes de terra olhando exclusivamente para cima.', duration: '2m 00s' },
    { id: 'p5', type: 'red', title: 'CLÍMAX (Minuto 8)', desc: 'Combate tenso contra o Ender Dragon se movendo apenas com pérolas do fim (ender pearls) e baldes de água.', duration: '1m 30s' },
    { id: 'p6', type: 'purple', title: 'RESOLUÇÃO (Últimos 30s)', desc: 'Mostro as estatísticas de teclas pressionadas (W = 0). CTA rápido para outro desafio extremo.', duration: '25s' }
  ]);
  
  const [editingPostItId, setEditingPostItId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingDuration, setEditingDuration] = useState<string>('');
  const [newPostitType, setNewPostitType] = useState<'yellow' | 'green' | 'blue' | 'red' | 'purple'>('blue');

  // --- NEW STATES FOR TAB 4: FICHA DE PRODUÇÃO ---
  const [scoreReport, setScoreReport] = useState<{ score: number; feedback: string[]; level: string } | null>(null);

  const applyPostitPreset = (niche: string) => {
    setPostitNichePreset(niche);
    if (niche === 'Games') {
      setPostitList([
        { id: 'p1', type: 'yellow', title: 'HOOK (0-30s)', desc: 'Mostro o final trágico de mim caindo na lava na última fase e prometo: "Se eu andar para a frente uma única vez, o mundo reseta por completo!"', duration: '20s' },
        { id: 'p2', type: 'green', title: 'CONTEXTO (Até 1:30)', desc: 'Explico a regra do mod customizado que configurei e mostro os primeiros desafios bobos.', duration: '45s' },
        { id: 'p3', type: 'blue', title: 'AÇÃO 1 (Minuto 2)', desc: 'Primeira quase-falha ao tentar abrir um baú de costas. O chat do jogo começa a trollar.', duration: '1m 15s' },
        { id: 'p4', type: 'blue', title: 'AÇÃO 2 (Minuto 5)', desc: 'Cruzar uma ravina gigante usando pontes de terra olhando exclusivamente para cima.', duration: '2m 00s' },
        { id: 'p5', type: 'red', title: 'CLÍMAX (Minuto 8)', desc: 'Combate tenso contra o Ender Dragon se movendo apenas com pérolas do fim (ender pearls) e baldes de água.', duration: '1m 30s' },
        { id: 'p6', type: 'purple', title: 'RESOLUÇÃO (Últimos 30s)', desc: 'Mostro as estatísticas de teclas pressionadas (W = 0). CTA rápido para outro desafio extremo.', duration: '25s' }
      ]);
    } else if (niche === 'True Crime') {
      setPostitList([
        { id: 'p1', type: 'yellow', title: 'HOOK (0-30s)', desc: 'Mostro imagens de satélite do iate à deriva no meio do oceano e revelo: "O iate estava intacto, a mesa posta... mas os 5 tripulantes evaporaram."', duration: '25s' },
        { id: 'p2', type: 'green', title: 'CONTEXTO (Até 1:30)', desc: 'Apresento quem eram os membros da família rica e o diário de bordo impecável da viagem.', duration: '50s' },
        { id: 'p3', type: 'blue', title: 'AÇÃO 1 (Minuto 3)', desc: 'A primeira pista macabra: o rádio de comunicação foi cortado por dentro com um machado.', duration: '1m 30s' },
        { id: 'p4', type: 'blue', title: 'AÇÃO 2 (Minuto 6)', desc: 'Revelação do bilhete misterioso encontrado no cofre do capitão com coordenadas impossíveis.', duration: '2m 10s' },
        { id: 'p5', type: 'red', title: 'CLÍMAX (Minuto 10)', desc: 'A revelação do único sobrevivente encontrado numa ilha deserta 12 anos depois e o depoimento assustador.', duration: '1m 45s' },
        { id: 'p6', type: 'purple', title: 'RESOLUÇÃO (Últimos 30s)', desc: 'Análise moral do caso, link para o documentário completo sobre piratas modernos.', duration: '20s' }
      ]);
    } else if (niche === 'Vlog / Lifestyle') {
      setPostitList([
        { id: 'p1', type: 'yellow', title: 'HOOK (0-30s)', desc: 'Mostro a placa de "Cuidado: Cães Bravos" e me deitando no chão frio: "Estou passando a noite no pior hotel do país, e acabei de ouvir passos na porta."', duration: '15s' },
        { id: 'p2', type: 'green', title: 'CONTEXTO (Até 1:30)', desc: 'Mostro a nota 1.2 estrelas no TripAdvisor e o taxista se recusando a me deixar na porta à noite.', duration: '40s' },
        { id: 'p3', type: 'blue', title: 'AÇÃO 1 (Minuto 2)', desc: 'O check-in bizarro com o recepcionista que usa máscara e a fechadura quebrada do quarto.', duration: '1m 20s' },
        { id: 'p4', type: 'blue', title: 'AÇÃO 2 (Minuto 5)', desc: 'Investigando barulhos estranhos no duto de ar e descobrindo uma câmera analógica desativada.', duration: '2m 30s' },
        { id: 'p5', type: 'red', title: 'CLÍMAX (Minuto 8)', desc: 'Alguém tenta girar a maçaneta às 3h15 da manhã. Eu gravo a fresta e chamo a polícia local.', duration: '1m 50s' },
        { id: 'p6', type: 'purple', title: 'RESOLUÇÃO (Últimos 30s)', desc: 'O desfecho na delegacia de manhã, o reembolso de R$ 35 e o alerta de segurança.', duration: '30s' }
      ]);
    } else if (niche === 'Cinema / Ensaio') {
      setPostitList([
        { id: 'p1', type: 'yellow', title: 'HOOK (0-30s)', desc: 'Mostro a famosa cena da onda gigante de Interstellar e pergunto: "Por que essa trilha sonora de órgão de igreja tem a resposta física para o tempo?"', duration: '30s' },
        { id: 'p2', type: 'green', title: 'CONTEXTO (Até 1:30)', desc: 'A obsessão de Christopher Nolan por precisão científica extrema e o envolvimento de Kip Thorne.', duration: '55s' },
        { id: 'p3', type: 'blue', title: 'AÇÃO 1 (Minuto 3)', desc: 'Análise visual do tic-tac do relógio: cada som de órgão equivale a exatamente 1 dia na Terra.', duration: '1m 40s' },
        { id: 'p4', type: 'blue', title: 'AÇÃO 2 (Minuto 6)', desc: 'Como o compositor Hans Zimmer transformou equações de gravidade em partitura de música.', duration: '2m 15s' },
        { id: 'p5', type: 'red', title: 'CLÍMAX (Minuto 9)', desc: 'O impacto dramático: a união perfeita de som, dilatação temporal e luto paterno.', duration: '2m 00s' },
        { id: 'p6', type: 'purple', title: 'RESOLUÇÃO (Últimos 30s)', desc: 'Como o cinema pode ensinar ciência sem ser chato. Indicação de livro sobre a física de Interstellar.', duration: '25s' }
      ]);
    }
  };

  const handleUpgradeIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customBoringIdea.trim()) return;
    
    const idea = customBoringIdea.trim().toLowerCase();
    let upgrade = '';
    
    if (selectedUpgradeNiche === 'Games') {
      if (idea.includes('minecraft') || idea.includes('mine')) {
        upgrade = 'Zerei Minecraft sem dar um único passo para frente (W quebrado!)';
        setSandboxThumbBg('games');
      } else if (idea.includes('gta') || idea.includes('grand theft auto')) {
        upgrade = 'Terminei o GTA San Andreas sem cometer uma única infração de trânsito';
        setSandboxThumbBg('games');
      } else if (idea.includes('dark souls') || idea.includes('elden ring') || idea.includes('souls')) {
        upgrade = 'Zerei Dark Souls usando uma bateria de carro real como controle';
        setSandboxThumbBg('games');
      } else {
        upgrade = `Tentei zerar ${customBoringIdea} com apenas 1 ponto de vida no modo hardcore`;
        setSandboxThumbBg('games');
      }
    } else if (selectedUpgradeNiche === 'True Crime') {
      if (idea.includes('navio') || idea.includes('mar') || idea.includes('fantasma')) {
        upgrade = 'O Navio Fantasma de Luxo que navegou sem tripulação por 50 anos';
        setSandboxThumbBg('crime');
      } else if (idea.includes('assalto') || idea.includes('ladrão') || idea.includes('roubo')) {
        upgrade = 'O assaltante trapalhão que ligou para avisar a polícia antes do crime';
        setSandboxThumbBg('crime');
      } else if (idea.includes('serial') || idea.includes('assassino') || idea.includes('caso')) {
        upgrade = 'O detetive que descobriu que o principal suspeito era seu próprio chefe';
        setSandboxThumbBg('crime');
      } else {
        upgrade = `O mistério por trás do desaparecimento de ${customBoringIdea} que a polícia tentou esconder`;
        setSandboxThumbBg('crime');
      }
    } else if (selectedUpgradeNiche === 'Vlog / Lifestyle') {
      if (idea.includes('hotel') || idea.includes('pousada') || idea.includes('quarto')) {
        upgrade = 'Passei 24 horas trancado no pior hotel avaliado do país';
        setSandboxThumbBg('vlog');
      } else if (idea.includes('mochila') || idea.includes('viagem') || idea.includes('viajar')) {
        upgrade = 'Viajei para outro país sem levar dinheiro, celular ou mala';
        setSandboxThumbBg('vlog');
      } else if (idea.includes('dormir') || idea.includes('sono') || idea.includes('rotina')) {
        upgrade = 'Adotei a rotina de sono polifásica de Nikola Tesla por 7 dias';
        setSandboxThumbBg('vlog');
      } else {
        upgrade = `Passei 48h fazendo exatamente o oposto de tudo que ${customBoringIdea} me mandou fazer`;
        setSandboxThumbBg('vlog');
      }
    } else { // Cinema
      if (idea.includes('interstellar') || idea.includes('nolam') || idea.includes('nolan')) {
        upgrade = 'A trilha sonora oculta de Interstellar que desvendou a física moderna';
        setSandboxThumbBg('cinema');
      } else if (idea.includes('batman') || idea.includes('coringa')) {
        upgrade = 'Por que o Batman de 1989 cometeu o pior erro da história do cinema';
        setSandboxThumbBg('cinema');
      } else if (idea.includes('marvel') || idea.includes('vingadores') || idea.includes('disney')) {
        upgrade = 'Como 3 segundos de CGI mal feito destruíram a credibilidade da Marvel';
        setSandboxThumbBg('cinema');
      } else {
        upgrade = `A cena secreta de 2 minutos que salvou o filme ${customBoringIdea} do fracasso completo`;
        setSandboxThumbBg('cinema');
      }
    }
    
    setCustomUpgradedIdea(upgrade);
    setSandboxTitle(upgrade); // Auto-fill sandbox title!
    setHasUpgraded(true);
  };

  const handleSimulateClick = () => {
    setIsClickSuccess(true);
    setClickSimulatedCount(prev => prev + 1);
    setTimeout(() => {
      setIsClickSuccess(false);
    }, 2000);
  };

  const updatePostitText = (id: string, text: string) => {
    setPostitList(prev => prev.map(p => p.id === id ? { ...p, desc: text } : p));
  };

  const updatePostitDuration = (id: string, duration: string) => {
    setPostitList(prev => prev.map(p => p.id === id ? { ...p, duration } : p));
  };

  const handleAddPostit = (type: 'yellow' | 'green' | 'blue' | 'red' | 'purple') => {
    const typeTitles = {
      yellow: 'HOOK',
      green: 'CONTEXTO',
      blue: 'AÇÃO',
      red: 'CLÍMAX',
      purple: 'RESOLUÇÃO'
    };
    const newP = {
      id: 'p-' + Date.now(),
      type,
      title: `${typeTitles[type].toUpperCase()} (Novo)`,
      desc: 'Descreva a ação ou diálogo deste post-it...',
      duration: '1m 00s'
    };
    setPostitList(prev => [...prev, newP]);
  };

  const handleDeletePostit = (id: string) => {
    setPostitList(prev => prev.filter(p => p.id !== id));
  };

  const evaluateFichaScore = () => {
    let score = 50;
    const feedback: string[] = [];
    
    // Check Title length
    if (sandboxTitle.length > 0 && sandboxTitle.length <= 50) {
      score += 15;
      feedback.push("✓ Título excelente: Curto, direto e não será cortado em dispositivos móveis (menos de 50 caracteres).");
    } else if (sandboxTitle.length > 50 && sandboxTitle.length <= 70) {
      score += 5;
      feedback.push("⚠ Título aceitável, mas pode sofrer cortes parciais em algumas interfaces de celulares. Tente enxugar.");
    } else if (sandboxTitle.length > 70) {
      score -= 10;
      feedback.push("❌ Título excessivamente longo! Será cortado pelo YouTube em quase todas as telas. Resuma a promessa.");
    } else {
      score -= 20;
      feedback.push("❌ Nenhum título provisório foi informado. O título é o principal gatilho de busca.");
    }

    // Check post-its pacing
    const hasHook = postitList.some(p => p.type === 'yellow');
    const hasContext = postitList.some(p => p.type === 'green');
    const actionCount = postitList.filter(p => p.type === 'blue').length;
    const hasClimax = postitList.some(p => p.type === 'red');
    const hasResolution = postitList.some(p => p.type === 'purple');

    if (hasHook) {
      score += 10;
    } else {
      score -= 15;
      feedback.push("❌ Falta o Post-it Amarelo (HOOK)! Sem um gancho visual e falado nos primeiros 15s, a evasão inicial será altíssima.");
    }

    if (hasContext) {
      score += 5;
    } else {
      feedback.push("⚠ Falta o Post-it Verde (CONTEXTO). Certifique-se de que o público entenderá as regras básicas antes da ação.");
    }

    if (actionCount >= 2) {
      score += 15;
      feedback.push(`✓ Estrutura rítmica ideal: Você possui ${actionCount} blocos de ação intermediários para sustentar a retenção.`);
    } else if (actionCount === 1) {
      score += 5;
      feedback.push("⚠ Apenas 1 bloco de ação. O meio do vídeo pode parecer plano ou lento. Adicione mais um ponto de virada.");
    } else {
      score -= 10;
      feedback.push("❌ Sem blocos de ação (Post-its Azuis). Seu vídeo irá direto do contexto para o clímax, destruindo o engajamento.");
    }

    if (hasClimax) {
      score += 5;
    } else {
      score -= 10;
      feedback.push("❌ Falta o Post-it Vermelho (CLÍMAX). Todo bom vídeo do YouTube precisa de uma resolução ou recompensa épica prometida.");
    }

    // Limitadora
    if (fichaData.limitação.trim().length > 10) {
      score += 10;
      feedback.push("✓ Excelente: Limitação criativa clara estabelecida. Isso eleva a tese dramática do vídeo.");
    } else {
      feedback.push("⚠ Sem limitação criativa forte. Tente impor um obstáculo extra para fugir de conteúdos mornos.");
    }

    let level = 'Iniciante';
    if (score >= 90) level = 'Mestre do Algoritmo (Excelente)';
    else if (score >= 75) level = 'Produtor Sênior (Bom potencial)';
    else if (score >= 55) level = 'Roteirista Júnior (Precisa de ajustes)';
    else level = 'Rascunho Instável (Risco de baixa retenção)';

    // Clamp score
    const finalScore = Math.min(100, Math.max(10, score));

    setScoreReport({
      score: finalScore,
      feedback,
      level
    });
  };


  const handleAddIdea = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Find first empty or placeholder slot to insert a generic starter text
    const targetIdx = ideaBank.findIndex(item => !item.text || item.text.trim() === "");
    if (targetIdx !== -1) {
      setIdeaBank(prev => prev.map((item, idx) => idx === targetIdx ? { ...item, text: "Nova ideia incrível de conteúdo..." } : item));
      setMiningActionMessage("Adicionada ao primeiro slot vazio!");
      setMiningFormSuccess(true);
      setTimeout(() => setMiningFormSuccess(false), 3000);
    } else {
      // If all slots are full, alert the user or overwrite the first slot
      setMiningActionMessage("Todos os 20 slots estão cheios! Limpe algum slot antes.");
      setMiningFormSuccess(true);
      setTimeout(() => setMiningFormSuccess(false), 4000);
    }
  };

  const handleDeleteIdea = (id: string) => {
    setIdeaBank(prev => prev.map(item => item.id === id ? { ...item, text: "" } : item));
    setMiningActionMessage("Slot de ideia limpo!");
    setMiningFormSuccess(true);
    setTimeout(() => setMiningFormSuccess(false), 2000);
  };

  const handleUpdatePostitText = (id: string, text: string) => {
    if (text.length > 144) return;
    setIdeaBank(prev => prev.map(item => item.id === id ? { ...item, text } : item));
  };

  const moveIdeaUp = (index: number) => {
    if (index <= 0) return;
    setIdeaBank(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
    setMiningActionMessage(`Subiu para a posição ${index}!`);
    setMiningFormSuccess(true);
    setTimeout(() => setMiningFormSuccess(false), 2000);
  };

  const moveIdeaDown = (index: number) => {
    if (index >= 19) return;
    setIdeaBank(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
    setMiningActionMessage(`Desceu para a posição ${index + 2}!`);
    setMiningFormSuccess(true);
    setTimeout(() => setMiningFormSuccess(false), 2000);
  };

  const handleResetAllIdeas = () => {
    setIdeaBank(INITIAL_IDEAS);
    setMiningActionMessage("Restauradas as 20 ideias originais!");
    setMiningFormSuccess(true);
    setTimeout(() => setMiningFormSuccess(false), 3000);
  };

  const handleClearAllIdeas = () => {
    setIdeaBank(INITIAL_IDEAS.map(item => ({ ...item, text: "" })));
    setMiningActionMessage("Todos os 20 slots foram limpos!");
    setMiningFormSuccess(true);
    setTimeout(() => setMiningFormSuccess(false), 3000);
  };

  const handleDragStart = (e: any, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.setData('text/plain', index.toString());
      e.dataTransfer.effectAllowed = 'move';
    }
  };

  const handleDragOver = (e: any, index: number) => {
    if (e.preventDefault) e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: any, targetIndex: number) => {
    if (e.preventDefault) e.preventDefault();
    const sourceIndexStr = e.dataTransfer ? e.dataTransfer.getData('text/plain') : '';
    if (sourceIndexStr !== '') {
      const sourceIndex = parseInt(sourceIndexStr, 10);
      if (sourceIndex !== targetIndex && sourceIndex >= 0 && sourceIndex < 20 && targetIndex >= 0 && targetIndex < 20) {
        const reordered = [...ideaBank];
        const [removed] = reordered.splice(sourceIndex, 1);
        reordered.splice(targetIndex, 0, removed);
        setIdeaBank(reordered);
        setMiningActionMessage(`Ideia movida para a posição ${targetIndex + 1}!`);
        setMiningFormSuccess(true);
        setTimeout(() => setMiningFormSuccess(false), 2000);
      }
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleCopyPrompt = () => {
    const promptText = `Atue como um produtor do YouTube focado no nicho [${aiNiche}]. Tenho esta pesquisa bruta: [Cole o texto/links do Reddit ou notícias]. Gere 5 conceitos de vídeos no formato 'Alto Conceito' que coloquem o criador em uma situação de desafio ou limitação, e sugira 3 opções de título e thumbnail para cada um.`;
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }).catch(() => {
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    });
  };

  const tabs: TabData[] = [
    {
      id: 'mineracao',
      num: '01',
      title: 'MINERAÇÃO',
      subtitle: 'Achar a ideia',
      color: 'bg-[#0071e3]',
      lightBg: 'bg-[#0071e3]/5',
      borderClr: 'border-[#0071e3]/20'
    },
    {
      id: 'filtragem',
      num: '02',
      title: 'FILTRAGEM',
      subtitle: 'Thumb & Título First',
      color: 'bg-[#ff9f0a]',
      lightBg: 'bg-[#ff9f0a]/5',
      borderClr: 'border-[#ff9f0a]/20'
    },
    {
      id: 'moodboard',
      num: '03',
      title: 'MOODBOARD & POST-ITS',
      subtitle: 'Ordem das Cenas',
      color: 'bg-[#bf5af2]',
      lightBg: 'bg-[#bf5af2]/5',
      borderClr: 'border-[#bf5af2]/20'
    },
    {
      id: 'ficha',
      num: '04',
      title: 'FICHA DE PRODUÇÃO',
      subtitle: 'Pronto para Gravar',
      color: 'bg-[#30d158]',
      lightBg: 'bg-[#30d158]/5',
      borderClr: 'border-[#30d158]/20'
    }
  ];

  const handleFichaChange = (field: string, value: string) => {
    setFichaData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePostitChange = (field: string, value: string) => {
    setFichaData(prev => ({
      ...prev,
      postits: {
        ...prev.postits,
        [field]: value
      }
    }));
  };

  const currentTabIdx = tabs.findIndex(t => t.id === activeTab);
  const handlePrevTab = () => {
    if (currentTabIdx > 0) {
      setActiveTab(tabs[currentTabIdx - 1].id);
    }
  };
  const handleNextTab = () => {
    if (currentTabIdx < tabs.length - 1) {
      setActiveTab(tabs[currentTabIdx + 1].id);
    }
  };

  return (
    <div className="space-y-8 select-text" id="interactive-ideation-root">
      
      {/* Dynamic Content Frame */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="space-y-6 py-2"
        >
          
          {/* TAB 1: MINERAÇÃO */}
          {activeTab === 'mineracao' && (
            <div className="space-y-6 animate-fade-in" id="theory-mineracao-panel">
              {/* Header block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900">MINERAÇÃO: A Busca Ativa por Demanda Real</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                      Minerar ideias não é esperar passivamente pela inspiração, mas sim aplicar um processo ativo de pesquisa de mercado, análise de comportamento e extração de dados.
                    </p>
                  </div>
                </div>
              </div>

              {/* Three layers method */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-sm text-neutral-800 uppercase tracking-tight">
                    O Método de Mineração: As 3 Camadas de Extração
                  </h5>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  Para encontrar ideias com alto potencial de visualização, a mineração deve cobrir três camadas estratégicas de forma sequencial. Clique em cada camada abaixo para explorar:
                </p>

                {/* Pipeline UI */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveLayer(1)}
                    className={`p-4 rounded-xl text-left transition-all relative cursor-pointer border ${
                      activeLayer === 1 
                        ? 'bg-[#0071e3]/5 border-[#0071e3]/20 text-[#0071e3]' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-neutral-400 block">CAMADA 1</span>
                    <h6 className="font-bold text-xs mt-0.5">
                      Demanda e Lacunas
                    </h6>
                    <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">O que o público busca</span>
                    {activeLayer === 1 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0071e3]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLayer(2)}
                    className={`p-4 rounded-xl text-left transition-all relative cursor-pointer border ${
                      activeLayer === 2 
                        ? 'bg-[#ff9f0a]/5 border-[#ff9f0a]/20 text-[#ff9f0a]' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-neutral-400 block">CAMADA 2</span>
                    <h6 className="font-bold text-xs mt-0.5">
                      Análise de Outliers
                    </h6>
                    <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">O que funcionou nos outros</span>
                    {activeLayer === 2 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ff9f0a]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveLayer(3)}
                    className={`p-4 rounded-xl text-left transition-all relative cursor-pointer border ${
                      activeLayer === 3 
                        ? 'bg-[#bf5af2]/5 border-[#bf5af2]/20 text-[#bf5af2]' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-[9px] font-mono font-bold text-neutral-400 block">CAMADA 3</span>
                    <h6 className="font-bold text-xs mt-0.5">
                      Ângulo Único (Twist)
                    </h6>
                    <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">Sua versão com atrito</span>
                    {activeLayer === 3 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#bf5af2]" />
                    )}
                  </button>
                </div>

                {/* Layer Detail Box */}
                <div className="py-4 pl-4 border-l-2 border-[#0071e3] space-y-3">
                  <AnimatePresence mode="wait">
                    {activeLayer === 1 && (
                      <motion.div
                        key="layer1"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#0071e3] text-white text-[9px] font-bold font-mono">CAMADA 1</span>
                          <h6 className="font-bold text-sm text-neutral-800">Identificação de Lacunas (Content Gaps)</h6>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          Consiste em descobrir sobre o que as pessoas estão ativamente pesquisando ou discutindo, mas que os canais do seu nicho ainda não responderam de forma satisfatória ou divertida. O ouro está em encontrar perguntas sem boas respostas no topo do algoritmo.
                        </p>
                      </motion.div>
                    )}

                    {activeLayer === 2 && (
                      <motion.div
                        key="layer2"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#ff9f0a] text-white text-[9px] font-bold font-mono">CAMADA 2</span>
                          <h6 className="font-bold text-sm text-neutral-800">Análise de Outliers (Vídeos Ponto Fora da Curva)</h6>
                        </div>
                        <p className="text-xs text-neutral-600 leading-relaxed">
                          Observar canais concorrentes (pequenos, médios e grandes) e identificar vídeos que tiveram um volume de visualizações drasticamente maior que a média do próprio canal. Se um vídeo de um canal pequeno viralizou, o assunto + formato é o fator de atração e deve ser replicado com seu style.
                        </p>
                      </motion.div>
                    )}

                    {activeLayer === 3 && (
                      <motion.div
                        key="layer3"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-[#bf5af2] text-white text-[9px] font-bold font-mono">CAMADA 3</span>
                            <h6 className="font-bold text-sm text-neutral-800">Aplicação de Atrito e Desconforto (The Twist)</h6>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">
                            Adicionar um obstáculo, limite, risco ou aposta extrema ao conceito base. O atrito gera curiosidade, superação humana e drama, mantendo a retenção no ápice.
                          </p>
                        </div>

                        {/* Interactive Twist Generator */}
                        <div className="space-y-3 pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2">
                            <span className="text-[10px] font-mono font-bold text-neutral-400">PLAYGROUND: GERADOR DE TWIST</span>
                            <div className="flex flex-wrap gap-1">
                              {['Games', 'True Crime', 'Vlog', 'Cinema'].map(n => (
                                <button
                                  key={n}
                                  type="button"
                                  onClick={() => setTwistNiche(n)}
                                  className={`px-2 py-0.5 text-[10px] font-bold rounded cursor-pointer transition-all ${
                                    twistNiche === n ? 'bg-neutral-950 text-white' : 'bg-neutral-100 text-neutral-500 hover:text-neutral-800'
                                  }`}
                                >
                                  {n}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
                            <div className="space-y-1 border-l-2 border-neutral-200 pl-3">
                              <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase tracking-wider block">
                                CONCEITO SEM ATRITO (MORNO)
                              </span>
                              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                                {twistNiche === 'Games' && '“Jogando o novo jogo do Homem-Aranha”'}
                                {twistNiche === 'True Crime' && '“O caso do detetive Y”'}
                                {twistNiche === 'Vlog' && '“Viajei de férias para o litoral”'}
                                {twistNiche === 'Cinema' && '“Análise técnica do filme Batman”'}
                              </p>
                            </div>

                            <div className="space-y-1 border-l-2 border-[#bf5af2] pl-3">
                              <span className="text-[9px] font-bold font-mono text-[#bf5af2] uppercase tracking-wider block">
                                COM ATRITO (O TWIST!)
                              </span>
                              <p className="text-xs font-bold text-neutral-950 leading-relaxed">
                                {twistNiche === 'Games' && '“Zerando o novo jogo do Homem-Aranha sem usar teia uma única vez”'}
                                {twistNiche === 'True Crime' && '“O detetive que investigou o próprio chefe”'}
                                {twistNiche === 'Vlog' && '“Viajei para o litoral sem levar dinheiro ou celular”'}
                                {twistNiche === 'Cinema' && '“Por que o Batman de 1989 cometeu o pior erro do cinema”'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Tool Guide section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-sm text-neutral-800 uppercase tracking-tight">
                    2. Guia de Ferramentas, Apps e Sites para Pesquisa
                  </h5>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  Aqui está o arsenal completo de ferramentas divididas entre gratuitas e pagas, com a explicação prática de como usar e o que extrair de cada uma:
                </p>

                {/* Sub-tabs for tools */}
                <div className="flex gap-2 border-b border-neutral-100 pb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedToolTab('gratuitas')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedToolTab === 'gratuitas' 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    A. Ferramentas Gratuitas
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedToolTab('pagas')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      selectedToolTab === 'pagas' 
                        ? 'bg-neutral-900 text-white' 
                        : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    B. Ferramentas Pagas e IA
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {selectedToolTab === 'gratuitas' ? (
                    <motion.div
                      key="free-tools"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      {/* Tool 1 */}
                      <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs text-neutral-900">Aba "Pesquisa" do YouTube Studio (Oficial)</h6>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-neutral-600">
                          <p><strong>Como usar:</strong> Acesse o painel do seu canal &gt; Estatísticas &gt; Aba Pesquisa.</p>
                          <p><strong>O que buscar:</strong> Veja os tópicos pesquisados por seus espectadores e públicos semelhantes.</p>
                          <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                            <span><strong>O Ouro:</strong> O YouTube indica diretamente quais buscas estão com "Lacuna de Conteúdo" (Content Gaps), ou seja, pessoas buscando algo sem encontrar vídeos de alta qualidade.</span>
                          </div>
                        </div>
                      </div>

                      {/* Tool 2 */}
                      <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs text-neutral-900">Fóruns & Redes Culturais (Reddit, Quora, Fandom)</h6>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-neutral-600">
                          <p><strong>Como usar:</strong> Busque por subreddits do seu nicho (ex: <code>r/TrueCrime</code>). Ordene por "Top - All Time".</p>
                          <p><strong>O que buscar:</strong> Relatos na primeira pessoa, dilemas reais, teorias de fãs, polêmicas não resolvidas.</p>
                          <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                            <span><strong>O Ouro:</strong> As histórias e dúvidas mais votadas pelos usuários reais são a validação imediata do interesse do público sobre um tema.</span>
                          </div>
                        </div>
                      </div>

                      {/* Tool 3 */}
                      <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs text-neutral-900">Busca de Tendência (Google Trends & AnswerThePublic)</h6>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-neutral-600">
                          <p><strong>Como usar:</strong> No Google Trends, compare palavras-chave de 90 dias. No AnswerThePublic, insira um termo para gerar a nuvem de perguntas.</p>
                          <p><strong>O que buscar:</strong> Perguntas exatas formuladas pelas pessoas (termos com "por que", "como fazer", "o que aconteceu").</p>
                          <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                            <span><strong>O Ouro:</strong> A dúvida exata digitada pelo usuário na barra de buscas se transforma diretamente no título magnético do seu vídeo.</span>
                          </div>
                        </div>
                      </div>

                      {/* Tool 4 */}
                      <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5">
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs text-neutral-900">Busca Anônima & Filmot.com</h6>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-neutral-600">
                          <p><strong>Como usar:</strong> Use a barra do YouTube anônimo para Autocomplete. Use Filmot.com para buscar palavras faladas in legendas de vídeos.</p>
                          <p><strong>O que buscar:</strong> Momentos em que outros YouTubers citam o assunto ou caso específico de forma espontânea.</p>
                          <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                            <span><strong>O Ouro:</strong> Permite mapear e decifrar o que outros criadores disseram sobre o tema para cobrir furos e pontos abordados de forma rasa.</span>
                          </div>
                        </div>
                      </div>

                      {/* Tool 5 */}
                      <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2.5 md:col-span-2">
                        <div className="flex items-center gap-2">
                          <h6 className="font-bold text-xs text-neutral-900">Plataformas de Nicho (IMDb, Letterboxd, Steam, Metacritic)</h6>
                        </div>
                        <div className="space-y-1.5 text-[11px] text-neutral-600">
                          <p><strong>Como usar:</strong> Para cinema, veja resenhas populares no Letterboxd. Para games, analise comentários negativos e mods na Steam. Para True Crime, consulte bases de dados locais.</p>
                          <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                            <span><strong>O Ouro:</strong> Coleta de furos de histórias, dados técnicos ocultos, curiosidades de bastidores esquecidas e opiniões controversas com alto apelo emocional.</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="paid-tools"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Paid 1 */}
                        <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                          <div className="flex items-center gap-2">
                            <h6 className="font-bold text-xs text-neutral-900">Métricas & Otimização (vidIQ / TubeBuddy)</h6>
                          </div>
                          <div className="space-y-1 text-[11px] text-neutral-600">
                            <p><strong>Como usar:</strong> Instale a extensão no navegador para dados de buscas.</p>
                            <p><strong>O que buscar:</strong> Pontuação de Oportunidade (Volume de Busca x Grau de Competição).</p>
                            <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                              <span><strong>O Ouro:</strong> Descobrir termos com altíssimo interesse e concorrência fraca ou desatualizada.</span>
                            </div>
                          </div>
                        </div>

                        {/* Paid 2 */}
                        <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                          <div className="flex items-center gap-2">
                            <h6 className="font-bold text-xs text-neutral-900">Localizadores de Outliers (1of10 / Spotter Studio)</h6>
                          </div>
                          <div className="space-y-1 text-[11px] text-neutral-600">
                            <p><strong>Como usar:</strong> Use a plataforma para mapear os vídeos ponto fora da curva.</p>
                            <p><strong>O que buscar:</strong> Formatos e styles de thumbnail/título que funcionaram fora do país recentemente.</p>
                            <div className="text-[#30d158] text-[10px] leading-relaxed flex items-start gap-1 pt-1.5 border-t border-neutral-100 mt-1">
                              <span><strong>O Ouro:</strong> Adaptar e traduzir formatos validados no mercado gringo para a sua realidade.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Paid 3 - Interactive AI Prompt Builder */}
                      <div className="p-4 rounded-xl border border-[#bf5af2]/30 bg-white space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h6 className="font-bold text-xs text-neutral-900">Modelos de IA como Parceiros de Brainstorming</h6>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold text-neutral-400 font-mono">SELECIONE O NICHO:</span>
                            <select 
                              value={aiNiche}
                              onChange={(e) => setAiNiche(e.target.value)}
                              className="bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-[10px] font-bold text-neutral-700 outline-none cursor-pointer"
                            >
                              <option value="Games">Games</option>
                              <option value="True Crime">True Crime</option>
                              <option value="Vlog / Lifestyle">Vlog</option>
                              <option value="Cinema / Séries">Cinema</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1 text-[11px] text-neutral-600">
                          <p><strong>Como usar:</strong> Não peça "me dê 10 ideias de vídeos". Use a IA com restrições e parâmetros claros baseados nas suas pesquisas brutas do Reddit ou do Studio.</p>
                        </div>

                        <div className="bg-neutral-900 rounded-xl p-3.5 relative overflow-hidden space-y-2">
                          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
                            <span className="text-[10px] font-mono font-bold text-neutral-400">PROMPT DE INTELIGÊNCIA ARTIFICIAL COPIÁVEL</span>
                            <button
                              type="button"
                              onClick={handleCopyPrompt}
                              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-[10px] font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                            >
                              {copiedPrompt ? "✓ Copiado!" : "Copiar Prompt"}
                            </button>
                          </div>
                          <pre className="text-[10px] text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed select-all">
                            {`Atue como um produtor do YouTube focado no nicho [${aiNiche}]. Tenho esta pesquisa bruta: [Cole o texto/links do Reddit ou notícias]. Gere 5 conceitos de vídeos no formato 'Alto Conceito' que coloquem o criador em uma situação de desafio ou limitação, e sugira 3 opções de título e thumbnail para cada um.`}
                          </pre>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Organizing & Banco de Ideias */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-sm text-neutral-800 uppercase tracking-tight">
                    Como Organizar a Informação Recortada (O Banco de Ideias)
                  </h5>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  Minerar gera um volume grande de dados brutos (links, prints, frases, estatísticas). Se você não organizar esse material, as ideias morrerão no esquecimento.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: Notion/Trello */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
                    <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase block">Escolha sua Central de Controle</span>
                    <h6 className="font-bold text-xs text-neutral-900">Aplicativos de Organização Flexíveis</h6>
                    <ul className="text-[11px] text-neutral-500 space-y-1.5 list-disc pl-4 leading-relaxed">
                      <li><strong>Notion ou Trello:</strong> Ideais para criar quadros estilo Kanban (Idea Bank &gt; Em Pesquisa &gt; Roteirização &gt; Gravando).</li>
                      <li><strong>Google Keep / Apple Notes:</strong> Ótimos para capturas rápidas de ideias pelo celular durante o dia a dia.</li>
                    </ul>
                  </div>

                  {/* Option B: interactive card description */}
                  <div className="p-4 rounded-xl border border-[#30d158]/30 bg-white space-y-2">
                    <span className="text-[9px] font-bold font-mono text-[#30d158] uppercase block">O Modelo de Ficha da Ideia Minorada</span>
                    <h6 className="font-bold text-xs text-neutral-900">Filtre antes de Escrever o Roteiro</h6>
                    <p className="text-[11px] text-neutral-500 leading-relaxed">
                      Para cada ideia coletada que pareça promissora, preencha a Ficha Técnica de Mineração. Isso garante que sua ideia possua uma embalagem matadora e atrito real antes de gastar dias roteirizando e gravando.
                    </p>
                  </div>
                </div>

                {/* INTERACTIVE PLAYGROUND: THE IDEA BANK & CARD BUILDER */}
                <div className="border border-neutral-200 rounded-3xl overflow-hidden shadow-sm bg-white w-full">
                  <div className="bg-neutral-950 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <h4 className="font-semibold text-lg tracking-tight">QUADRO DE IDEIAS</h4>
                        <p className="text-xs text-neutral-400">Ordene os campos arrastando-os ou clicando nos botões. A cor se adapta instantaneamente à posição.</p>
                      </div>
                    </div>
                    <span className="bg-[#0071e3]/20 text-[#0071e3] font-mono text-[11px] font-bold px-3 py-1 rounded-full border border-[#0071e3]/30 self-start sm:self-auto">
                      {ideaBank.filter(i => i.text.trim() !== "").length} de 20 Ideias Preenchidas
                    </span>
                  </div>

                  {/* Horizontal Control Bar */}
                  <div className="bg-neutral-50 p-4 border-b border-neutral-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      
                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={() => handleAddIdea()}
                        className="bg-[#0071e3] hover:bg-[#0077ed] text-white px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 border-none"
                      >
                        Adicionar Nova Ideia
                      </button>

                      {/* Clear Button */}
                      <button
                        type="button"
                        onClick={handleClearAllIdeas}
                        className="bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        Limpar Tudo
                      </button>

                      {/* Reset Button */}
                      <button
                        type="button"
                        onClick={handleResetAllIdeas}
                        className="bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-200 px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                      >
                        Restaurar Originais
                      </button>

                    </div>

                    <div className="flex items-center gap-3">
                      {miningFormSuccess && (
                        <span className="text-xs text-emerald-600 font-bold animate-fade-in flex items-center gap-1">
                          ✓ {miningActionMessage}
                        </span>
                      )}
                      <span className="text-[11px] text-neutral-500 font-medium hidden sm:inline">
                        Arraste para reordenar posições na lista.
                      </span>
                    </div>
                  </div>

                  {/* Canvas/Board block (Full Width!) with Cork texture */}
                  <div 
                    className="p-5 sm:p-6 bg-neutral-200/40 relative min-h-[500px]"
                    style={{
                      backgroundImage: "url('/img/bg/bg_studio.webp')",
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: 'inset 0 4px 20px rgba(0,0,0,0.15)'
                    }}
                  >
                    {/* Dark amber wood overlay */}
                    <div className="absolute inset-0 bg-amber-950/10 pointer-events-none" />

                    {/* 20-Field Grid of Ideas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
                      {ideaBank.map((item, idx) => {
                        const colInfo = POSITION_COLORS[idx] || POSITION_COLORS[0];
                        const isHigh = idx < 7;     // 1-7 Green
                        const isMedium = idx >= 7 && idx < 14; // 8-14 Yellow
                        const isLow = idx >= 14;    // 15-20 Red
                        const isDragging = draggedIndex === idx;
                        const isDragOver = dragOverIndex === idx;

                        return (
                          <motion.div
                            key={item.id}
                            layout
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDragEnd={handleDragEnd}
                            onDrop={(e) => handleDrop(e, idx)}
                            className={`p-4 rounded-2xl border transition-all flex flex-col justify-between cursor-grab active:cursor-grabbing backdrop-blur-xs min-h-[170px] select-none ${
                              isDragging ? 'opacity-40 border-dashed border-neutral-400 scale-95' : 'hover:scale-[1.01] hover:shadow-md'
                            } ${colInfo.border}`}
                            style={{
                              backgroundColor: colInfo.bg,
                              boxShadow: isDragOver ? `0 0 16px ${colInfo.hex}80` : undefined,
                              borderWidth: isDragOver ? '2px' : '1px'
                            }}
                          >
                            {/* Card Header: Rank Badge & Actions */}
                            <div className="flex justify-between items-center border-b border-black/5 pb-2">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-black text-neutral-900 border border-black/10 shadow-sm"
                                  style={{ 
                                    backgroundColor: colInfo.hex,
                                    boxShadow: `0 0 8px ${colInfo.hex}60`
                                  }}
                                >
                                  {idx + 1}
                                </div>
                                <span className={`text-[9px] font-black uppercase tracking-wider font-mono ${
                                  isHigh ? 'text-emerald-800' : isMedium ? 'text-amber-800' : 'text-red-800'
                                }`}>
                                  {isHigh ? 'Alta Relevância' : isMedium ? 'Média Relevância' : 'Baixa Relevância'}
                                </span>
                              </div>

                              {/* Controls */}
                              <div className="flex items-center gap-1.5" onPointerDown={(e) => e.stopPropagation()}>
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => moveIdeaUp(idx)}
                                  className="text-neutral-600 hover:text-neutral-900 hover:bg-black/5 px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-20"
                                  title="Subir Posição"
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === 19}
                                  onClick={() => moveIdeaDown(idx)}
                                  className="text-neutral-600 hover:text-neutral-900 hover:bg-black/5 px-1.5 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-20"
                                  title="Descer Posição"
                                >
                                  ▼
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteIdea(item.id)}
                                  className="text-neutral-500 hover:text-red-600 hover:bg-red-50 px-1 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer"
                                  title="Limpar Campo"
                                >
                                  ✖
                                </button>
                              </div>
                            </div>

                            {/* Textarea Content */}
                            <div className="pt-2 flex-1">
                              <textarea
                                value={item.text}
                                maxLength={144}
                                onChange={(e) => handleUpdatePostitText(item.id, e.target.value)}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="w-full h-20 bg-transparent text-xs font-semibold text-neutral-800 resize-none outline-none border-none focus:ring-0 leading-relaxed custom-scrollbar placeholder-neutral-500/50"
                                placeholder={`Escreva sua ideia para a posição ${idx + 1}...`}
                              />
                            </div>

                            {/* Footer Area with characters and dynamic color name */}
                            <div className="flex justify-between items-center text-[9px] text-neutral-500 font-mono border-t border-black/5 pt-1.5 mt-1.5">
                              <span>{colInfo.name}</span>
                              <span>{item.text.length}/144</span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Board Watermark */}
                    <div className="absolute bottom-3 right-3 text-[10px] text-white/40 font-bold font-mono pointer-events-none select-none drop-shadow-md">
                      CORTEX FIELD GRID v3.0
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary of Mineração */}
              <div className="p-5 bg-gradient-to-br from-neutral-900 to-neutral-950 text-white rounded-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <h5 className="font-bold text-sm text-white uppercase tracking-tight">
                    Resumo do Processo de Mineração
                  </h5>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#0071e3] font-bold text-xs">
                      Observe o mercado
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      Use Reddit, Trends, YouTube Studio e ferramentas de Outliers para ver o que as pessoas estão buscando e assistindo ativamente.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#ff9f0a] font-bold text-xs">
                      Defina a embalagem primeiro
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      Pense no Packaging-First. Teste se a ideia rende um título intrigante e uma thumbnail que conte a história em 2 segundos.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#bf5af2] font-bold text-xs">
                      Adicione atrito
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      Insira um challenge, obstáculo ou limitação criativa extrema que quebre a mesmice do nicho e eleve a retenção de público.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#30d158] font-bold text-xs">
                      Catalogue tudo
                    </div>
                    <p className="text-[10px] text-neutral-400 leading-relaxed">
                      Salve referências brutas e preencha a Ficha de Mineração no seu Notion/Trello para alimentar seu fluxo constante.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FILTRAGEM */}
          {activeTab === 'filtragem' && (
            <div className="space-y-8 animate-fade-in" id="theory-filtragem-panel">
              {/* Header block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900">FILTRAGEM: O Filtro "YouTube First"</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                      Uma excelente ideia de assunto não serve para nada se não puder ser traduzida em um <strong>Título curto de alto impacto</strong> e uma <strong>Thumbnail limpa de alta legibilidade</strong>. No YouTube, a embalagem dita o clique.
                    </p>
                  </div>
                </div>
              </div>

              {/* O Princípio do Desconforto COMPARISON DASHBOARD */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-neutral-800">
                      O Princípio do Desconforto (Antes vs. Depois)
                    </span>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {['Games', 'True Crime', 'Vlog / Lifestyle', 'Cinema / Ensaio'].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setSelectedUpgradeNiche(n)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                          selectedUpgradeNiche === n 
                            ? 'bg-[#ff9f0a] text-white shadow-xs'
                            : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-100 border border-neutral-200/60'
                        }`}
                      >
                        {n.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  Vídeos mornos e planos geram retenção desastrosa. Veja como a inserção de uma <strong>camada de desconforto, aposta ou limitação criativa extrema</strong> transforma completamente o apelo algorítmico do vídeo:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-1">
                  {/* Boring Concept Card */}
                  <div className="pl-4 border-l-2 border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase tracking-wider">Conceito Tradicional (Fraco)</span>
                      <span className="text-[10px] font-bold text-red-500">
                        CTR Est. ~1.8%
                      </span>
                    </div>
                    <div>
                      <h6 className="font-bold text-xs text-neutral-400 line-through">
                        {selectedUpgradeNiche === 'Games' && "Jogando Dark Souls pela primeira vez até zerar"}
                        {selectedUpgradeNiche === 'True Crime' && "O mistério por trás de um navio antigo abandonado no mar"}
                        {selectedUpgradeNiche === 'Vlog / Lifestyle' && "Viajei nas minhas férias para um hotel no interior"}
                        {selectedUpgradeNiche === 'Cinema / Ensaio' && "Análise técnica das escolhas de roteiro de Interstellar"}
                      </h6>
                      <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                        <strong>Por que falha:</strong> Falta urgência, curiosidade mórbida ou stakes claros. O espectador já viu isso centenas de vezes e não sente atrito ou novidade no título.
                      </p>
                    </div>

                    {/* Progress Bar Simulated CTR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-neutral-400">
                        <span>Taxa de Cliques (CTR)</span>
                        <span>Baixa Competitividade</span>
                      </div>
                      <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-neutral-300 h-full rounded-full transition-all duration-500" style={{ width: '15%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Upgraded Concept Card */}
                  <div className="pl-4 border-l-2 border-[#ff9f0a] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold font-mono text-[#ff9f0a] uppercase tracking-wider">Conceito Packaging-First (Forte)</span>
                      <span className="text-[10px] font-bold text-emerald-500">
                        CTR Est. ~11.5%
                      </span>
                    </div>
                    <div>
                      <h6 className="font-extrabold text-xs text-neutral-900 leading-snug">
                        <span>
                          {selectedUpgradeNiche === 'Games' && "Zerei Dark Souls usando uma bateria de carro real como controle"}
                          {selectedUpgradeNiche === 'True Crime' && "O Navio Fantasma de Luxo que navegou intacto sem tripulação por 50 anos"}
                          {selectedUpgradeNiche === 'Vlog / Lifestyle' && "Passei 24 horas trancado no hotel com a pior avaliação do meu país"}
                          {selectedUpgradeNiche === 'Cinema / Ensaio' && "A trilha sonora oculta de Interstellar que desvendou a física moderna"}
                        </span>
                      </h6>
                      <p className="text-[11px] text-neutral-600 mt-1 leading-relaxed">
                        <strong>O Segredo:</strong> 
                        {selectedUpgradeNiche === 'Games' && " A restrição física extrema gera uma curiosidade automática: como ele vai conseguir apertar os botões com cabos elétricos?"}
                        {selectedUpgradeNiche === 'True Crime' && " A contradição ('intacto' vs 'sem tripulação') cria uma lacuna de informação na cabeça do público, exigindo o clique."}
                        {selectedUpgradeNiche === 'Vlog / Lifestyle' && " O perigo social e o teste de limite físico despertam a curiosidade voyeurista e o entertainment dramático."}
                        {selectedUpgradeNiche === 'Cinema / Ensaio' && " Transforma uma análise abstrata de trilha sonora em uma revelação conspiratória e científica de alto impacto."}
                      </p>
                    </div>

                    {/* Progress Bar Simulated CTR */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-emerald-600">
                        <span>Taxa de Cliques (CTR)</span>
                        <span>Alta Competitividade</span>
                      </div>
                      <div className="w-full bg-neutral-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#ff9f0a] h-full rounded-full transition-all duration-500" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* INTERACTIVE UPGRADE MAKER */}
              <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-4">
                <span className="text-[9px] font-bold font-mono text-[#ff9f0a] uppercase tracking-wider block">
                  Simulador: Transforme sua Ideia Simples em Alto Impacto
                </span>
                <form onSubmit={handleUpgradeIdea} className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-3">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono block mb-1">Nicho do Upgrade</label>
                      <select
                        value={selectedUpgradeNiche}
                        onChange={(e) => setSelectedUpgradeNiche(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#ff9f0a]"
                      >
                        <option value="Games">Games</option>
                        <option value="True Crime">True Crime</option>
                        <option value="Vlog / Lifestyle">Vlog</option>
                        <option value="Cinema / Ensaio">Cinema</option>
                      </select>
                    </div>
                    <div className="md:col-span-9">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono block mb-1">Digite sua ideia simples</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={customBoringIdea}
                          onChange={(e) => setCustomBoringIdea(e.target.value)}
                          placeholder={
                            selectedUpgradeNiche === 'Games' ? "Ex: jogando minecraft novo mod" :
                            selectedUpgradeNiche === 'True Crime' ? "Ex: história de um assassinato famoso" :
                            selectedUpgradeNiche === 'Vlog / Lifestyle' ? "Ex: viajei de mochila na europa" :
                            "Ex: explicando o filme inception do nolan"
                          }
                          className="flex-1 bg-white border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff9f0a]"
                        />
                        <button
                          type="submit"
                          className="bg-[#ff9f0a] hover:bg-[#ff9f0a]/90 text-white px-4 py-2 rounded-lg text-xs font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          Transformar Embalagem
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                <AnimatePresence>
                  {hasUpgraded && customUpgradedIdea && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-2 text-emerald-800">
                        <span className="text-[10px] font-extrabold uppercase font-mono">Ideia Re-Embalada com Sucesso!</span>
                      </div>
                      <p className="text-xs text-neutral-800 font-extrabold leading-snug">
                        “{customUpgradedIdea}”
                      </p>
                      <p className="text-[10px] text-neutral-500">
                        ✓ O título gerado possui os ganchos necessários e foi <strong>automaticamente injetado</strong> no Simulador de Feed do YouTube abaixo para testes visuais!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* YOUTUBE CARD SANDBOX (LIVE PREVIEWER) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
                
                {/* Left Column Controls */}
                <div className="lg:col-span-5 space-y-4 bg-white p-4 rounded-2xl border border-neutral-200">
                  <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase block tracking-wider">
                    CONTROLES DO SIMULADOR DE EMBALAGEM
                  </span>

                  {/* Sandbox Title */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono">Título do Vídeo (Máx. 50 Chars recomendável)</label>
                      <span className={`text-[9px] font-mono font-bold ${sandboxTitle.length > 50 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {sandboxTitle.length} Chars
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={sandboxTitle}
                      onChange={(e) => setSandboxTitle(e.target.value)}
                      placeholder="Insira o título magnético do seu vídeo..."
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs font-bold text-neutral-800 focus:outline-none focus:ring-1 focus:ring-[#0071e3] resize-none"
                    />
                    {sandboxTitle.length > 50 ? (
                      <p className="text-[9px] text-amber-600 leading-snug flex items-center gap-1">
                        Título será cortado em telas menores de celulares! Tente resumir a promessa.
                      </p>
                    ) : (
                      <p className="text-[9px] text-emerald-600 leading-snug flex items-center gap-1">
                        Excelente comprimento para visibilidade perfeita no feed mobile.
                      </p>
                    )}
                  </div>

                  {/* Select Thumbnail Background Style */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono block">Cenário da Thumbnail</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'games', label: 'Jogos', color: 'from-purple-900 to-indigo-950' },
                        { id: 'crime', label: 'True Crime', color: 'from-neutral-900 to-red-950/40' },
                        { id: 'vlog', label: 'Vlog', color: 'from-amber-100 to-amber-900/10' },
                        { id: 'cinema', label: 'Cinema', color: 'from-blue-900 to-black' }
                      ].map(style => (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => setSandboxThumbBg(style.id)}
                          className={`p-2 rounded-lg text-left text-[10px] font-bold border transition-all cursor-pointer ${
                            sandboxThumbBg === style.id 
                              ? 'border-neutral-900 bg-white shadow-xs' 
                              : 'border-neutral-200 hover:bg-neutral-100 bg-neutral-50 text-neutral-500'
                          }`}
                        >
                          <div className={`w-full h-3 rounded bg-gradient-to-r ${style.color} mb-1`} />
                          {style.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Select Overlay Element */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono block">Elemento Visual da Thumbnail</label>
                    <select
                      value={sandboxOverlay}
                      onChange={(e) => setSandboxOverlay(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff9f0a]"
                    >
                      <option value="none">Nenhum elemento extra (Visual limpo)</option>
                      <option value="red_arrow_circle">Setas e Círculos Vermelhos (Clássico)</option>
                      <option value="huge_question">Ponto de Interrogação Brilhante (Mistério)</option>
                      <option value="warning_sign">Tarja de Perigo / Warning (Alerta)</option>
                      <option value="crying_face">Emoji de Choro / Choque (Emocional)</option>
                    </select>
                  </div>

                  {/* Config Visualizações e Tempo */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono block">Visualizações</label>
                      <select
                        value={sandboxViews}
                        onChange={(e) => setSandboxViews(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-xs focus:outline-none"
                      >
                        <option value="12 mil visualizações">12 mil</option>
                        <option value="142 mil visualizações">142 mil</option>
                        <option value="450 mil visualizações">450 mil</option>
                        <option value="1,2 milhão de visualizações">1,2 milhão</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono block">Tempo de Publicado</label>
                      <select
                        value={sandboxPublished}
                        onChange={(e) => setSandboxPublished(e.target.value)}
                        className="w-full bg-white border border-neutral-200 rounded-lg p-1.5 text-xs focus:outline-none"
                      >
                        <option value="há 2 horas">há 2 horas</option>
                        <option value="há 1 dia">há 1 dia</option>
                        <option value="há 2 dias">há 2 dias</option>
                        <option value="há 1 semana">há 1 semana</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column YouTube Card Mockup */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase tracking-wider">
                      VISUALIZAÇÃO DE FEED DO YOUTUBE (SIMULAÇÃO REAL)
                    </span>
                    <span className="text-[9px] text-neutral-500 font-medium">
                      Est. CTR: <strong className="text-[#ff9f0a]">{sandboxTitle.length > 50 ? "8.2%" : "12.4%"}</strong> (Excelente)
                    </span>
                  </div>

                  {/* YouTube Card Mockup Box */}
                  <div className="border border-neutral-200/60 rounded-2xl overflow-hidden p-6 flex items-center justify-center bg-white">
                    <div className="w-full max-w-sm bg-white rounded-xl overflow-hidden shadow-md border border-neutral-200/40 relative group">
                      
                      {/* Video Thumbnail Box */}
                      <div className="aspect-video w-full relative overflow-hidden bg-neutral-900 select-none">
                        
                        {/* Simulated Background Graphic */}
                        {sandboxThumbBg === 'games' && (
                          <div className="w-full h-full bg-gradient-to-br from-purple-900 via-indigo-950 to-neutral-950 flex flex-col items-center justify-center p-4 relative">
                            <span className="text-[28px] font-extrabold text-white tracking-widest opacity-25">MINECRAFT</span>
                            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80" />
                            <div className="absolute bottom-3 left-3 bg-red-600/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                              MOD EXTREMO
                            </div>
                          </div>
                        )}

                        {sandboxThumbBg === 'crime' && (
                          <div className="w-full h-full bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-950/40 flex flex-col items-center justify-center p-4 relative">
                            <span className="text-[28px] font-extrabold text-red-700 tracking-widest opacity-25 uppercase font-mono">CONFIDENCIAL</span>
                            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/90" />
                            <div className="absolute top-2 left-2 flex gap-1">
                              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                              <span className="text-[7px] text-red-500 font-bold uppercase font-mono">EVIDÊNCIA #124</span>
                            </div>
                          </div>
                        )}

                        {sandboxThumbBg === 'vlog' && (
                          <div className="w-full h-full bg-gradient-to-br from-amber-500/20 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center p-4 relative">
                            <span className="text-[28px] font-extrabold text-amber-500 tracking-widest opacity-25 uppercase font-sans">DESAFIO 24H</span>
                            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/80" />
                            <div className="absolute bottom-3 left-3 bg-amber-500 text-neutral-950 text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase font-sans tracking-wide">
                              NÃO ABRA A PORTA
                            </div>
                          </div>
                        )}

                        {sandboxThumbBg === 'cinema' && (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-neutral-950 to-black flex flex-col items-center justify-center p-4 relative">
                            <span className="text-[28px] font-extrabold text-indigo-400 tracking-widest opacity-20 uppercase font-sans">FILM ESSAY</span>
                            <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/85" />
                            <div className="absolute top-3 left-3 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase font-mono">
                              O SEGREDO DA CENA
                            </div>
                          </div>
                        )}

                        {/* Overlay elements */}
                        {sandboxOverlay === 'red_arrow_circle' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            {/* Circle */}
                            <div className="w-16 h-16 rounded-full border-4 border-red-600 animate-pulse flex items-center justify-center absolute left-[25%] top-[15%]">
                              <span className="w-2 h-2 bg-red-600 rounded-full" />
                            </div>
                            {/* Arrow */}
                            <div className="absolute right-[25%] bottom-[20%] text-red-600 scale-x-[-1] rotate-[35deg] animate-bounce text-4xl font-extrabold font-sans">
                              ➜
                            </div>
                          </div>
                        )}

                        {sandboxOverlay === 'huge_question' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                            <span className="text-6xl font-extrabold text-yellow-400 font-mono drop-shadow-[0_4px_12px_rgba(234,179,8,0.6)] animate-pulse">
                              ?
                            </span>
                          </div>
                        )}

                        {sandboxOverlay === 'warning_sign' && (
                          <div className="absolute top-4 right-4 bg-yellow-500 text-neutral-950 text-[9px] font-extrabold px-2.5 py-1 rounded-md border border-yellow-300 flex items-center gap-1 shadow-md pointer-events-none z-10 animate-pulse">
                            WARNING: 100% REAL
                          </div>
                        )}

                        {sandboxOverlay === 'crying_face' && (
                          <div className="absolute right-6 top-[20%] bg-red-600 text-white font-black text-xs px-2 py-1 rounded uppercase tracking-wider shadow-lg animate-pulse z-10">
                            REVELADO
                          </div>
                        )}

                        {/* Duration Badge */}
                        <div className="absolute bottom-2 right-2 bg-black/85 text-white font-mono font-bold text-[9px] px-1 rounded-sm">
                          12:34
                        </div>

                        {/* Hover Overlay Interactive button */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <button
                            type="button"
                            onClick={handleSimulateClick}
                            className="bg-[#0071e3] hover:bg-[#0071e3]/90 text-white text-[11px] font-extrabold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5 active:scale-95 border-none"
                          >
                            Simular Clique!
                          </button>
                        </div>
                      </div>

                      {/* Video Info Details */}
                      <div className="p-3 flex gap-3 bg-white">
                        {/* Verified Avatar */}
                        <div className="w-9 h-9 rounded-full bg-neutral-200 shrink-0 relative overflow-hidden flex items-center justify-center font-bold text-xs text-neutral-500 uppercase border border-neutral-200">
                          {sandboxThumbBg === 'games' && "G"}
                          {sandboxThumbBg === 'crime' && "C"}
                          {sandboxThumbBg === 'vlog' && "V"}
                          {sandboxThumbBg === 'cinema' && "M"}
                          <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full" />
                          </div>
                        </div>

                        {/* Text details */}
                        <div className="space-y-1">
                          <h6 className="font-extrabold text-xs text-neutral-950 leading-snug line-clamp-2 pr-2">
                            {sandboxTitle || "Digite o título acima para simular..."}
                          </h6>
                          <div className="text-[10px] text-neutral-500">
                            <div className="flex items-center gap-1 font-semibold hover:text-neutral-900 transition-colors cursor-pointer">
                              Canal Criativo Oficial
                              <span className="w-3 h-3 rounded-full bg-neutral-400 text-white flex items-center justify-center text-[7px] font-bold">✓</span>
                            </div>
                            <p className="mt-0.5">
                              {sandboxViews} • {sandboxPublished}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* CTR Confetti Alert */}
                      <AnimatePresence>
                        {isClickSuccess && (
                          <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            className="absolute inset-x-2 bottom-2 bg-emerald-600 text-white p-2.5 rounded-lg text-center font-mono font-bold text-[10px] leading-relaxed flex items-center justify-center gap-1.5 shadow-lg z-20"
                          >
                            <span>✓ CLIQUE COMPUTADO! Est. CTR: {(sandboxTitle.length > 50 ? 8.2 : 12.4).toFixed(1)}% (+{clickSimulatedCount} cliques no teste)</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  </div>
                  <p className="text-[10px] text-neutral-500 text-center italic leading-relaxed">
                    Aproxime o mouse da thumbnail acima e clique em "Simular Clique!" para avaliar a resposta algorítmica simulada da sua embalagem no feed do YouTube.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: MOODBOARD & POST-ITS */}
          {activeTab === 'moodboard' && (
            <div className="space-y-8 animate-fade-in" id="theory-moodboard-panel">
              {/* Header block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900">MOODBOARD & POST-ITS: Estrutura & Sequência</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                      O tom estético e a ordem cronológica das cenas determinam se o espectador vai assistir até o final. O <strong>Moodboard</strong> fixa a identidade visual. O <strong>Método dos Post-its</strong> organiza a linha narrativa para reter a atenção a cada segundo.
                    </p>
                  </div>
                </div>
              </div>

              {/* STICKY NOTES MIRO-STYLE CANVAS WORKSPACE */}
              <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-5">
                
                {/* Controller Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-neutral-200/60 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold font-mono text-[#bf5af2] uppercase tracking-wider block">
                      CANVAS INTERATIVO DE POST-ITS (ESTILO MIRO)
                    </span>
                    <p className="text-[10px] text-neutral-500">Ordene, edite e estruture o roteiro do seu vídeo em blocos rítmicos</p>
                  </div>
                  
                  {/* Preset quick buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[9px] font-bold text-neutral-400 font-mono uppercase">Carregar Preset:</span>
                    {['Games', 'True Crime', 'Vlog / Lifestyle', 'Cinema / Ensaio'].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => applyPostitPreset(n)}
                        className={`px-2 py-0.5 text-[9px] font-bold rounded transition-all cursor-pointer ${
                          postitNichePreset === n 
                            ? 'bg-[#bf5af2] text-white shadow-xs'
                            : 'bg-white text-neutral-500 hover:bg-neutral-100 border border-neutral-200'
                        }`}
                      >
                        {n.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* The Timeline Flow view */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-2">
                  <AnimatePresence mode="popLayout">
                    {postitList.map((post, idx) => {
                      let colorClass = 'bg-yellow-50 border-yellow-200 text-yellow-800';
                      let pinColor = 'bg-yellow-400';
                      if (post.type === 'green') {
                        colorClass = 'bg-green-50 border-green-200 text-green-800';
                        pinColor = 'bg-green-400';
                      } else if (post.type === 'blue') {
                        colorClass = 'bg-blue-50 border-blue-200 text-blue-800';
                        pinColor = 'bg-blue-400';
                      } else if (post.type === 'red') {
                        colorClass = 'bg-red-50 border-red-200 text-red-800';
                        pinColor = 'bg-red-400';
                      } else if (post.type === 'purple') {
                        colorClass = 'bg-purple-50 border-purple-200 text-purple-800';
                        pinColor = 'bg-purple-400';
                      }

                      const isEditing = editingPostItId === post.id;

                      return (
                        <motion.div
                          key={post.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className={`p-4 rounded-xl border relative shadow-xs hover:shadow-md transition-all space-y-2.5 overflow-hidden flex flex-col justify-between min-h-[160px] ${colorClass}`}
                        >
                          {/* Pin visual */}
                          <div className={`absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full ${pinColor}`} />

                          {/* Index indicator */}
                          <span className="text-[8px] font-bold font-mono text-neutral-400 block uppercase">
                            Bloco #{idx + 1}
                          </span>

                          <div className="space-y-1">
                            <h6 className="font-extrabold text-[10px] tracking-tight uppercase">
                              {post.title}
                            </h6>

                            {isEditing ? (
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full bg-white text-neutral-900 border border-neutral-300 rounded p-1 text-[10px] focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
                                rows={4}
                              />
                            ) : (
                              <p className="text-[10px] text-neutral-700 leading-relaxed line-clamp-5">
                                {post.desc}
                              </p>
                            )}
                          </div>

                          {/* Footer of post-it */}
                          <div className="flex items-center justify-between pt-1 border-t border-black/5">
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingDuration}
                                  onChange={(e) => setEditingDuration(e.target.value)}
                                  className="w-10 bg-white text-neutral-900 border border-neutral-300 rounded text-[9px] p-0.5 text-center font-bold"
                                />
                              ) : (
                                <span className="text-[9px] font-bold font-mono opacity-80">Duração: {post.duration || '30s'}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {isEditing ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updatePostitText(post.id, editingText);
                                    updatePostitDuration(post.id, editingDuration);
                                    setEditingPostItId(null);
                                  }}
                                  className="text-[9px] font-extrabold bg-neutral-900 text-white px-1.5 py-0.5 rounded cursor-pointer transition-all border-none"
                                >
                                  Salvar
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingPostItId(post.id);
                                      setEditingText(post.desc);
                                      setEditingDuration(post.duration || '30s');
                                    }}
                                    className="text-[8px] font-bold hover:underline cursor-pointer opacity-70"
                                  >
                                    Editar
                                  </button>
                                  {/* Delete only if not the only one */}
                                  {postitList.length > 2 && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeletePostit(post.id)}
                                      className="text-[8px] font-bold text-red-600 hover:underline cursor-pointer"
                                    >
                                      Excluir
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Add new sticky note action panel */}
                <div className="flex items-center justify-between gap-4 p-3 bg-white rounded-xl border border-neutral-200">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-600 font-mono uppercase">Inserir Novo Bloco:</span>
                    <div className="flex gap-1.5">
                      {[
                        { type: 'yellow', label: 'Hook' },
                        { type: 'green', label: 'Contexto' },
                        { type: 'blue', label: 'Ação' },
                        { type: 'red', label: 'Clímax' },
                        { type: 'purple', label: 'CTA' }
                      ].map(btn => (
                        <button
                          key={btn.type}
                          type="button"
                          onClick={() => handleAddPostit(btn.type as any)}
                          className="px-2 py-0.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded text-[10px] font-medium transition-all cursor-pointer active:scale-95"
                        >
                          + {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] text-neutral-400 font-medium hidden sm:inline">
                    ✓ Total de blocos na timeline: <strong>{postitList.length}</strong>
                  </span>
                </div>

                {/* PACING & RETENTION RISK EVALUATOR METER */}
                <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase font-mono text-neutral-700">Analista de Retenção e Ritmo (Pacing Meter)</span>
                    </div>
                    <span className="text-[10px] font-bold text-neutral-500 font-mono">
                      Pontuação de Ritmo: {postitList.filter(p => p.type === 'blue').length >= 2 ? "100/100" : "50/100"}
                    </span>
                  </div>

                  {/* Meter logic visually */}
                  <div className="space-y-3">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                      <div className="flex-1 w-full space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-neutral-500">
                          <span>Velocidade de Narrativa (BPM do Vídeo)</span>
                          <span className="text-emerald-600 font-bold">
                            {postitList.filter(p => p.type === 'blue').length >= 3 ? "Dinâmico / Altíssimo Impacto" : "Equilibrado / Estável"}
                          </span>
                        </div>
                        <div className="w-full bg-neutral-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#bf5af2] h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.min(100, postitList.length * 16.6)}%` }} 
                          />
                        </div>
                      </div>

                      <div className="bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-100 text-[10px] leading-relaxed max-w-sm shrink-0">
                        <span>
                          {postitList.filter(p => p.type === 'blue').length >= 2 
                            ? "✓ Pacing Perfeito: Seus blocos azuis garantem mini-recompensas a cada 2 minutos, mantendo a curva de retenção estável no gráfico do YouTube Studio."
                            : "⚠ Atenção: Você possui menos de 2 blocos de ação intermediários. Risco de queda brusca de audiência no meio do vídeo por tédio."
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: FICHA DE PRODUÇÃO */}
          {activeTab === 'ficha' && (
            <div className="space-y-8 animate-fade-in" id="theory-ficha-panel">
              {/* Header block */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-100 pb-5">
                <div className="flex items-start gap-4">
                  <div>
                    <h4 className="text-lg font-bold text-neutral-900">FICHA DE VALIDAÇÃO: Pronto para Gravar</h4>
                    <p className="text-sm text-neutral-500 leading-relaxed mt-1">
                      Preencher a Ficha de Validação antes de ligar a câmera impede roteiros sem ganchos visuais ou que descumprem a promessa da capa. O simulador de set abaixo analisa todas as decisões tomadas nas abas anteriores.
                    </p>
                  </div>
                </div>
              </div>

              {/* INTEGRATED DYNAMIC AUTO-VALIDATION SCORECARD */}
              <div className="p-5 rounded-2xl border border-neutral-200 bg-white space-y-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-neutral-200 pb-3">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider block font-mono">
                    SIMULADOR DE SET DE GRAVAÇÃO (VALIDADOR DYNAMIC)
                  </span>
                  <button
                    type="button"
                    onClick={evaluateFichaScore}
                    className="bg-neutral-900 hover:bg-neutral-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer border-none"
                  >
                    Analisar Estrutura Completa
                  </button>
                </div>

                {scoreReport ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-5"
                  >
                    {/* Score panel display */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-5 bg-white rounded-xl border border-neutral-200">
                      <div className="md:col-span-4 text-center space-y-1 py-2 border-b md:border-b-0 md:border-r border-neutral-150">
                        <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase">SCORE DE AUDIÊNCIA</span>
                        <h2 className="text-4xl font-extrabold text-neutral-900 font-mono tracking-tighter">
                          {scoreReport.score}%
                        </h2>
                        <span className="text-[10px] font-extrabold text-[#30d158] block uppercase">
                          {scoreReport.level}
                        </span>
                      </div>

                      <div className="md:col-span-8 p-1.5 space-y-2">
                        <h6 className="font-bold text-xs text-neutral-800">Checklist e Recomendações dos Especialistas:</h6>
                        <div className="space-y-1 text-[10px] text-neutral-600">
                          {scoreReport.feedback.map((fb, idx) => (
                            <p key={idx} className="leading-relaxed flex items-start gap-1">
                              <span>•</span>
                              <span>{fb}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Exporter Markdown code box */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-bold font-mono text-neutral-400 uppercase tracking-wider">
                          TEMPLATE DE PRODUÇÃO GERADO PARA O NOTION / TRELLO (MARKDOWN)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            const markdown = `# FICHA DE PRODUÇÃO: ${sandboxTitle}
 
## DADOS DE EMBALAGEM (PACKAGING)
* **Nicho:** ${selectedUpgradeNiche}
* **Título Escolhido:** ${sandboxTitle}
* **Thumbnail Layout:** ${sandboxThumbBg} com overlay de ${sandboxOverlay}
* **CTR Potencial Estimado:** ${sandboxTitle.length > 50 ? "8.2%" : "12.4%"}
 
## LIMITAÇÕES & REQUISITOS
* **Limitação Criativa:** ${fichaData.limitação || "Nenhuma limitação cadastrada"}
* **Risco / Desconforto:** ${fichaData.desconforto || "Pacing de restrição de tempo real"}
 
## SEQUÊNCIA DE POST-ITS NARRATIVOS (TIMELINE)
${postitList.map((p, idx) => `${idx + 1}. **${p.title}** [${p.duration}]: ${p.desc}`).join('\n')}
`;
                            navigator.clipboard.writeText(markdown).then(() => {
                              setCopiedNotion(true);
                              setTimeout(() => setCopiedNotion(false), 3000);
                            });
                          }}
                          className={`px-2.5 py-1 rounded text-[9px] font-bold cursor-pointer transition-all border-none ${
                            copiedNotion 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-neutral-200 hover:bg-neutral-300 text-neutral-700'
                          }`}
                        >
                          {copiedNotion ? "✓ Copiado!" : "Copiar para Notion"}
                        </button>
                      </div>

                      <div className="bg-neutral-900 text-neutral-200 p-4 rounded-xl font-mono text-[10px] leading-relaxed overflow-x-auto max-h-[300px] border border-neutral-800">
                        <pre className="whitespace-pre-wrap select-all">
{`# FICHA DE PRODUÇÃO: ${sandboxTitle}
 
## DADOS DE EMBALAGEM (PACKAGING)
* **Nicho:** ${selectedUpgradeNiche}
* **Título Escolhido:** ${sandboxTitle}
* **Thumbnail Layout:** ${sandboxThumbBg} com overlay de ${sandboxOverlay}
* **CTR Potencial Estimado:** ${sandboxTitle.length > 50 ? "8.2%" : "12.4%"}
 
## LIMITAÇÕES & REQUISITOS
* **Limitação Criativa:** ${fichaData.limitação || "Nenhuma limitação cadastrada (defina no formulário abaixo)"}
 
## SEQUÊNCIA DE POST-ITS NARRATIVOS (TIMELINE)
${postitList.map((p, idx) => `${idx + 1}. **${p.title}** [${p.duration}]: ${p.desc}`).join('\n')}`}
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-8 text-center text-neutral-400 space-y-2">
                    <p className="text-xs">Clique no botão superior "Analisar Estrutura Completa" para validar os seus dados coletados e obter seu score de retenção algorítmica.</p>
                  </div>
                )}

                {/* Form fields editor inline */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-neutral-200">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono">
                      Limitação Criativa Estabelecida
                    </label>
                    <input
                      type="text"
                      value={fichaData.limitação}
                      onChange={(e) => handleFichaChange('limitação', e.target.value)}
                      placeholder="Ex: Proibido usar itens de cura / Proibido falar gírias..."
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#30d158]"
                    />
                    <p className="text-[9px] text-neutral-400 leading-snug">
                      Defina um obstáculo severo para criar o clímax dramático no seu vídeo.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-600 uppercase font-mono">
                      Gatilho de Desconforto / Stakes em Risco
                    </label>
                    <input
                      type="text"
                      value={fichaData.desconforto}
                      onChange={(e) => handleFichaChange('desconforto', e.target.value)}
                      placeholder="Ex: Se eu perder o boss, terei que deletar o save de 200 horas..."
                      className="w-full bg-white border border-neutral-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#30d158]"
                    />
                    <p className="text-[9px] text-neutral-400 leading-snug">
                      O que está em risco caso o criador não atinja o objetivo estabelecido?
                    </p>
                  </div>
                </div>

              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-200/60 mt-8">
        <button
          type="button"
          disabled={currentTabIdx === 0}
          onClick={handlePrevTab}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentTabIdx === 0
              ? 'text-neutral-300 bg-neutral-50/50 border border-neutral-100 cursor-not-allowed'
              : 'text-neutral-700 hover:bg-neutral-50 bg-white border border-neutral-200'
          }`}
        >
          &larr; Etapa Anterior
        </button>
        
        {/* Simple step indicator dots */}
        <div className="flex gap-2">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                activeTab === tab.id ? 'bg-[#0071e3] scale-125' : 'bg-neutral-300 hover:bg-neutral-400'
              }`}
              title={tab.title}
            />
          ))}
        </div>

        <button
          type="button"
          disabled={currentTabIdx === tabs.length - 1}
          onClick={handleNextTab}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            currentTabIdx === tabs.length - 1
              ? 'text-neutral-300 bg-neutral-50/50 border border-neutral-100 cursor-not-allowed'
              : 'bg-neutral-900 text-white hover:bg-neutral-800'
          }`}
        >
          Próxima Etapa &rarr;
        </button>
      </div>

    </div>
  );
}
