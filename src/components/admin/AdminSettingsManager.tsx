import React, { useState } from 'react';
import { StoreSettings, Order, StoreOperatingMode } from '../../types';
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
  EyeOff,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { triggerThermalPrint } from '../../utils/thermalPrinter';
import { BARRANCO_LOGO_URL } from '../../assets/logo';
import { getStoreScheduleStatus } from '../../utils/storeSchedule';


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
  const [formData, setFormData] = useState<StoreSettings>({
    ...storeSettings,
    operatingMode: storeSettings.operatingMode || 'auto',
    scheduleOpenTime: storeSettings.scheduleOpenTime || '18:00',
    scheduleCloseTime: storeSettings.scheduleCloseTime || '23:59',
    openingHours: storeSettings.openingHours || 'Segunda a Domingo: 18h às 23h59',
    scheduleDays: storeSettings.scheduleDays || [0, 1, 2, 3, 4, 5, 6]
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);

  const scheduleStatus = getStoreScheduleStatus(formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSetMode = (mode: StoreOperatingMode) => {
    let newIsOpen = formData.isOpen;
    if (mode === 'always_open') newIsOpen = true;
    if (mode === 'always_closed') newIsOpen = false;
    if (mode === 'auto') {
      const calculated = getStoreScheduleStatus({ ...formData, operatingMode: 'auto' });
      newIsOpen = calculated.isOpen;
    }

    const updated = {
      ...formData,
      operatingMode: mode,
      isOpen: newIsOpen
    };
    setFormData(updated);
    onUpdateStoreSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleToggleStoreOpen = () => {
    const nextMode: StoreOperatingMode = formData.isOpen ? 'always_closed' : 'always_open';
    handleSetMode(nextMode);
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
      {/* Store Status Toggle Banner & Operating Mode */}
      <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 ${
                scheduleStatus.isOpen
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <Power className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-lg text-white">
                  Status Atual: {scheduleStatus.isOpen ? 'ABERTO PARA PEDIDOS' : 'FECHADO NO MOMENTO'}
                </h3>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    scheduleStatus.isOpen ? 'bg-emerald-500 text-zinc-950' : 'bg-red-500 text-white'
                  }`}
                >
                  {scheduleStatus.isOpen ? 'Online' : 'Fechado'}
                </span>
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full font-mono">
                  {formData.operatingMode === 'auto'
                    ? 'Modo Automático'
                    : formData.operatingMode === 'always_open'
                    ? 'Forçado Aberto'
                    : 'Forçado Fechado'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {scheduleStatus.statusSubtext} • {scheduleStatus.nextOpenTimeMessage}
              </p>
            </div>
          </div>

          {/* Quick Mode Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSetMode('auto')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                formData.operatingMode === 'auto'
                  ? 'bg-amber-500 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Abre às 18:00 e fecha às 23:59 automaticamente todos os dias"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Automático (18h às 23h59)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode('always_open')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                formData.operatingMode === 'always_open'
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Forçar loja aberta para pedidos imediatamente"
            >
              <Power className="w-3.5 h-3.5 text-emerald-400" />
              <span>Forçar Aberto</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetMode('always_closed')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                formData.operatingMode === 'always_closed'
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-zinc-700'
              }`}
              title="Fechar restaurante agora imediatamente"
            >
              <Power className="w-3.5 h-3.5 text-red-400" />
              <span>Forçar Fechado</span>
            </button>
          </div>
        </div>

        {/* Live explanation pill */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3 text-xs flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-zinc-300 leading-relaxed">
            <span className="font-semibold text-white">Relógio Atual: {scheduleStatus.currentTimeFormatted}</span> ({scheduleStatus.currentDayName}).
            {formData.operatingMode === 'auto' ? (
              <span>
                {' '}O horário programado é das <strong className="text-amber-300">{formData.scheduleOpenTime || '18:00'}</strong> às <strong className="text-amber-300">{formData.scheduleCloseTime || '23:59'}</strong>.
                {scheduleStatus.isOpen ? (
                  <span className="text-emerald-400 font-medium"> A loja está aberta agora dentro do horário!</span>
                ) : (
                  <span className="text-red-400 font-medium"> A loja está fechada agora pois o horário atual está fora do expediente (abre às {formData.scheduleOpenTime || '18:00'}).</span>
                )}
              </span>
            ) : (
              <span> O restaurante está operando em <strong>modo manual ({formData.operatingMode === 'always_open' ? 'Sempre Aberto' : 'Sempre Fechado'})</strong>.</span>
            )}
          </div>
        </div>
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

          {/* Configuração de Horários Automáticos */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Hora de Abertura Automática</span>
              </label>
              <input
                type="time"
                value={formData.scheduleOpenTime || '18:00'}
                onChange={(e) => setFormData({ ...formData, scheduleOpenTime: e.target.value })}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Ex: 18:00 (O restaurante abre sozinho às 18h)</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Hora de Fechamento Automática</span>
              </label>
              <input
                type="time"
                value={formData.scheduleCloseTime || '23:59'}
                onChange={(e) => setFormData({ ...formData, scheduleCloseTime: e.target.value })}
                className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
              />
              <p className="text-[11px] text-zinc-500">Ex: 23:59 (O restaurante fecha sozinho à meia-noite)</p>
            </div>
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-zinc-300">Horário de Funcionamento Exibido no Cardápio</label>
            <input
              type="text"
              value={formData.openingHours}
              onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
              placeholder="Segunda a Domingo: 18h às 23h59"
              className="w-full bg-zinc-800/80 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
            />
            <p className="text-[11px] text-zinc-500">Texto amigável exibido para os clientes no topo e no banner</p>
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
