import React from 'react';
import { Order, StoreSettings } from '../types';
import { formatCurrency, formatPhone } from '../utils/formatters';
import { ReceiptVia } from '../utils/thermalPrinter';

interface ThermalReceiptPrintAreaProps {
  order: Order | null;
  storeSettings: StoreSettings;
  via?: ReceiptVia;
  isKitchenOnly?: boolean;
}

export const ThermalReceiptPrintArea: React.FC<ThermalReceiptPrintAreaProps> = ({
  order,
  storeSettings,
  via = 'completa'
}) => {
  if (!order) return null;

  const activeVia: ReceiptVia = (via as ReceiptVia) || 'completa';
  const isDelivery = order.customer.orderType === 'delivery';
  const paperWidthClass = storeSettings.printerPaperSize === '58mm' ? 'w-[56mm] max-w-[58mm]' : 'w-[76mm] max-w-[80mm]';
  const copiesCount = storeSettings.printCopies || 1;

  const renderSingleReceipt = (viaType: ReceiptVia, copyIndex: number) => {
    return (
      <div
        key={`receipt-copy-${copyIndex}-${viaType}`}
        className={`${paperWidthClass} mx-auto bg-white text-black font-mono text-[11px] leading-[1.35] tracking-tight p-2 print:p-0 print:m-0 selection:bg-none`}
        style={{
          fontFamily: "'Courier New', Courier, 'Lucida Console', Monaco, monospace",
          color: '#000000',
          backgroundColor: '#ffffff'
        }}
      >
        {/* Top border header */}
        <div className="text-center font-bold border-b-2 border-dashed border-black pb-2 mb-2">
          <div className="text-sm font-black tracking-wider uppercase">{storeSettings.name}</div>
          <div className="text-[10px] font-medium leading-tight">{storeSettings.tagline}</div>
          <div className="text-[10px] mt-0.5 font-bold">Tel/Zap: {storeSettings.phone}</div>
          <div className="text-[9px] text-zinc-700 leading-tight">{storeSettings.address}</div>
        </div>

        {/* Via Banner */}
        <div className="bg-black text-white text-center font-black py-0.5 text-[11px] tracking-wider uppercase mb-1.5 print:bg-black print:text-white">
          {viaType === 'cozinha'
            ? '>>> VIA DA COZINHA (CHAPA) <<<'
            : viaType === 'entrega'
            ? '>>> VIA DO MOTOBOY (ENTREGA) <<<'
            : '>>> COMPROVANTE DO PEDIDO (80mm) <<<'}
        </div>

        {/* Order Header / Timestamp */}
        <div className="border-b border-dashed border-black pb-1.5 mb-1.5">
          <div className="flex justify-between items-center font-black text-sm">
            <span>PEDIDO #{order.id}</span>
            <span className="text-[10px] font-normal">
              {new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - {new Date(order.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="text-center font-black text-xs mt-0.5 tracking-wide bg-zinc-200 py-0.5 print:bg-zinc-200">
            {isDelivery ? '🛵 ENTREGA EM DOMICÍLIO' : '🏬 RETIRADA NO BALCÃO'}
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-b border-dashed border-black pb-1.5 mb-2 space-y-0.5">
          <div><strong className="uppercase">Cliente:</strong> <span className="font-bold">{order.customer.name}</span></div>
          <div><strong className="uppercase">Telefone:</strong> {formatPhone(order.customer.phone)}</div>
          {isDelivery && (
            <>
              <div><strong className="uppercase">Endereço:</strong> {order.customer.address.street}, {order.customer.address.number}</div>
              <div><strong className="uppercase">Bairro:</strong> {order.customer.address.neighborhood} - {order.customer.address.city}</div>
              {order.customer.address.complement && (
                <div><strong className="uppercase">Compl.:</strong> {order.customer.address.complement}</div>
              )}
              {order.customer.address.reference && (
                <div><strong className="uppercase">Ref.:</strong> {order.customer.address.reference}</div>
              )}
            </>
          )}
        </div>

        {/* Items List */}
        <div className="border-b-2 border-dashed border-black pb-2 mb-2">
          <div className="flex justify-between font-black text-[11px] border-b border-black pb-0.5 mb-1">
            <span>QTD ITEM</span>
            <span>TOTAL</span>
          </div>

          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between font-black text-[11px]">
                  <span>{item.quantity}x {item.item.name}</span>
                  <span>{formatCurrency(item.totalPrice)}</span>
                </div>
                <div className="text-[10px] text-zinc-800 pl-2">
                  Unitário: {formatCurrency(item.unitPrice)}
                </div>

                {/* Doneness */}
                {item.options.doneness && (
                  <div className="pl-2 font-bold text-[10px]">
                    🥩 Ponto: <span className="underline">{item.options.doneness.toUpperCase()}</span>
                  </div>
                )}

                {/* Size */}
                {item.options.selectedSize && (
                  <div className="pl-2 text-[10px]">
                    📏 Tamanho: <strong>{item.options.selectedSize}</strong>
                  </div>
                )}

                {/* Flavors / Sauces */}
                {item.options.selectedFlavors && item.options.selectedFlavors.length > 0 && (
                  <div className="pl-2 text-[10px]">
                    🥣 Molhos: <strong>{item.options.selectedFlavors.join(', ')}</strong>
                  </div>
                )}

                {/* Extras */}
                {item.options.selectedExtras && item.options.selectedExtras.length > 0 && (
                  <div className="pl-2 text-[10px]">
                    <span className="font-semibold">+ Adicionais:</span>
                    {item.options.selectedExtras.map((extra, eIdx) => (
                      <div key={eIdx} className="pl-2 text-[9.5px]">
                        + {extra.name} ({formatCurrency(extra.price)})
                      </div>
                    ))}
                  </div>
                )}

                {/* Exclusions */}
                {item.options.selectedExclusions && item.options.selectedExclusions.length > 0 && (
                  <div className="pl-2 text-[10px] font-bold text-red-700">
                    ❌ SEM: {item.options.selectedExclusions.join(', ')}
                  </div>
                )}

                {/* Highlighted Kitchen Notes */}
                {item.options.notes && item.options.notes.trim() && (
                  <div className="mt-1 p-1 bg-yellow-100 border border-black font-black text-[10px] text-black tracking-tight uppercase print:bg-yellow-100">
                    ⚠️ OBS: {item.options.notes.toUpperCase()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-b-2 border-dashed border-black pb-2 mb-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal ({order.items.length} itens):</span>
            <span className="font-bold">{formatCurrency(order.subtotal)}</span>
          </div>

          {isDelivery && (
            <div className="flex justify-between">
              <span>Taxa de Entrega:</span>
              <span className="font-bold">
                {order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'GRÁTIS'}
              </span>
            </div>
          )}

          {order.discount > 0 && (
            <div className="flex justify-between text-black font-bold">
              <span>Desconto {order.couponCode ? `(${order.couponCode})` : ''}:</span>
              <span>-{formatCurrency(order.discount)}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-sm font-black border-t-2 border-black pt-1 mt-1">
            <span>TOTAL A PAGAR:</span>
            <span className="text-base">{formatCurrency(order.total)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="border-b border-dashed border-black pb-2 mb-2 space-y-0.5">
          <div className="font-black text-[11px] uppercase">Forma de Pagamento:</div>
          {order.payment.method === 'pix' && (
            <div className="font-bold">
              ⚡ PIX ONLINE AUTOMÁTICO [PAGO/CONFIRMADO]
              {order.payment.pixTxId && (
                <div className="text-[9px] font-normal">TxID: {order.payment.pixTxId}</div>
              )}
            </div>
          )}
          {order.payment.method === 'cartao_online' && (
            <div className="font-bold">
              💳 CARTÃO DE CRÉDITO ONLINE [APROVADO]
              {order.payment.cardLast4 && (
                <div className="text-[9px] font-normal">
                  Final **** {order.payment.cardLast4} ({order.payment.installments || 1}x)
                </div>
              )}
            </div>
          )}
          {order.payment.method === 'cartao_entrega' && (
            <div className="font-bold">
              💳 CARTÃO NA ENTREGA (MAQUININHA {order.payment.deliveryCardType?.toUpperCase() || 'DÉBITO/CRÉDITO'})
            </div>
          )}
          {order.payment.method === 'dinheiro_entrega' && (
            <div>
              <div className="font-bold">💵 DINHEIRO NA ENTREGA</div>
              {order.payment.changeFor && order.payment.changeFor > order.total ? (
                <div className="text-[10px] font-bold">
                  Troco para: {formatCurrency(order.payment.changeFor)} (Levar: {formatCurrency(order.payment.changeFor - order.total)})
                </div>
              ) : (
                <div className="text-[9.5px]">Sem troco (Valor exato)</div>
              )}
            </div>
          )}
        </div>

        {/* Footer info & cut line */}
        <div className="text-center space-y-1 text-[10px] pt-1">
          <div className="font-bold">Tempo estimado: ~{order.estimatedMinutes} min</div>
          <div className="font-black uppercase tracking-wider text-[11px]">Obrigado pela Preferência!</div>
          <div>{storeSettings.name} - {storeSettings.tagline || 'Comida Caseira'}</div>
          <div className="border-t border-dotted border-black pt-1 text-[9px] text-zinc-600">
            ----------------- CORTE AQUI (80mm) -----------------
          </div>
        </div>

        {/* Print Spacing separator if multiple copies */}
        {copyIndex < copiesCount - 1 && (
          <div className="my-8 border-b-4 border-dashed border-black print:page-break-after print:my-0" />
        )}
      </div>
    );
  };

  return (
    <div id="thermal-receipt-print-area" className="thermal-receipt-root bg-white text-black">
      {copiesCount === 2 ? (
        <>
          {renderSingleReceipt('cozinha', 0)}
          <div className="print-page-break" style={{ pageBreakAfter: 'always' }} />
          {renderSingleReceipt('entrega', 1)}
        </>
      ) : (
        renderSingleReceipt(activeVia, 0)
      )}
    </div>
  );
};
