import { Subtopic } from '../../types';

export const mod6_2: Subtopic = {
  id: 'mod6-2',
  title: 'Pós-Produção de Áudio e Sound Design',
  concept: 'O áudio profissional passa por três etapas de processamento: Limpeza, Equalização/Compressão e Mixagem da Hierarquia Sonora.',
  steps: [
    'Redução de Ruído (Denoise): Remova chiados constantes de coolers ou ar-condicionado de forma sutil, sem robotizar a voz.',
    'Equalizador Paramétrico (EQ): Corte as frequências graves excessivas abaixo de 80Hz (onde fica o sub-grau de ruído físico) e dê um brilho de agudos leves em torno de 5kHz a 10kHz para clareza.',
    'Compressor de Áudio: Nivele os picos de volume do áudio, deixando as falas mais consistentes e com peso profissional.',
    'Hierarquia de Decibéis (Golden Mix Rule): Defina a Voz principal em torno de -6dB a -3dB; a Trilha Sonora de fundo entre -25dB e -30dB (nunca sobressaindo à voz); e os Efeitos Sonoros (SFX) entre -15dB e -10dB.'
  ],
  tips: [
    'Adicione efeitos sonoros sutis de "whoosh" em todas as transições e movimentações de texto gráficos na tela.'
  ]
};
