import React, { useState } from 'react';

interface Asset {
  name: string;
  category: 'Trilhas' | 'SFX' | 'B-Roll' | 'CTAs';
  source: string;
  url: string;
  description: string;
  suggestedSearch: string;
}

const ASSET_CATALOG: Asset[] = [
  {
    name: 'YouTube Audio Library',
    category: 'Trilhas',
    source: 'Oficial do YouTube',
    url: 'https://studio.youtube.com/',
    description: 'A fonte oficial e mais segura para canais monetizados. Trilhas divididas por gênero e humor.',
    suggestedSearch: 'Pesquise por humor "Inspiring" ou "Cinematic" para canais de tecnologia.'
  },
  {
    name: 'Free Music Archive',
    category: 'Trilhas',
    source: 'FMA Community',
    url: 'https://freemusicarchive.org/',
    description: 'Milhares de faixas instrumentais de produtores independentes sob licença Creative Commons.',
    suggestedSearch: 'Filtre por licenças CC-BY para uso comercial simples.'
  },
  {
    name: 'Incompetech',
    category: 'Trilhas',
    source: 'Kevin MacLeod',
    url: 'https://incompetech.com/',
    description: 'A biblioteca do criador Kevin MacLeod, cujas músicas embalaram a história do YouTube.',
    suggestedSearch: 'Trilhas ideais para fundos cômicos ou mistério.'
  },
  {
    name: 'Freesound.org',
    category: 'SFX',
    source: 'Colaborativa',
    url: 'https://freesound.org/',
    description: 'O maior banco de efeitos sonoros brutos do mundo. Excelente para impactos e foley.',
    suggestedSearch: 'Procure por "woosh", "cinematic transition", "camera shutter".'
  },
  {
    name: 'Mixkit Sound Effects',
    category: 'SFX',
    source: 'Envato',
    url: 'https://mixkit.co/free-sound-effects/',
    description: 'Efeitos sonoros limpos, masterizados e prontos para uso em comerciais e vlogs.',
    suggestedSearch: 'Procure por "mouse click", "pop bubble", "paper tear".'
  },
  {
    name: 'Pexels Video',
    category: 'B-Roll',
    source: 'Pexels Co.',
    url: 'https://www.pexels.com/videos/',
    description: 'Clipes curtos de alta qualidade (HD/4K) ideais para ilustrar tópicos de tecnologia e estilo de vida.',
    suggestedSearch: 'Procure por "cyberpunk coding", "man drinking coffee", "cinematic nature".'
  },
  {
    name: 'Pixabay Video',
    category: 'B-Roll',
    source: 'Pixabay Community',
    url: 'https://pixabay.com/videos/',
    description: 'Excelente catálogo com filtros avançados de resolução e categorias para vídeos de cobertura.',
    suggestedSearch: 'Busque por "time-lapse office", "aerial city lights".'
  },
  {
    name: 'Mixkit Video B-Roll',
    category: 'B-Roll',
    source: 'Envato',
    url: 'https://mixkit.co/free-stock-video/',
    description: 'Banco de vídeos gratuitos de altíssimo nível estético, perfeito para cortes de apoio dinâmicos.',
    suggestedSearch: 'Busque por "green screen green screen subscribers", "minimal desk setup".'
  },
  {
    name: 'Canva Desktop overlays',
    category: 'CTAs',
    source: 'Canva Pro/Free',
    url: 'https://www.canva.com/',
    description: 'Criação de botões transparentes de inscrição, sininho de notificações e redes sociais em PNG.',
    suggestedSearch: 'Pesquise templates por "YouTube Subscribe CTA Transparent".'
  },
  {
    name: 'CapCut Desktop Assets',
    category: 'CTAs',
    source: 'Bytedance',
    url: 'https://www.capcut.com/',
    description: 'Templates prontos com animações de curtidas, adesivos dinâmicos e legendas automáticas gratuitas.',
    suggestedSearch: 'Abra a aba "Adesivos" -> "YouTube" dentro do painel do CapCut Desktop.'
  }
];

