export interface NeighborhoodFee {
  name: string;
  fee: number;
  estimatedMinutes: string;
  notes?: string;
}

export const NEIGHBORHOODS: NeighborhoodFee[] = [
  { name: 'Centro', fee: 4.00, estimatedMinutes: '25-40 min', notes: 'Região central de Olímpia' },
  { name: 'Aeroporto', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Alto Cote Gil', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Beneficência', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Conjunto Habitacional Antônio José Trindade (Cohab I)', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Conjunto Habitacional Hélio Cazarini (Cohab II)', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Conjunto Habitacional Alberto Zacarelli (Cohab III)', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Alfredo Zucca (Cohab IV)', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Di Vitória Condominium', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Distrito Industrial Álvaro Britto', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Distrito Industrial Issao Nakamura', fee: 5.50, estimatedMinutes: '35-50 min' },
  { name: 'Fazenda Cruz Alta', fee: 6.00, estimatedMinutes: '40-55 min' },
  { name: 'Jardim Alvorada', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Amélia Dionísio', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Blanco', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Boa Esperança', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Borges', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Botânico', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Campo Belo', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Cecap', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Centenário', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Centerville', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Cisoto', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Colorado', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim dos Laranjais', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Esperandio Christófolo', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Ferreira', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Garcez', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Glória', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Hélio Cazarini', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Joaquim Antonio Pereira', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Leonor', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Luíza', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Luiz Zucca', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Manzoli', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Maria', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Menina Moça I', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Menina Moça II', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Mouco', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Nova Santa Rita', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Paulista', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Primavera', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Raia', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Rodrigues', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Santa Elisa', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Santa Fé', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Santa Ifigênia', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Santa Rita', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Santa Terezinha', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim São Domingos', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim São Francisco', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Tênis Clube', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Toledo', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Jardim Tropical', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Universitário', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Jardim Veridiana', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Nova Eliza', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Parque das Américas', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Parque Residencial Victório Parolin', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Parque Villa Lobos', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Patrimônio de São João Batista', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Pedregal', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Recanto Bela Vista', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Residencial Augusto Zangirolami', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Residencial Donnabella', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Residencial Harmonia', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Residencial Quinta da Colina', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Residencial Quinta das Aroeiras', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Residencial Thermas Park', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Residencial Village Morada Verde', fee: 5.00, estimatedMinutes: '35-50 min' },
  { name: 'Residencial Viva Olímpia', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Santa Casa', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Santa Júlia', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'São José', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila Di Marco', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila Gonçalves', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila Hípica', fee: 4.50, estimatedMinutes: '30-45 min' },
  { name: 'Vila Miessa', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila Nova', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila Santa Genoveva', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila Silva Melo', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vila São José', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Vivenda Cote Gil', fee: 4.00, estimatedMinutes: '25-40 min' },
  { name: 'Distrito de Baguaçu', fee: 7.00, estimatedMinutes: '45-60 min', notes: 'Distrito de Baguaçu - Olímpia/SP' },
  { name: 'Distrito de Ribeiro dos Santos', fee: 7.00, estimatedMinutes: '45-60 min', notes: 'Distrito de Ribeiro dos Santos - Olímpia/SP' },
  { name: 'Outro Bairro / Zona Rural de Olímpia', fee: 6.00, estimatedMinutes: '40-55 min', notes: 'Consulte disponibilidade pelo WhatsApp' }
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
