import { Order, StoreSettings } from '../types';
import { formatCurrency, formatPhone } from './formatters';

export type ReceiptVia = 'completa' | 'cozinha' | 'entrega';

/**
 * Play a notification beep using Web Audio API (cross-browser, no external audio file needed)
 */
export const playOrderNotificationBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Two-tone cheerful POS chime
    const now = ctx.currentTime;
    
    // Tone 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Tone 2
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.16); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.35);
  } catch (e) {
    // Audio might be blocked by autoplay policies until user interaction, which is safe to ignore
    console.warn('Audio chime warning:', e);
  }
};

/**
 * Generates plain text 80mm monospace receipt for clipboard or raw ESC/POS printers
 * Width: 48 columns (standard 80mm thermal paper)
 */
export const generateMonospaceReceipt = (
  order: Order,
  storeSettings: StoreSettings,
  via: ReceiptVia = 'completa'
): string => {
  const lineLength = storeSettings.printerPaperSize === '58mm' ? 32 : 48;
  const divider = '='.repeat(lineLength);
  const thinDivider = '-'.repeat(lineLength);
  const dblDivider = '#'.repeat(lineLength);

  const padCenter = (text: string) => {
    if (text.length >= lineLength) return text.substring(0, lineLength);
    const totalPad = lineLength - text.length;
    const leftPad = Math.floor(totalPad / 2);
    const rightPad = totalPad - leftPad;
    return ' '.repeat(leftPad) + text + ' '.repeat(rightPad);
  };

  const padBetween = (left: string, right: string) => {
    const spaceCount = lineLength - left.length - right.length;
    if (spaceCount <= 0) return `${left} ${right}`;
    return left + ' '.repeat(spaceCount) + right;
  };

  const lines: string[] = [];

  // Header
  lines.push(divider);
  lines.push(padCenter(storeSettings.name.toUpperCase()));
  lines.push(padCenter(storeSettings.tagline));
  lines.push(padCenter(`Tel/Zap: ${storeSettings.phone}`));
  lines.push(padCenter(storeSettings.address));
  lines.push(divider);

  // Via type indicator
  if (via === 'cozinha') {
    lines.push(padCenter('>>> VIA DA COZINHA / PREPARO <<<'));
  } else if (via === 'entrega') {
    lines.push(padCenter('>>> VIA DO MOTOBOY / ENTREGA <<<'));
  } else {
    lines.push(padCenter('>>> COMPROVANTE DO PEDIDO (80mm) <<<'));
  }
  lines.push(thinDivider);

  // Order Info
  lines.push(padBetween(`PEDIDO #${order.id}`, new Date(order.createdAt).toLocaleString('pt-BR')));
  const isDelivery = order.customer.orderType === 'delivery';
  lines.push(padCenter(isDelivery ? '*** ENTREGA EM DOMICILIO ***' : '*** RETIRADA NO BALCAO ***'));
  lines.push(thinDivider);

  // Customer Details
  lines.push(`CLIENTE: ${order.customer.name.toUpperCase()}`);
  lines.push(`TELEFONE/ZAP: ${formatPhone(order.customer.phone)}`);
  
  if (isDelivery) {
    lines.push(`ENDERECO: ${order.customer.address.street}, ${order.customer.address.number}`);
    lines.push(`BAIRRO: ${order.customer.address.neighborhood} - ${order.customer.address.city}`);
    if (order.customer.address.complement) {
      lines.push(`COMPLEMENTO: ${order.customer.address.complement}`);
    }
    if (order.customer.address.reference) {
      lines.push(`REFERENCIA: ${order.customer.address.reference}`);
    }
  }
  lines.push(divider);

  // Items Header
  lines.push(padBetween('QTD ITEM', 'TOTAL'));
  lines.push(thinDivider);

  // Items List
  order.items.forEach((item, idx) => {
    const itemTotalStr = formatCurrency(item.totalPrice);
    const itemTitle = `${item.quantity}x ${item.item.name}`;
    lines.push(padBetween(itemTitle, itemTotalStr));
    lines.push(`   Unitario: ${formatCurrency(item.unitPrice)}`);

    // Doneness (Ponto da carne)
    if (item.options.doneness) {
      lines.push(`   * Ponto: ${item.options.doneness.toUpperCase()}`);
    }

    // Size
    if (item.options.selectedSize) {
      lines.push(`   * Tamanho: ${item.options.selectedSize}`);
    }

    // Flavors / Sauces
    if (item.options.selectedFlavors && item.options.selectedFlavors.length > 0) {
      lines.push(`   * Molhos: ${item.options.selectedFlavors.join(', ')}`);
    }

    // Extras / Adicionais
    if (item.options.selectedExtras && item.options.selectedExtras.length > 0) {
      lines.push('   * Adicionais:');
      item.options.selectedExtras.forEach((extra) => {
        lines.push(`     + ${extra.name} (${formatCurrency(extra.price)})`);
      });
    }

    // Exclusions
    if (item.options.selectedExclusions && item.options.selectedExclusions.length > 0) {
      lines.push(`   * SEM: ${item.options.selectedExclusions.join(', ')}`);
    }

    // Kitchen Notes
    if (item.options.notes && item.options.notes.trim()) {
      lines.push(`   >>> OBS: ${item.options.notes.toUpperCase()} <<<`);
    }

    if (idx < order.items.length - 1) {
      lines.push(thinDivider);
    }
  });

  lines.push(divider);

  // Financial summary (omit or simplify in kitchen via if preferred, but complete on full via)
  lines.push(padBetween('SUBTOTAL:', formatCurrency(order.subtotal)));
  
  if (isDelivery) {
    lines.push(padBetween('TAXA DE ENTREGA:', order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'GRATIS'));
  }

  if (order.discount > 0) {
    const couponStr = order.couponCode ? ` (CUPOM ${order.couponCode})` : '';
    lines.push(padBetween(`DESCONTO${couponStr}:`, `-${formatCurrency(order.discount)}`));
  }

  lines.push(dblDivider);
  lines.push(padBetween('TOTAL A PAGAR:', formatCurrency(order.total)));
  lines.push(dblDivider);

  // Payment method info
  lines.push('FORMA DE PAGAMENTO:');
  if (order.payment.method === 'pix') {
    lines.push(`* PIX ONLINE AUTOMATICO [PAGO/CONFIRMADO]`);
    if (order.payment.pixTxId) {
      lines.push(`  TxID: ${order.payment.pixTxId}`);
    }
  } else if (order.payment.method === 'cartao_online') {
    lines.push(`* CARTAO DE CREDITO ONLINE [APROVADO]`);
    if (order.payment.cardLast4) {
      lines.push(`  Final: **** ${order.payment.cardLast4} (${order.payment.installments || 1}x)`);
    }
  } else if (order.payment.method === 'cartao_entrega') {
    const type = order.payment.deliveryCardType?.toUpperCase() || 'DEBITO/CREDITO';
    lines.push(`* CARTAO NA ENTREGA (MAQUININHA ${type})`);
  } else if (order.payment.method === 'dinheiro_entrega') {
    lines.push('* DINHEIRO NA ENTREGA');
    if (order.payment.changeFor && order.payment.changeFor > order.total) {
      const troco = order.payment.changeFor - order.total;
      lines.push(`  Troco para: ${formatCurrency(order.payment.changeFor)} (Levar: ${formatCurrency(troco)})`);
    } else {
      lines.push('  Sem necessidade de troco (Valor exato)');
    }
  }

  lines.push(thinDivider);
  lines.push(padCenter('TEMPO ESTIMADO: ~' + order.estimatedMinutes + ' MINUTOS'));
  lines.push(padCenter('OBRIGADO PELA PREFERENCIA!'));
  lines.push(padCenter('BOM APETITE!'));
  lines.push(divider);
  lines.push(padCenter('--- CORTE DO PAPEL (80mm) ---'));
  lines.push('\n\n\n'); // Feed lines for thermal tear-off

  return lines.join('\n');
};

/**
 * Triggers the 80mm thermal receipt printing using browser print dialog.
 * Prepares the print DOM container and invokes window.print() seamlessly.
 */
export const triggerThermalPrint = (
  order: Order,
  storeSettings: StoreSettings,
  via: ReceiptVia = 'completa'
) => {
  if (storeSettings.printSoundAlert !== false) {
    playOrderNotificationBeep();
  }

  // Allow a tiny micro-tick for React state to update the print target element in the DOM
  setTimeout(() => {
    try {
      window.print();
    } catch (e) {
      console.error('Erro ao acionar impressora 80mm:', e);
    }
  }, 150);
};
