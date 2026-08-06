import { Subtopic } from '../../types';

export const mod9_2: Subtopic = {
  id: 'mod9-2',
  title: 'Leitura de Dados e YouTube Analytics',
  concept: 'O criador profissional é guiado por dados, não por opiniões. O painel do YouTube Studio fornece três dados cruciais para diagnosticar a saúde de cada publicação:',
  steps: [
    'CTR (Taxa de Cliques): Se o CTR cair abaixo de 4% nas primeiras horas após a publicação, mude imediatamente a Thumbnail ou o Título. Tenha sempre duas opções de capa reservas prontas.',
    'Gráfico de Retenção de Público: Analise as curvas de abandono. Picos representam momentos em que o público voltou ou pausou para ver detalhadamente. Quedas íngremes indicam trechos longos, chatos, ou vinhetas de propaganda mal colocadas que devem ser cortados nos próximos vídeos.',
    'Duração Média de Visualização (AVD - Average View Duration): Tente manter a retenção média acima de 40% a 50% de duração do vídeo para indicar ao algoritmo que seu vídeo é altamente satisfatório.'
  ],
  tips: [
    'Ignore o número de curtidas brutas se a retenção estiver caindo. A retenção absoluta é o fator número 1 de recomendação.'
  ]
};
