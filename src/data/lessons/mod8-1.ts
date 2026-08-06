import { Subtopic } from '../../types';

export const mod8_1: Subtopic = {
  id: 'mod8-1',
  title: 'Exportação e Codec de Delivery',
  concept: 'A exportação profissional dita a qualidade que chegará ao espectador final após a forte compressão feita pelos servidores do YouTube. Entender os segredos dos formatos nos dará vantagem competitiva imensa.',
  steps: [
    'O Truque da Exportação em 4K: Mesmo gravando e editando seu vídeo em 1080p Full HD, exporte o arquivo final renderizado em resolução 4K UHD (3840x2160).',
    'Entenda o motivo: O YouTube atribui um codec de compressão muito superior (VP09 / AV1) para vídeos em 4K, gerando uma nitidez impecável, enquanto vídeos exportados em 1080p ganham o codec inferior AVC1, que borra e pixela áreas escuras e com movimento.',
    'Configurações de Codec: Exporte em H.264 High Profile com Bitrate constante de 40 a 50 Mbps para 1080p e 80 Mbps para 4K, ou use H.265 (HEVC) para arquivos menores e altamente eficientes.'
  ],
  tips: [
    'Evite exportar bitrates baixos demais, pois a recompressão do YouTube destruirá os detalhes finos da imagem.'
  ]
};
