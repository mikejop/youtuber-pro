import { Subtopic } from '../../types';

export const mod7_1: Subtopic = {
  id: 'mod7-1',
  title: 'Perfis de Imagem e Espaço de Cor',
  concept: 'Câmeras profissionais permitem gravar em Perfis Planos / LOG (S-Log, C-Log, D-Log). Perfis LOG aproveitam o alcance dinâmico máximo do sensor capturando uma imagem cinza e lavada, feita exclusivamente para ser corrigida e colorizada em pós-produção, garantindo riqueza em áreas de sombra e céu claro sem estourar.',
  steps: [
    'Entenda o Espaço de Cor Padrão: O YouTube e a maioria das telas usam o padrão Rec.709.',
    'Se sua câmera grava em 10-bit de profundidade de cor, use perfis LOG para ter máxima flexibilidade.',
    'Se grava em 8-bit (câmeras de entrada ou celulares), evite LOGs agressivos e prefira perfis neutros ou suaves para evitar que a imagem "se quebre" na gradação de cor.'
  ],
  tips: [
    'Grave com o espaço de cor e perfil de imagem corretos para não estourar tons de pele sensíveis.'
  ]
};
