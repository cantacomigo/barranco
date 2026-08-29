/**
 * Gera a string no formato padrão do Banco Central (EMV QRCPS / BR Code) para PIX Copia e Cola.
 */

function formatField(id: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${id}${len}${value}`;
}

function calculateCRC16(payload: string): string {
  const polynomial = 0x1021;
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(params: {
  pixKey: string;
  receiverName: string;
  city: string;
  amount: number;
  txId?: string;
  description?: string;
}): string {
  const { pixKey, receiverName, city, amount, txId = 'SB' + Math.floor(1000 + Math.random() * 9000) } = params;

  // Normalizar strings sem acento para o padrão bancário
  const cleanName = receiverName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 25);

  const cleanCity = city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .slice(0, 15);

  const cleanTxId = txId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25);
  const formattedAmount = amount.toFixed(2);

  // ID 26: Merchant Account Information
  const gui = formatField('00', 'br.gov.bcb.pix');
  const key = formatField('01', pixKey);
  const merchantAccount = formatField('26', `${gui}${key}`);

  // Payload Base
  let payload =
    formatField('00', '01') + // Payload Format Indicator
    merchantAccount +
    formatField('52', '0000') + // Merchant Category Code
    formatField('53', '986') + // Transaction Currency (986 = BRL)
    formatField('54', formattedAmount) + // Transaction Amount
    formatField('58', 'BR') + // Country Code
    formatField('59', cleanName) + // Merchant Name
    formatField('60', cleanCity) + // Merchant City
    formatField('62', formatField('05', cleanTxId)) + // Additional Data Field Template (txId)
    '6304'; // CRC16 Header

  // Calcular e anexar o CRC16
  const crc = calculateCRC16(payload);
  return `${payload}${crc}`;
}
