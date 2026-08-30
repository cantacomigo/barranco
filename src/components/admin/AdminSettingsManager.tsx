import React, { useState } from 'react';
import { StoreSettings, Order } from '../../types';
import {
  Store,
  Phone,
  QrCode,
  Printer,
  Volume2,
  Lock,
  Save,
  Check,
  Power,
  Sparkles,
  MapPin,
  Clock,
  MessageSquare,
  Image as ImageIcon,
  RotateCcw,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { triggerThermalPrint } from '../../utils/thermalPrinter';
import { BARRANCO_LOGO_URL } from '../../assets/logo';


interface AdminSettingsManagerProps {
  storeSettings: StoreSettings;
  onUpdateStoreSettings: (newSettings: StoreSettings) => void;
  recentOrders: Order[];
}

export const AdminSettingsManager: React.FC<AdminSettingsManagerProps> = ({
  storeSettings,
  onUpdateStoreSettings,
  recentOrders
}) => {
  const [formData, setFormData] = useState<StoreSettings>({ ...storeSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleStoreOpen = () => {
    const updated = { ...formData, isOpen: !formData.isOpen };
    setFormData(updated);
    onUpdateStoreSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleTestPrint = () => {
    if (recentOrders.length > 0) {
      triggerThermalPrint(recentOrders[0], formData, 'completa');
    } else {
      // Mock order for test print
      const mockOrder: Order = {
        id: '888888',
        createdAt: new Date().toISOString(),
        customer: {
          name: 'Teste de Impressora 80mm',
          phone: '(11) 98765-4321',
          orderType: 'delivery',
          address: {
            street: 'Rua do Teste de Impressão',
            number: '123',
            neighborhood: 'Bela Vista',
            city: 'São Paulo - SP',
            reference: 'Teste da bobina térmica'
          }
        },
        items: [
          {
            cartItemId: 'test-1',
            quantity: 1,
            unitPrice: 30.0,
            totalPrice: 30.0,
            item: {
              id: 'burger-test',
              name: 'X Tudo Tradicional',
              category: 'hamburguer',
              description: 'Burger teste',
              price: 30.0,
              image: '',
              available: true
            },
            options: {
              doneness: 'Ao Ponto',
              selectedFlavors: ['Molho Especial da Casa'],
              selectedExtras: [{ id: 'bacon', name: 'Bacon em Tiras', price: 6.0 }],
              selectedExclusions: [],
              notes: 'Caprichar no molho e enviar bem quente!'
            }
          }
        ],
        payment: {
          method: 'pix',
          pixPaid: true,
          pixTxId: 'E999888777'
        },
        subtotal: 30.0,
        deliveryFee: 7.0,
        discount: 0,
        total: 37.0,
        status: 'recebido',
        estimatedMinutes: 30,
        whatsappSent: true
      };
      triggerThermalPrint(mockOrder, formData, 'completa');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Store Status Toggle Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          formData.isOpen
            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
            : 'bg-red-950/40 border-red-500/50 shadow-lg shadow-red-950/20'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${
              formData.isOpen
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}
          >
            <Power className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-lg text-white">
                Restaurante: {formData.isOpen ? 'ABERTO PARA PEDIDOS' : 'FECHADO NO MOMENTO'}
              </h3>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  formData.isOpen ? 'bg-emerald-500 text-zinc-950' : 'bg-red-500 text-white'
                }`}
              >
                {formData.isOpen ? 'Online' : 'Pausado'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {formData.isOpen
                ? 'Clientes podem navegar e enviar novos pedidos normalmente.'
                : 'O cardápio exibirá aviso de restaurante fechado no momento.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleStoreOpen}
          className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition cursor-pointer shadow active:scale-95 whitespace-nowrap self-start sm:self-auto ${
            formData.isOpen
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {formData.isOpen ? 'Fechar Restaurante Agora' : 'Abrir Restaurante Agora'}
        </button>
      </div>

      {/* Basic Store Info */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-400" />
          <span>Dados do Estabelecimento</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Nome da Hamburgueria / Lanchonete</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Slogan / Descrição Curta</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">WhatsApp de Atendimento (Recebe Pedidos)</label>
            <input
              type="text"
              required
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value.replace(/\D/g, '') })}
              placeholder="Ex: 5511987654321"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500">Formato com DDD e código do país (Ex: 5511999999999)</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Telefone Fixo / Contato</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(11) 98765-4321"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Endereço Completo</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Av. Paulista, 1000 - Bela Vista, São Paulo - SP"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Horário de Funcionamento Exibido</label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="Terça a Domingo: 18h às 23h45"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Mensagem Quando a Loja Estiver Fechada</label>
            <input
              type="text"
              value={formData.closedMessage || ''}
              onChange={(e) => setFormData({ ...formData, closedMessage: e.target.value })}
              placeholder="Ex: Estamos fechados no momento. Abriremos hoje às 18:00!"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="sm:col-span-2 space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>URL da Logomarca (PNG com Fundo Transparente)</span>
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, logoUrl: BARRANCO_LOGO_URL })}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-semibold"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar Logo Oficial</span>
              </button>
            </label>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 bg-zinc-900/90 border border-zinc-800 p-3.5 rounded-xl">
              <div className="w-20 h-20 rounded-xl bg-zinc-950 border border-zinc-700/60 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={formData.logoUrl || BARRANCO_LOGO_URL}
                  alt="Preview Logo"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = BARRANCO_LOGO_URL;
                  }}
                  className="w-full h-full object-contain filter drop-shadow"
                />
              </div>
              <div className="flex-1 w-full space-y-1">
                <input
                  type="text"
                  value={formData.logoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="Cole aqui o link direto da imagem ou use a logo padrão"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-zinc-400">
                  A logo oficial do Barranco Lanches possui fundo 100% transparente e se adapta com alto contraste tanto ao cabeçalho quanto aos comprovantes térmicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* PIX Settings */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <QrCode className="w-4 h-4 text-emerald-400" />
          <span>Configuração do PIX (Recebimento Automático)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Tipo de Chave PIX</label>
            <select
              value={formData.pixKeyType}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  pixKeyType: e.target.value as StoreSettings['pixKeyType']
                })
              }
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            >
              <option value="email">E-mail</option>
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
              <option value="telefone">Celular / Telefone</option>
              <option value="aleatoria">Chave Aleatória (EVP)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Chave PIX</label>
            <input
              type="text"
              required
              value={formData.pixKey}
              onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
              placeholder="sua-chave@pix.com"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Nome do Titular da Conta PIX</label>
            <input
              type="text"
              required
              value={formData.pixReceiverName}
              onChange={(e) => setFormData({ ...formData, pixReceiverName: e.target.value.toUpperCase() })}
              placeholder="SABOR E BRASA LANCHES"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Cidade da Conta</label>
            <input
              type="text"
              required
              value={formData.pixCity}
              onChange={(e) => setFormData({ ...formData, pixCity: e.target.value.toUpperCase() })}
              placeholder="SAO PAULO"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white uppercase focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Segurança & Senha do Dono */}
      <div className="bg-zinc-950/70 border border-amber-500/30 rounded-2xl p-4 sm:p-5 space-y-4 shadow-lg shadow-black/40">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Segurança & Senha de Acesso do Dono (Painel Admin)</span>
          </h4>
          <span className="text-[11px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
            Acesso Restrito
          </span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Defina uma senha ou PIN exclusivo para bloquear o painel de controle. Visitantes e clientes comuns não conseguirão ver seus pedidos, faturamento ou configurações sem esta chave de acesso.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Senha / PIN de Administrador</span>
              </span>
              <button
                type="button"
                onClick={() => setShowAdminPin(!showAdminPin)}
                className="text-[11px] text-zinc-400 hover:text-amber-400 flex items-center gap-1 cursor-pointer font-medium"
              >
                {showAdminPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showAdminPin ? 'Ocultar' : 'Visualizar'}</span>
              </button>
            </label>
            <div className="relative">
              <input
                type={showAdminPin ? 'text' : 'password'}
                required
                value={formData.adminPin || ''}
                onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                placeholder="Ex: 1234 ou sua senha segura"
                className="w-full bg-zinc-800/90 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono tracking-wider focus:outline-none focus:border-amber-500 font-bold"
              />
            </div>
          </div>

          <div className="flex flex-col justify-end">
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-[11px] text-amber-300/90 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>Dica de Segurança</span>
              </div>
              <p>
                A senha padrão inicial é <strong className="font-mono text-amber-300">1234</strong>. Você pode alterá-la para qualquer número ou palavra a qualquer momento.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Impressora Térmica 80mm */}
      <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Configurações da Impressora Térmica (80mm)</span>
          </h4>

          <button
            type="button"
            onClick={handleTestPrint}
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Testar Impressão 80mm</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 select-none">
            <input
              type="checkbox"
              checked={formData.autoPrintOrder}
              onChange={(e) => setFormData({ ...formData, autoPrintOrder: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
            />
            <div>
              <span className="font-bold block text-white">Auto-Impressão ao Receber Pedido</span>
              <span className="text-[11px] text-zinc-400">Abre a caixa de diálogo de impressão automaticamente</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 select-none">
            <input
              type="checkbox"
              checked={formData.printSoundAlert}
              onChange={(e) => setFormData({ ...formData, printSoundAlert: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
            />
            <div>
              <span className="font-bold block text-white">Alerta Sonoro de Novo Pedido</span>
              <span className="text-[11px] text-zinc-400">Toca bipe e campainha ao chegar pedido</span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-zinc-200 cursor-pointer bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 select-none">
            <input
              type="checkbox"
              checked={formData.printKitchenNotesHighlight}
              onChange={(e) => setFormData({ ...formData, printKitchenNotesHighlight: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 accent-amber-500"
            />
            <div>
              <span className="font-bold block text-white">Destacar Observações e Ponto</span>
              <span className="text-[11px] text-zinc-400">Imprime em caixa alta e negrito para a chapa</span>
            </div>
          </label>

          <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="font-bold block text-xs text-white">Tamanho da Bobina</span>
              <span className="text-[11px] text-zinc-400">Padrão para impressoras térmicas ESC/POS</span>
            </div>
            <select
              value={formData.printerPaperSize}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  printerPaperSize: e.target.value as '80mm' | '58mm'
                })
              }
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
            >
              <option value="80mm">80 mm (Padrão)</option>
              <option value="58mm">58 mm (Compacto)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <div>
          {savedSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Todas as configurações foram salvas com sucesso!
            </span>
          )}
        </div>

        <button
          type="submit"
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 transition shadow-lg shadow-orange-950/40 active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Todas as Configurações</span>
        </button>
      </div>
    </form>
  );
};