export default function AceleracaoManager() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Trilhas' | 'SFX' | 'B-Roll' | 'CTAs'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredAssets = ASSET_CATALOG.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          asset.suggestedSearch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" id="aceleracao-manager-container">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h4 className="text-lg font-medium text-white tracking-tight" id="accel-title">Kit de Aceleração do Criador</h4>
          <p className="text-xs text-neutral-400">Banco de recursos sem direitos autorais e ferramentas para acelerar suas produções.</p>
        </div>
        <div className="flex flex-wrap gap-1.5 glass-light p-1 rounded-lg" id="accel-filters">
          {(['All', 'Trilhas', 'SFX', 'B-Roll', 'CTAs'] as const).map(cat => (
            <button
              key={cat}
              id={`filter-btn-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                selectedCategory === cat 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat === 'All' ? 'Todos' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative" id="accel-search-wrapper">
        <input
          id="accel-search-input"
          type="text"
          placeholder="Pesquisar por ferramentas, palavras-chave ou plataformas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm text-white placeholder-neutral-500 glass-input rounded-xl"
        />
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="assets-grid-layout">
        {filteredAssets.map((asset, index) => (
          <div 
            key={asset.name} 
            id={`asset-card-${index}`}
            className="group relative flex flex-col justify-between p-4 rounded-xl bg-neutral-900/40 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/60 transition-all duration-300 backdrop-blur-md"
          >
            <div>
              {/* Header */}
              <div className="flex justify-between items-start mb-2" id={`asset-header-${index}`}>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${
                    asset.category === 'Trilhas' ? 'bg-amber-500/10 text-amber-400' :
                    asset.category === 'SFX' ? 'bg-indigo-500/10 text-indigo-400' :
                    asset.category === 'B-Roll' ? 'bg-emerald-500/10 text-emerald-400' :
                    'bg-pink-500/10 text-pink-400'
                  }`} id={`asset-badge-wrapper-${index}`}>
                    {asset.category === 'Trilhas' && <span className="text-[10px] font-bold">T</span>}
                    {asset.category === 'SFX' && <span className="text-[10px] font-bold">S</span>}
                    {asset.category === 'B-Roll' && <span className="text-[10px] font-bold">B</span>}
                    {asset.category === 'CTAs' && <span className="text-[10px] font-bold">C</span>}
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{asset.category}</span>
                    <h5 className="text-sm font-semibold text-white tracking-tight">{asset.name}</h5>
                  </div>
                </div>
                <span className="text-[10px] bg-white/5 text-neutral-400 px-2 py-0.5 rounded-full border border-white/5 font-mono">{asset.source}</span>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-400 leading-relaxed mb-4">{asset.description}</p>

              {/* Suggested Search Cue */}
              <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 mb-4" id={`suggested-box-${index}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest">Busca Recomendada:</span>
                  <button 
                    id={`copy-search-btn-${index}`}
                    onClick={() => handleCopy(asset.suggestedSearch, `${asset.name}-search`)}
                    className="text-neutral-500 hover:text-white transition-colors"
                    title="Copiar termo sugerido"
                  >
                    {copiedId === `${asset.name}-search` ? <span className="text-xs text-green-400">Copiado</span> : <span className="text-xs">Copiar</span>}
                  </button>
                </div>
                <p className="text-xs text-neutral-300 font-mono italic select-all">"{asset.suggestedSearch}"</p>
              </div>
            </div>

            {/* Action Footer */}
            <div className="flex gap-2 mt-2 pt-2 border-t border-white/5" id={`asset-footer-actions-${index}`}>
              <a
                id={`asset-link-${index}`}
                href={asset.url}
                target="_blank"
                rel="noreferrer referrer"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/10 hover:bg-white text-white hover:text-black transition-all text-xs font-medium"
              >
                Acessar Plataforma
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
