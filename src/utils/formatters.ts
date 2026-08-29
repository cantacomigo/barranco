import { Order, CartItem } from '../types';

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

export function cleanPhoneForWhatsapp(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  if (!digits.startsWith('55') && digits.length <= 11) {
    digits = '55' + digits;
  }
  return digits;
}

export function formatItemOptionsText(item: CartItem): string[] {
  const lines: string[] = [];
  const { options } = item;

  if (options.selectedSize) {
    lines.push(`  • Tamanho: ${options.selectedSize}`);
  }

  if (options.doneness) {
    lines.push(`  • Ponto da carne: ${options.doneness}`);
  }

  if (options.selectedFlavors && options.selectedFlavors.length > 0) {
    lines.push(`  • Molho/Sabor: ${options.selectedFlavors.join(', ')}`);
  }

  if (options.selectedExtras && options.selectedExtras.length > 0) {
    const extrasList = options.selectedExtras
      .map((e) => `+ ${e.name} (${formatCurrency(e.price)})`)
      .join(', ');
    lines.push(`  • Adicionais: ${extrasList}`);
  }

  if (options.selectedExclusions && options.selectedExclusions.length > 0) {
    lines.push(`  • Sem: ${options.selectedExclusions.join(', ')}`);
  }

  if (options.notes && options.notes.trim()) {
    lines.push(`  • Obs: "${options.notes.trim()}"`);
  }

  return lines;
}

export function generateWhatsappOrderMessage(order: Order, storeName: string): string {
  const now = new Date(order.createdAt);
  const formattedDate = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const formattedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const isDelivery = order.customer.orderType === 'delivery';

  let paymentMethodDesc = '';
  switch (order.payment.method) {
    case 'pix':
      paymentMethodDesc = `📱 *PIX Online* ${order.payment.pixPaid ? '✅ (PAGO / CONFIRMADO)' : '⏳ (Aguardando conferência)'}`;
      break;
    case 'cartao_online':
      paymentMethodDesc = `💳 *Cartão de Crédito Online* ✅ (Aprovado ${order.payment.cardBrand ? `[${order.payment.cardBrand.toUpperCase()}]` : ''} em ${order.payment.installments || 1}x)`;
      break;
    case 'cartao_entrega':
      paymentMethodDesc = `💳 *Cartão na Entrega* (Levar Maquininha - ${order.payment.deliveryCardType ? order.payment.deliveryCardType.toUpperCase() : 'Débito/Crédito'})`;
      break;
    case 'dinheiro_entrega':
      paymentMethodDesc = `💵 *Dinheiro na Entrega* ${order.payment.changeFor ? `(Troco para ${formatCurrency(order.payment.changeFor)})` : '(Sem necessidade de troco / Valor exato)'}`;
      break;
    default:
      paymentMethodDesc = 'Outro';
  }

  const itemsFormatted = order.items
    .map((item, idx) => {
      const itemTitle = `*${item.quantity}x ${item.item.name}* - ${formatCurrency(item.totalPrice)}`;
      const options = formatItemOptionsText(item);
      if (options.length > 0) {
        return `${itemTitle}\n${options.join('\n')}`;
      }
      return itemTitle;
    })
    .join('\n\n');

  let addressBlock = '';
  if (isDelivery) {
    addressBlock = `📍 *ENDEREÇO DE ENTREGA:*
Rua: ${order.customer.address.street}, Nº ${order.customer.address.number}
Bairro: ${order.customer.address.neighborhood}
${order.customer.address.complement ? `Complemento: ${order.customer.address.complement}\n` : ''}${order.customer.address.reference ? `Ref: ${order.customer.address.reference}\n` : ''}Cidade: ${order.customer.address.city || 'São Paulo - SP'}`;
  } else {
    addressBlock = `🏬 *MODALIDADE:* Retirada no Balcão do Restaurante`;
  }

  const message = `🍔 *NOVO PEDIDO #${order.id}* - ${storeName}
━━━━━━━━━━━━━━━━━━━━
📅 Data: ${formattedDate} às ${formattedTime}
👤 Cliente: *${order.customer.name}*
📱 Telefone: *${formatPhone(order.customer.phone)}*

${addressBlock}

━━━━━━━━━━━━━━━━━━━━
📋 *ITENS DO PEDIDO:*

${itemsFormatted}

━━━━━━━━━━━━━━━━━━━━
💰 *RESUMO DE VALORES:*
• Subtotal: ${formatCurrency(order.subtotal)}
${isDelivery ? `• Taxa de Entrega: ${order.deliveryFee === 0 ? 'GRÁTIS' : formatCurrency(order.deliveryFee)}\n` : ''}${order.discount > 0 ? `• Desconto Cupom (${order.couponCode || 'PROMO'}): -${formatCurrency(order.discount)}\n` : ''}*• TOTAL A PAGAR: ${formatCurrency(order.total)}*

💳 *PAGAMENTO:*
${paymentMethodDesc}

⏱️ *Tempo estimado:* ~${order.estimatedMinutes} minutos
━━━━━━━━━━━━━━━━━━━━
Obrigado pela preferência! Aguardo a confirmação do pedido pelo restaurante. 🙌`;

  return message;
}

export function getWhatsappUrl(phone: string, message: string): string {
  const cleanPhone = cleanPhoneForWhatsapp(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}
