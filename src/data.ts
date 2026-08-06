import { CourseModule } from './types';
import { intro1 } from './data/lessons/intro-1';
import { intro2 } from './data/lessons/intro-2';
import { mod1_1 } from './data/lessons/mod1-1';
import { mod1_2 } from './data/lessons/mod1-2';
import { mod1_3 } from './data/lessons/mod1-3';
import { mod2_1 } from './data/lessons/mod2-1';
import { mod2_2 } from './data/lessons/mod2-2';
import { mod2_3 } from './data/lessons/mod2-3';
import { mod3_1 } from './data/lessons/mod3-1';
import { mod3_2 } from './data/lessons/mod3-2';
import { mod4_1 } from './data/lessons/mod4-1';
import { mod4_2 } from './data/lessons/mod4-2';
import { mod5_1 } from './data/lessons/mod5-1';
import { mod5_2 } from './data/lessons/mod5-2';
import { mod6_1 } from './data/lessons/mod6-1';
import { mod6_2 } from './data/lessons/mod6-2';
import { mod7_1 } from './data/lessons/mod7-1';
import { mod7_2 } from './data/lessons/mod7-2';
import { mod8_1 } from './data/lessons/mod8-1';
import { mod9_1 } from './data/lessons/mod9-1';
import { mod9_2 } from './data/lessons/mod9-2';
import { mod9_3 } from './data/lessons/mod9-3';

