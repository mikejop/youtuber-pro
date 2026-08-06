import { Subtopic } from '../../types';

export const mod7_2: Subtopic = {
  id: 'mod7-2',
  title: 'Correção de Cor vs. Color Grading',
  concept: 'O tratamento de cor profissional é dividido em duas etapas fundamentais: a Correção (restaurar a fidelidade técnica da imagem) e o Color Grading (criar a estética criativa/emocional).',
  steps: [
    'Correção de Cor (Técnica): Ajuste primeiro o contraste geral, defina a exposição correta, neutralize balanços de branco e corrija os tons de pele para que fiquem no vetor correto de tom.',
    'Color Grading (Criativa): Aplique LUTs de conversão ou mude a tonalidade cromática das sombras (Shadows) para tons mais frios/azulados e realces (Highlights) para tons mais quentes (estética clássica Orange and Teal de Hollywood).',
    'Use as rodas de cores (Lift, Gamma, Gain) para refinar separadamente cada faixa luminosa.'
  ],
  tips: [
    'Mantenha sempre os scopes (waveform e vectorscope) abertos na tela durante o tratamento para evitar quebras de sinal.'
  ]
};
