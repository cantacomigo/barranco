export type CategoryId =
  | 'hamburguer'
  | 'hamburguer_caseiro'
  | 'frango'
  | 'calabresa'
  | 'lombo'
  | 'file'
  | 'hot_dog'
  | 'diversos'
  | 'porcoes'
  | 'bebidas'
  | 'sobremesas'
  | 'combos'
  | 'todos';

export interface ExtraOption {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: 'queijos' | 'carnes' | 'molhos' | 'outros';
}

export interface FlavorOption {
  id: string;
  name: string;
  description: string;
  tag?: string;
  spiceLevel?: 0 | 1 | 2 | 3;
}

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badge?: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  available: boolean;
  preparationTime?: string;
  serves?: string;
  // Customization options
  allowedDoneness?: boolean; // Ponto da carne (para burgers)
  flavorsAvailable?: FlavorOption[]; // Sabores ou molhos inclusos para escolher
  maxFreeFlavors?: number;
  availableExtras?: ExtraOption[]; // Adicionais pagos
  availableExclusions?: string[]; // Itens que podem ser removidos (ex: cebola, picles)
  sizes?: { name: string; priceMultiplier: number; description?: string }[];
}

export interface SelectedItemOption {
  doneness?: string;
  selectedFlavors: string[];
  selectedExtras: { id: string; name: string; price: number }[];
  selectedExclusions: string[];
  selectedSize?: string;
  notes?: string;
}

export interface CartItem {
  cartItemId: string; // Unique id for cart entry (item + specific options)
  item: MenuItem;
  quantity: number;
  options: SelectedItemOption;
  unitPrice: number; // base price + extras + size modifier
  totalPrice: number; // unitPrice * quantity
}

export type OrderType = 'delivery' | 'retirada';

export type PaymentMethodType = 'pix' | 'cartao_online' | 'dinheiro_entrega' | 'cartao_entrega';

export type OrderStatus = 'recebido' | 'preparando' | 'em_entrega' | 'concluido' | 'cancelado';

export interface CustomerInfo {
  name: string;
  phone: string;
  orderType: OrderType;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    complement?: string;
    reference?: string;
    city: string;
  };
  tableNumber?: string;
}

export interface PaymentDetails {
  method: PaymentMethodType;
  pixPaid?: boolean;
  pixTxId?: string;
  cardBrand?: string;
  cardLast4?: string;
  installments?: number;
  changeFor?: number; // Para dinheiro (troco para quanto)
  deliveryCardType?: 'credito' | 'debito' | 'vr';
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  customer: CustomerInfo;
  payment: PaymentDetails;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: OrderStatus;
  estimatedMinutes: number;
  whatsappSent: boolean;
}

export interface StoreSettings {
  name: string;
  tagline: string;
  logoUrl?: string;
  phone: string;
  whatsapp: string; // Format: 5511999999999
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria';
  pixReceiverName: string;
  pixCity: string;
  address: string;
  openingHours: string;
  isOpen: boolean;
  closedMessage?: string;
  adminPin?: string;
  minOrderValue: number;
  freeDeliveryAbove: number;
  defaultDeliveryFee: number;
  // Configurações de Impressão Térmica 80mm
  autoPrintOrder: boolean;
  printerPaperSize: '80mm' | '58mm';
  printCopies: number; // 1 ou 2 vias (Cozinha e/ou Entrega)
  printKitchenNotesHighlight: boolean;
  printSoundAlert: boolean;
}