export const modulesData: CourseModule[] = [
  {
    id: 'intro',
    title: 'Introdução',
    subtitle: 'Introdução e Ferramentas Gratuitas',
    badge: 'START',
    iconName: 'Compass',
    subtopics: [intro1, intro2],
    challenges: [
      {
        id: 'challenge-intro',
        title: 'Desafio de Kickoff: Seu Kit de Produção',
        description: 'Mapeie as ferramentas gratuitas que você usará e planeje seus primeiros downloads para criar sua pasta base de recursos (B-Roll, SFX e CTAs).',
        placeholder: 'Defina seu plano de kickoff do kit...',
        fields: [
          {
            label: 'Nicho do seu Canal',
            key: 'channel_niche',
            type: 'text'
          },
          {
            label: 'Link de uma Trilha de Referência (YouTube Library)',
            key: 'ref_track',
            type: 'text'
          },
          {
            label: 'Pasta Local Criada e Organizada?',
            key: 'folder_ready',
            type: 'select',
            options: ['Sim, separada por SFX/Música/B-Roll', 'Ainda criando', 'Não comecei']
          },
          {
            label: 'Plano de Busca de B-Roll (Qual tema de vídeo?)',
            key: 'broll_theme',
            type: 'textarea'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'intro-chk-1', task: 'Mapear 3 canais concorrentes ou referências de nicho', category: 'Estratégia' },
      { id: 'intro-chk-2', task: 'Criar uma pasta local de Assets (Música, SFX, Overlay, B-Roll)', category: 'Organização' },
      { id: 'intro-chk-3', task: 'Selecionar pelo menos 5 efeitos sonoros (SFX) essenciais (woosh, pop, click)', category: 'Áudio' },
      { id: 'intro-chk-4', task: 'Escolher e favoritar 3 trilhas livres na YouTube Audio Library', category: 'Áudio' }
    ]
  },
  {
    id: 'mod1',
    title: 'MÓDULO 01: A Ideia',
    subtitle: 'A Alma do Vídeo',
    badge: 'MÓDULO 01',
    iconName: 'BookOpen',
    subtopics: [mod1_1, mod1_2, mod1_3],
    challenges: [
      {
        id: 'challenge-mod1',
        title: 'Desafio Prático: Roteirizando o Gancho (Hook)',
        description: 'Escreva um Gancho de 15 segundos para seu próximo vídeo aplicando a Teoria dos Anzóis. Deve conter uma promessa inegável e um gancho visual.',
        placeholder: 'Escreva seu roteiro aqui...',
        fields: [
          {
            label: 'Tema do Vídeo',
            key: 'video_topic',
            type: 'text'
          },
          {
            label: 'Gancho Falado (O que você vai dizer nos primeiros 15 segundos)',
            key: 'hook_script',
            type: 'textarea'
          },
          {
            label: 'Apoio Visual (Qual B-Roll ou objeto aparecerá no Gancho?)',
            key: 'hook_visual',
            type: 'text'
          },
          {
            label: 'Método de Execução Escolhido',
            key: 'execution_method',
            type: 'select',
            options: ['Bater texto (Frase por frase)', 'Improviso guiado por tópicos', 'Teleprompter']
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod1-chk-1', task: 'Escrever o roteiro em duas colunas (Vídeo/Áudio)', category: 'Roteiro' },
      { id: 'mod1-chk-2', task: 'Fazer exercícios de aquecimento vocal antes do set', category: 'Oratória' },
      { id: 'mod1-chk-3', task: 'Garantir que a promessa da capa é cumprida nos primeiros 10 segundos', category: 'Retenção' },
      { id: 'mod1-chk-4', task: 'Olhar diretamente para o olho da lente e não para a tela da câmera', category: 'Performance' }
    ]
  },
  {
    id: 'mod2',
    title: 'MÓDULO 02: Equipamentos',
    subtitle: 'Câmeras, Lentes e Iluminação',
    badge: 'MÓDULO 02',
    iconName: 'Camera',
    subtopics: [mod2_1, mod2_2, mod2_3],
    challenges: [
      {
        id: 'challenge-mod2',
        title: 'Desafio Prático: Engenharia do Setup Técnico',
        description: 'Desenhe e defina o setup de hardware e iluminação que você usará na sua próxima produção.',
        placeholder: 'Mapeie seu kit atual e desejado...',
        fields: [
          {
            label: 'Câmera / Celular que usará',
            key: 'hardware_camera',
            type: 'text'
          },
          {
            label: 'Lente / Distância Focal aproximada',
            key: 'hardware_lens',
            type: 'text'
          },
          {
            label: 'Configuração da Key Light (Luz Principal)',
            key: 'hardware_keylight',
            type: 'text'
          },
          {
            label: 'Iluminação Prática / RGB de Fundo (Como fará?)',
            key: 'hardware_rgb',
            type: 'textarea'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod2-chk-1', task: 'Limpar a lente da câmera/celular antes de iniciar', category: 'Set' },
      { id: 'mod2-chk-2', task: 'Verificar se o CRI do iluminador principal é adequado (95+)', category: 'Iluminação' },
      { id: 'mod2-chk-3', task: 'Ligar a Key Light a 45 graus de altura e lateral em relação ao rosto', category: 'Iluminação' },
      { id: 'mod2-chk-4', task: 'Posicionar uma luz de recorte (Backlight) por trás do apresentador', category: 'Iluminação' }
    ]
  },
  {
    id: 'mod3',
    title: 'MÓDULO 03: Cenário',
    subtitle: 'A Estética do Vídeo',
    badge: 'MÓDULO 03',
    iconName: 'Tv',
    subtopics: [mod3_1, mod3_2],
    challenges: [
      {
        id: 'challenge-mod3',
        title: 'Desafio Prático: Planejando o Cenário de Três Camadas',
        description: 'Mapeie as camadas físicas do seu cenário para garantir volume e interesse visual aos olhos de quem assiste.',
        placeholder: 'Descreva a distribuição de objetos...',
        fields: [
          {
            label: 'Primeiro Plano (Foreground - O que fica bem próximo à câmera?)',
            key: 'art_foreground',
            type: 'text'
          },
          {
            label: 'Plano Médio (Midground - Qual roupa você vestirá para contrastar?)',
            key: 'art_midground',
            type: 'text'
          },
          {
            label: 'Plano de Fundo (Background - Quais luzes e objetos de branding usar?)',
            key: 'art_background',
            type: 'textarea'
          },
          {
            label: 'Esquema de Cores do Cenário',
            key: 'art_color_scheme',
            type: 'select',
            options: ['Neon/Cyberpunk (Azul e Rosa)', 'Warm Minimalist (Madeira, Branco, Quente)', 'Tech Slate (Cinza escuro, Azul frio)', 'Corporate (Branco, Tons Verdes/Azuis)']
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod3-chk-1', task: 'Distanciar-se da parede de fundo em pelo menos 1.5 metros', category: 'Espaço' },
      { id: 'mod3-chk-2', task: 'Configurar a grade da Regra dos Terços no visor', category: 'Composição' },
      { id: 'mod3-chk-3', task: 'Remover fios expostos e objetos distrativos do fundo', category: 'Arte' },
      { id: 'mod3-chk-4', task: 'Garantir que o espaço acima da cabeça (Headroom) está correto', category: 'Composição' }
    ]
  },
  {
    id: 'mod4',
    title: 'MÓDULO 04: Filmagem',
    subtitle: 'Prática de Set e Exposição',
    badge: 'MÓDULO 04',
    iconName: 'Layers',
    subtopics: [mod4_1, mod4_2],
    challenges: [
      {
        id: 'challenge-mod4',
        title: 'Desafio Prático: O Triângulo Perfeito',
        description: 'Calcule as configurações manuais corretas do seu equipamento de acordo com as especificações do ambiente e taxa de quadros (FPS) que você definiu.',
        placeholder: 'Preencha com suas configurações ideais...',
        fields: [
          {
            label: 'Taxa de Quadros (Frame Rate - Ex: 24fps, 30fps, 60fps)',
            key: 'exposure_fps',
            type: 'select',
            options: ['24 fps (Cinema Clássico)', '30 fps (Padrão Web)', '60 fps (Esportes / Super Fluidez)']
          },
          {
            label: 'Velocidade do Obturador Recomendada (Shutter Speed - Regra 180°)',
            key: 'exposure_shutter',
            type: 'text'
          },
          {
            label: 'Abertura do Diafragma (f/) Desejada para o Fundo',
            key: 'exposure_aperture',
            type: 'text'
          },
          {
            label: 'Alvo de ISO para evitar granulação em ambiente interno',
            key: 'exposure_iso',
            type: 'text'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod4-chk-1', task: 'Configurar a velocidade do obturador de acordo com a regra de 180 graus', category: 'Gravação' },
      { id: 'mod4-chk-2', task: 'Fazer o Balanço de Branco Manual (não automático)', category: 'Cores' },
      { id: 'mod4-chk-3', task: 'Checar o nível do áudio no visor (deve bater entre -12dB e -6dB nos picos)', category: 'Áudio' },
      { id: 'mod4-chk-4', task: 'Formatar o cartão de memória e carregar baterias extras', category: 'Pre-set' }
    ]
  },
  {
    id: 'mod5',
    title: 'MÓDULO 05: Edição',
    subtitle: 'Os 5 Princípios de Pudovkin',
    badge: 'MÓDULO 05',
    iconName: 'Scissors',
    subtopics: [mod5_1, mod5_2],
    challenges: [
      {
        id: 'challenge-mod5',
        title: 'Desafio Prático: Aplicando Montagem de Pudovkin',
        description: 'Planeje uma sequência curta de 3 cortes aplicando uma das técnicas clássicas de Pudovkin para ilustrar um conceito do seu vídeo.',
        placeholder: 'Descreva os 3 cortes da sequência...',
        fields: [
          {
            label: 'Princípio Escolhido',
            key: 'pudovkin_principle',
            type: 'select',
            options: ['Contraste', 'Paralelismo', 'Simbolismo', 'Simultaneidade', 'Leitmotiv']
          },
          {
            label: 'Cena 1 (O que aparece na tela e o áudio falado)',
            key: 'pudovkin_scene1',
            type: 'textarea'
          },
          {
            label: 'Cena 2 (O corte de justaposição - A veracidade / O contraste)',
            key: 'pudovkin_scene2',
            type: 'textarea'
          },
          {
            label: 'Cena 3 (Retorno à fala ou conclusão do raciocínio)',
            key: 'pudovkin_scene3',
            type: 'textarea'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod5-chk-1', task: 'Eliminar todos os "vícios de linguagem" e pausas vazias de silêncio', category: 'A-Roll' },
      { id: 'mod5-chk-2', task: 'Implementar pelo menos 3 J-Cuts ou L-Cuts nas transições verbais', category: 'Cortes' },
      { id: 'mod5-chk-3', task: 'Inserir Zoom-in (110%) nos cortes secos de emenda para disfarçar o corte', category: 'Ajuste Visual' },
      { id: 'mod5-chk-4', task: 'Planejar B-Roll ou textos de apoio para cada bloco de 10 segundos falados', category: 'Cobertura' }
    ]
  },
  {
    id: 'mod6',
    title: 'MÓDULO 06: Som',
    subtitle: 'O Som é Metade do Vídeo',
    badge: 'MÓDULO 06',
    iconName: 'Volume2',
    subtopics: [mod6_1, mod6_2],
    challenges: [
      {
        id: 'challenge-mod6',
        title: 'Desafio Prático: Planejamento de Sound Design',
        description: 'Desenhe o fluxo de áudio e os efeitos sonoros que darão impacto emocional e imersão ao seu conteúdo.',
        placeholder: 'Mapeie o fluxo acústico...',
        fields: [
          {
            label: 'Microfone Utilizado no Setup',
            key: 'audio_mic',
            type: 'select',
            options: ['Lapela (Prendido na roupa)', 'Shotgun / Boom (Fora do enquadramento)', 'Dinâmico de Mesa (Estilo podcast)', 'Celular direto com fone']
          },
          {
            label: 'Estratégia de Controle Acústico do Quarto/Set',
            key: 'audio_acoustic',
            type: 'text'
          },
          {
            label: 'Efeito Sonoro (SFX) escolhido para as Transições Visuais',
            key: 'audio_trans_sfx',
            type: 'text'
          },
          {
            label: 'Plano de Trilha Sonora (Qual ritmo/estilo musical apoia o conteúdo?)',
            key: 'audio_music_style',
            type: 'text'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod6-chk-1', task: 'Aproximar o microfone a uma distância de 15 centímetros da boca', category: 'Set' },
      { id: 'mod6-chk-2', task: 'Garantir que não há ruídos de vento ou eletrônicos contínuos no teste', category: 'Captação' },
      { id: 'mod6-chk-3', task: 'Aplicar corte passa-altas (High Pass) abaixo de 80Hz na voz', category: 'Pós-Áudio' },
      { id: 'mod6-chk-4', task: 'Checar se a música de fundo está a pelo menos -24dB de volume', category: 'Mixagem' }
    ]
  },
  {
    id: 'mod7',
    title: 'MÓDULO 07: Color Grading',
    subtitle: 'A Estética das Cores',
    badge: 'MÓDULO 07',
    iconName: 'Palette',
    subtopics: [mod7_1, mod7_2],
    challenges: [
      {
        id: 'challenge-mod7',
        title: 'Desafio Prático: Workflow de Cor',
        description: 'Mapeie o fluxo cromático da captação até o ajuste de realces, sombras e tons de pele.',
        placeholder: 'Defina seu fluxo de color grading...',
        fields: [
          {
            label: 'Perfil de Imagem de Gravação (Ex: LOG, Flat, Standard)',
            key: 'color_profile',
            type: 'select',
            options: ['Standard / Neutro (8-bit fácil)', 'LOG (S-Log3, C-Log, D-Log para 10-bit)', 'Cinematic / HLG (Médio alcance)']
          },
          {
            label: 'Ajuste de Tom de Pele (Qual sua referência de saturação e naturalidade?)',
            key: 'color_skin_ref',
            type: 'text'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod7-chk-1', task: 'Confirmar espaço de cor definido como Rec.709 na linha do tempo', category: 'Timeline' },
      { id: 'mod7-chk-2', task: 'Verificar tom de pele usando o Vectorscope (linha de pele)', category: 'Correção' }
    ]
  },
  {
    id: 'mod8',
    title: 'MÓDULO 08: Deliver (Exportação do Vídeo)',
    subtitle: 'Exportação e Codec de Delivery',
    badge: 'MÓDULO 08',
    iconName: 'Activity',
    subtopics: [mod8_1],
    challenges: [
      {
        id: 'challenge-mod8',
        title: 'Desafio Prático: Planejamento de Delivery',
        description: 'Configure seu preset de exportação final para maximizar a qualidade no player do YouTube.',
        placeholder: 'Preencha as configurações de exportação...',
        fields: [
          {
            label: 'Resolução Final do Arquivo Renderizado para Postar',
            key: 'color_resolution',
            type: 'select',
            options: ['4K UHD - 2160p (Força codec VP09/AV1)', '1080p Full HD (Codec básico AVC1)', '720p HD']
          },
          {
            label: 'Bitrate de Exportação Configurado (Mbps)',
            key: 'color_bitrate',
            type: 'text'
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod8-chk-1', task: 'Alterar a resolução de exportação para 4K UHD (mesmo vídeo sendo 1080p)', category: 'Delivery' },
      { id: 'mod8-chk-2', task: 'Definir codec de exportação para H.264 ou HEVC com alto Bitrate', category: 'Delivery' }
    ]
  },
  {
    id: 'mod9',
    title: 'MÓDULO 09: Métricas',
    subtitle: 'Design de Capas, Engenharia de Título e Analytics',
    badge: 'MÓDULO 09',
    iconName: 'Activity',
    subtopics: [mod9_1, mod9_2, mod9_3],
    challenges: [
      {
        id: 'challenge-mod9',
        title: 'Desafio Prático: A Embalagem Perfeita',
        description: 'Desenhe os elementos criativos e psicológicos que farão seu vídeo ser irresistível ao clique no feed do YouTube.',
        placeholder: 'Mapeie a embalagem do vídeo...',
        fields: [
          {
            label: 'Título Definitivo do Vídeo (Foco em Gatilho de Curiosidade)',
            key: 'pack_title',
            type: 'text'
          },
          {
            label: 'Descrição das 3 Camadas Visuais da Thumbnail (O que aparece?)',
            key: 'pack_thumb_layers',
            type: 'textarea'
          },
          {
            label: 'Palavras curtas escritas na Capa (Máximo 3 palavras)',
            key: 'pack_thumb_words',
            type: 'text'
          },
          {
            label: 'Tática de Curiosidade Empregada',
            key: 'pack_tactic',
            type: 'select',
            options: ['Omissão de informação ("Fiz isso e deu errado")', 'Revelação de Segredo ("O truque secreto de...")', 'Contraste Absurdo ("R$ 100 vs R$ 10.000")', 'Solução Rápida ("Como resolver em 2 minutos")']
          }
        ]
      }
    ],
    checklistItems: [
      { id: 'mod9-chk-1', task: 'Testar a miniatura em escala celular mini (10% de zoom)', category: 'Thumbnail' },
      { id: 'mod9-chk-2', task: 'Evitar sobreposição de texto ou rostos no canto inferior direito', category: 'Thumbnail' },
      { id: 'mod9-chk-3', task: 'Escrever pelo menos 3 títulos alternativos para testar nas primeiras horas', category: 'Títulos' },
      { id: 'mod9-chk-4', task: 'Configurar os capítulos de vídeo com os timestamps corretos', category: 'SEO' }
    ]
  }
];
