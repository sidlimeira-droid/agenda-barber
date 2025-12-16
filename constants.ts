import { Service, Barber } from './types';

export const SERVICES: Service[] = [
  {
    id: '1',
    name: 'Corte Clássico',
    price: 45.00,
    duration: 45,
    description: 'Corte tradicional com tesoura e acabamento na navalha.',
    image: 'https://picsum.photos/400/300?random=1'
  },
  {
    id: '2',
    name: 'Barba Terapia',
    price: 35.00,
    duration: 30,
    description: 'Modelagem de barba com toalha quente e óleos essenciais.',
    image: 'https://picsum.photos/400/300?random=2'
  },
  {
    id: '3',
    name: 'Combo King',
    price: 70.00,
    duration: 75,
    description: 'Corte de cabelo completo + Barba terapia.',
    image: 'https://picsum.photos/400/300?random=3'
  },
  {
    id: '4',
    name: 'Acabamento & Pezinho',
    price: 20.00,
    duration: 20,
    description: 'Apenas os contornos para manter o estilo em dia.',
    image: 'https://picsum.photos/400/300?random=4'
  }
];

export const BARBERS: Barber[] = [
  {
    id: 'b1',
    name: 'João Navalha',
    specialty: 'Cortes Clássicos',
    image: 'https://picsum.photos/100/100?random=10'
  },
  {
    id: 'b2',
    name: 'Carlos Fade',
    specialty: 'Degradê Moderno',
    image: 'https://picsum.photos/100/100?random=11'
  },
  {
    id: 'b3',
    name: 'André Viking',
    specialty: 'Barbas Longas',
    image: 'https://picsum.photos/100/100?random=12'
  }
];

export const TIME_SLOTS: string[] = [
  '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'
];