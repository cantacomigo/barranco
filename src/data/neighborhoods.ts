export interface NeighborhoodFee {
  name: string;
  fee: number;
  estimatedMinutes: string;
}

export const NEIGHBORHOODS: NeighborhoodFee[] = [
  { name: 'Centro / Bela Vista', fee: 5.00, estimatedMinutes: '25-35 min' },
  { name: 'Jardins / Cerqueira César', fee: 6.00, estimatedMinutes: '30-40 min' },
  { name: 'Pinheiros / Vila Madalena', fee: 8.00, estimatedMinutes: '35-45 min' },
  { name: 'Vila Mariana / Paraíso', fee: 7.00, estimatedMinutes: '30-40 min' },
  { name: 'Moema / Itaim Bibi', fee: 9.00, estimatedMinutes: '35-50 min' },
  { name: 'Perdizes / Pompéia', fee: 8.50, estimatedMinutes: '35-45 min' },
  { name: 'Consolação / Higienópolis', fee: 5.50, estimatedMinutes: '25-35 min' },
  { name: 'Santana / Zona Norte', fee: 12.00, estimatedMinutes: '45-60 min' },
  { name: 'Tatuapé / Mooca', fee: 12.00, estimatedMinutes: '45-60 min' },
  { name: 'Outros bairros (Taxa padrão)', fee: 8.00, estimatedMinutes: '35-50 min' }
];

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder: number;
  description: string;
  active?: boolean;
  expiresAt?: string;
  maxUses?: number;
  timesUsed?: number;
  createdAt?: string;
}

export const VALID_COUPONS: Coupon[] = [
  { code: 'BEMVINDO10', type: 'percentage', value: 10, minOrder: 30, description: '10% de desconto na sua compra', active: true, timesUsed: 8 },
  { code: 'BURGER5', type: 'fixed', value: 5, minOrder: 35, description: 'R$ 5,00 OFF em pedidos acima de R$ 35', active: true, timesUsed: 14 },
  { code: 'SEXTOU15', type: 'percentage', value: 15, minOrder: 60, description: '15% de desconto especial em pedidos acima de R$ 60', active: true, timesUsed: 5 },
  { code: 'FRETEFREE', type: 'fixed', value: 8, minOrder: 50, description: 'Desconto equivalente ao frete em pedidos acima de R$ 50', active: true, timesUsed: 19 }
];
