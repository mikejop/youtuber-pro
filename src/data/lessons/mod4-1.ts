import { Subtopic } from '../../types';

export const mod4_1: Subtopic = {
  id: 'mod4-1',
  title: 'O Triângulo de Exposição Prático',
  concept: 'Dominar a exposição garante que o vídeo não fique granulado ou superexposto. Controlamos a luz com três parâmetros: Abertura (f/stop, profundidade de campo), Velocidade do Obturador (Shutter Speed, controla desfoque de movimento) e ISO (sensibilidade digital, que gera ruído se estiver alto demais).',
  steps: [
    'A Regra dos 180 Graus: Defina a velocidade do obturador exatamente no dobro do frame-rate da gravação. Se grava em 24fps, Shutter em 1/50; em 30fps, 1/60; em 60fps, 1/120.',
    'Mantenha o ISO no valor nativo mais baixo (ex: 100 ou 400) para evitar ruídos desnecessários de granulação.',
    'Ajuste a Abertura (f/) de acordo com o desfoque desejado no fundo. Se quiser tudo nítido, feche para f/4 ou f/5.6. Se quiser bokeh suave, abra para f/1.8.'
  ],
  tips: [
    'Se precisar gravar em f/1.8 sob luz do dia externa intensa, utilize um filtro ND (densidade neutra) para escurecer o sensor sem quebrar a Regra dos 180 Graus.'
  ]
};
