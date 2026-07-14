import React, { useState } from 'react';
import { Appointment, AppointmentStatus, BlockedTime, AppNotification, HomepageConfig, PaymentMethod } from '../types';
import { SERVICES, BARBERS, TIME_SLOTS } from '../constants';

const BANKS_DATABASE = [
  { id: 'mercadopago', name: 'Mercado Pago', requiredFields: ['apiKey', 'clientId'] },
  { id: 'asaas', name: 'Asaas (API Pix/Boleto)', requiredFields: ['apiKey'] },
  { id: 'stripe', name: 'Stripe Global Payments', requiredFields: ['apiKey', 'clientSecret'] },
  { id: 'itau', name: 'Banco Itaú (API Pix)', requiredFields: ['clientId', 'clientSecret', 'apiKey'] },
  { id: 'bb', name: 'Banco do Brasil (API Pix)', requiredFields: ['clientId', 'clientSecret'] },
  { id: 'efi', name: 'Efí Bank (Gerencianet API)', requiredFields: ['clientId', 'clientSecret', 'apiKey'] },
];
import { 
  DollarSign, Users, CalendarDays, Check, Trash2, Ban, Lock, Bell, Filter, 
  Shield, UserPlus, AlertCircle, Download, LayoutDashboard, Calendar, 
  Sliders, CreditCard, Settings, RefreshCw, Eye, Sparkles, CheckSquare, Plus, Globe, CheckCircle2, SlidersHorizontal, Image
} from 'lucide-react';

interface AdminPanelProps {
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  notifications: AppNotification[];
  homepageConfig: HomepageConfig;
  onUpdateHomepageConfig: (config: HomepageConfig) => void;
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethods: (methods: PaymentMethod[]) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDeleteAppointment: (id: string) => void;
  onBlockTime: (block: BlockedTime) => void;
  onUnblockTime: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  appointments, 
  blockedTimes, 
  notifications, 
  homepageConfig,
  onUpdateHomepageConfig,
  paymentMethods,
  onUpdatePaymentMethods,
  onUpdateStatus, 
  onDeleteAppointment,
  onBlockTime, 
  onUnblockTime 
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'agenda' | 'bloqueios' | 'homepage' | 'pagamentos' | 'admins'>('dashboard');

  const [blockBarberId, setBlockBarberId] = useState(BARBERS[0].id);
  const [blockDate, setBlockDate] = useState('');
  const [blockTime, setBlockTime] = useState('ALL_DAY');
  
  // Date filter state, defaults to today
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  // New Admin Form State
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState('');
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');

  // Homepage Config Form State
  const [localHomeConfig, setLocalHomeConfig] = useState<HomepageConfig>(homepageConfig);
  const [homeConfigSuccess, setHomeConfigSuccess] = useState(false);

  // Payment Config Form State
  const [localPaymentMethods, setLocalPaymentMethods] = useState<PaymentMethod[]>(paymentMethods);
  const [paymentConfigSuccess, setPaymentConfigSuccess] = useState(false);

  // Simple calculations for the dashboard
  const totalRevenue = appointments
    .filter(a => a.status !== 'CANCELLED')
    .reduce((sum, app) => {
      const service = SERVICES.find(s => s.id === app.serviceId);
      return sum + (service ? service.price : 0);
    }, 0);

  const pendingAppointments = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;

  const handleAddBlock = () => {
    if (blockBarberId && blockDate && blockTime) {
      onBlockTime({
        id: Math.random().toString(36).substr(2, 9),
        barberId: blockBarberId,
        date: blockDate,
        time: blockTime,
        reason: 'Gestão Admin'
      });
      setBlockTime('ALL_DAY');
    }
  };

  const handleRegisterAdmin = () => {
    setAdminFormError('');
    setAdminFormSuccess('');

    if (!newAdminName || !newAdminEmail || !newAdminPassword || !newAdminConfirmPassword) {
      setAdminFormError('Preencha todos os campos.');
      return;
    }

    if (newAdminPassword.length < 6) {
      setAdminFormError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newAdminPassword !== newAdminConfirmPassword) {
      setAdminFormError('As senhas não coincidem.');
      return;
    }

    setAdminFormSuccess(`Admin ${newAdminName} cadastrado com sucesso!`);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setNewAdminConfirmPassword('');
    
    setTimeout(() => setAdminFormSuccess(''), 3000);
  };

  const handleSaveHomeConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateHomepageConfig(localHomeConfig);
    setHomeConfigSuccess(true);
    setTimeout(() => setHomeConfigSuccess(false), 3000);
  };

  const handleTogglePaymentMethod = (id: string) => {
    setLocalPaymentMethods(prev => prev.map(m => 
      m.id === id ? { ...m, active: !m.active } : m
    ));
  };

  const handlePaymentDetailsChange = (id: string, details: string) => {
    setLocalPaymentMethods(prev => prev.map(m => 
      m.id === id ? { ...m, details } : m
    ));
  };

  const handlePaymentBankChange = (id: string, bankId: string) => {
    setLocalPaymentMethods(prev => prev.map(m => 
      m.id === id ? { ...m, bankId, apiKey: m.bankId === bankId ? m.apiKey : '', clientId: m.bankId === bankId ? m.clientId : '', clientSecret: m.bankId === bankId ? m.clientSecret : '' } : m
    ));
  };

  const handlePaymentFieldChange = (id: string, field: 'apiKey' | 'clientId' | 'clientSecret', value: string) => {
    setLocalPaymentMethods(prev => prev.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ));
  };

  const handlePaymentSandboxToggle = (id: string) => {
    setLocalPaymentMethods(prev => prev.map(m => 
      m.id === id ? { ...m, sandbox: !m.sandbox } : m
    ));
  };

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePaymentMethods(localPaymentMethods);
    setPaymentConfigSuccess(true);
    setTimeout(() => setPaymentConfigSuccess(false), 3000);
  };

  // Filter appointments for the table
  const filteredAppointments = appointments.filter(app => {
    if (!filterDate) return true;
    return app.date === filterDate;
  });

  const handleExportCSV = () => {
    if (filteredAppointments.length === 0) return;

    const headers = ['Data', 'Hora', 'Cliente', 'Telefone', 'Servico', 'Profissional', 'Status', 'Valor'];
    
    const csvContent = [
      headers.join(','),
      ...filteredAppointments.map(app => {
        const service = SERVICES.find(s => s.id === app.serviceId);
        const barber = BARBERS.find(b => b.id === app.barberId);
        return [
          app.date,
          app.time,
          `"${app.customerName}"`,
          `"${app.customerPhone}"`,
          `"${service?.name || 'N/A'}"`,
          `"${barber?.name || 'N/A'}"`,
          app.status,
          service?.price.toFixed(2) || '0.00'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agenda_barberking_${filterDate || 'geral'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-700 text-slate-400';
    }
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return 'Agendado';
      case 'COMPLETED': return 'Concluído';
      case 'CANCELLED': return 'Cancelado';
    }
  };

  // Sidebar Menu Items Definition
  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'agenda', label: 'Agenda do Salão', icon: <Calendar className="w-5 h-5" /> },
    { id: 'bloqueios', label: 'Bloqueios e Folgas', icon: <Ban className="w-5 h-5" /> },
    { id: 'homepage', label: 'Página Inicial', icon: <Globe className="w-5 h-5 text-gold-400" /> },
    { id: 'pagamentos', label: 'Formas de Pagamento', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'admins', label: 'Administradores', icon: <Shield className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Sliders className="w-8 h-8 text-gold-500" /> Painel de Controle
          </h2>
          <p className="text-slate-400">Gerenciamento completo do BarberKing</p>
        </div>
        <div className="bg-slate-800/80 border border-slate-700 px-5 py-2.5 rounded-xl flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gold-500" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hoje</p>
            <p className="text-sm font-bold text-slate-200">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full lg:w-64 shrink-0 space-y-2">
          {/* Mobile Selector */}
          <div className="lg:hidden w-full bg-slate-800 p-2 rounded-xl border border-slate-700 mb-2">
            <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1 ml-1">Menu do Painel</label>
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white text-sm outline-none font-medium"
            >
              {menuItems.map(item => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex flex-col space-y-1 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
            <div className="text-[10px] font-bold text-slate-500 tracking-wider uppercase px-3 py-2">
              Navegação
            </div>
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id 
                    ? 'bg-gold-500 text-slate-950 font-bold shadow-lg shadow-gold-500/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* TAB CONTENTS CONTAINER */}
        <main className="flex-1 w-full bg-slate-800/40 border border-slate-800 rounded-2xl p-6 md:p-8 min-h-[500px]">
          
          {/* TAB 1: DASHBOARD (VISÃO GERAL) */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">Indicadores Principais</h3>
                <p className="text-sm text-slate-400">Resultados acumulados dos agendamentos</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Faturamento Estimado</p>
                    <h3 className="text-2xl font-black text-white mt-1">R$ {totalRevenue.toFixed(2)}</h3>
                  </div>
                </div>
                
                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <CalendarDays className="w-8 h-8 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Agendados Ativos</p>
                    <h3 className="text-2xl font-black text-white mt-1">{pendingAppointments}</h3>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                  <div className="p-3 bg-gold-500/10 rounded-xl border border-gold-500/20">
                    <Users className="w-8 h-8 text-gold-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Concluídos</p>
                    <h3 className="text-2xl font-black text-white mt-1">{completedAppointments}</h3>
                  </div>
                </div>
              </div>

              {/* Grid with overview details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                
                {/* Today's appointments quick look */}
                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gold-500" /> Hoje na Agenda
                    </h4>
                    <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-medium">
                      {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length} Cortes
                    </span>
                  </div>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                    {appointments.filter(a => a.date === new Date().toISOString().split('T')[0]).length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-6">Nenhum agendamento para hoje.</p>
                    ) : (
                      appointments
                        .filter(a => a.date === new Date().toISOString().split('T')[0])
                        .sort((a,b) => a.time.localeCompare(b.time))
                        .map(app => {
                          const service = SERVICES.find(s => s.id === app.serviceId);
                          return (
                            <div key={app.id} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                              <div>
                                <p className="font-bold text-white text-sm">{app.time} - {app.customerName}</p>
                                <p className="text-xs text-slate-400 mt-0.5">{service?.name}</p>
                              </div>
                              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${getStatusColor(app.status)}`}>
                                {getStatusLabel(app.status)}
                              </span>
                            </div>
                          )
                        })
                    )}
                  </div>
                </div>

                {/* Notifications Panel */}
                <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-800 flex flex-col h-[320px]">
                  <div className="flex items-center gap-2 mb-4 text-gold-500 border-b border-slate-800 pb-3">
                    <Bell className="w-5 h-5 text-gold-500" />
                    <h3 className="text-md font-bold text-white">Atividades Recentes</h3>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 text-sm text-center py-6">Nenhuma atividade recente.</p>
                    ) : (
                      notifications.map((notif) => (
                        <div key={notif.id} className="bg-slate-900/60 p-3 rounded-lg border-l-4 border-slate-800 relative">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                            notif.type === 'success' ? 'bg-green-500' : 
                            notif.type === 'error' ? 'bg-red-500' :
                            notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <p className="text-xs text-slate-200 font-medium pl-1.5">{notif.message}</p>
                          <p className="text-[10px] text-slate-500 pl-1.5 mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SALON SCHEDULE (AGENDA DO SALÃO) */}
          {activeTab === 'agenda' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">Agenda de Atendimentos</h3>
                  <p className="text-sm text-slate-400">Controle completo de status dos agendamentos do salão</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportCSV}
                    disabled={filteredAppointments.length === 0}
                    className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Exportar CSV"
                  >
                    <Download className="w-4 h-4" /> Exportar CSV
                  </button>

                  <div className="flex items-center gap-2 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-transparent text-white text-xs outline-none w-28"
                    />
                    {filterDate && (
                      <button 
                        onClick={() => setFilterDate('')} 
                        className="text-[10px] text-slate-500 hover:text-white px-1.5 font-bold uppercase"
                      >
                        Limpar
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Appointments Table */}
              <div className="bg-slate-900/40 rounded-xl border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950/60 text-slate-400 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold border-b border-slate-800">Horário</th>
                        <th className="p-4 font-bold border-b border-slate-800">Cliente / Contato</th>
                        <th className="p-4 font-bold border-b border-slate-800">Serviço / Profissional</th>
                        <th className="p-4 font-bold border-b border-slate-800">Pagamento</th>
                        <th className="p-4 font-bold border-b border-slate-800">Status</th>
                        <th className="p-4 font-bold border-b border-slate-800 text-right">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-sm">
                      {filteredAppointments.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-10 text-center text-slate-500 font-medium">
                            {filterDate ? 'Nenhum agendamento encontrado para esta data.' : 'Nenhum agendamento cadastrado.'}
                          </td>
                        </tr>
                      ) : (
                        filteredAppointments
                          .sort((a,b) => a.time.localeCompare(b.time))
                          .map((app) => {
                            const service = SERVICES.find(s => s.id === app.serviceId);
                            const barber = BARBERS.find(b => b.id === app.barberId);
                            const payment = paymentMethods.find(p => p.id === app.paymentMethodId);
                            
                            return (
                              <tr key={app.id} className="hover:bg-slate-800/20 transition-colors">
                                <td className="p-4 font-bold text-white text-md align-middle">
                                  <div className="flex flex-col">
                                    <span>{app.time}</span>
                                    {(!filterDate || filterDate !== app.date) && (
                                      <span className="text-[10px] text-slate-500 font-normal mt-0.5">
                                        {new Date(app.date).toLocaleDateString('pt-BR')}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="font-bold text-slate-200">{app.customerName}</div>
                                  <div className="text-xs text-slate-400 mt-0.5">{app.customerPhone || 'N/A'}</div>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="font-semibold text-slate-300">{service?.name}</div>
                                  <div className="text-xs text-gold-500/90 mt-0.5 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {barber?.name}
                                  </div>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className="text-xs text-slate-300 font-medium bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                    {payment?.name || 'Balcão / Não inf.'}
                                  </span>
                                </td>
                                <td className="p-4 align-middle">
                                  <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold border ${getStatusColor(app.status)}`}>
                                    {getStatusLabel(app.status)}
                                  </span>
                                </td>
                                <td className="p-4 align-middle">
                                  <div className="flex justify-end gap-2">
                                    {/* Confirm Button */}
                                    <button 
                                      onClick={() => onUpdateStatus(app.id, 'CONFIRMED')}
                                      disabled={app.status === 'CONFIRMED'}
                                      title="Confirmar Agendamento"
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                                        app.status === 'CONFIRMED'
                                          ? 'bg-slate-800 text-slate-600 border-transparent cursor-not-allowed'
                                          : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border-blue-500/20'
                                      }`}
                                    >
                                      <CheckSquare className="w-3.5 h-3.5" /> Confirmar
                                    </button>

                                    {/* Complete Button */}
                                    <button 
                                      onClick={() => onUpdateStatus(app.id, 'COMPLETED')}
                                      disabled={app.status === 'COMPLETED'}
                                      title="Marcar como Concluído"
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 border ${
                                        app.status === 'COMPLETED'
                                          ? 'bg-slate-800 text-slate-600 border-transparent cursor-not-allowed'
                                          : 'bg-green-600/10 text-green-400 hover:bg-green-600 hover:text-white border-green-500/20'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5" /> Concluído
                                    </button>

                                    {/* Delete Button */}
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Deseja apagar permanentemente o agendamento de ${app.customerName}?`)) {
                                          onDeleteAppointment(app.id);
                                        }
                                      }}
                                      title="Apagar Agendamento"
                                      className="p-1.5 bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/20 rounded-lg transition-all"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BLOCK TIMES (BLOQUEIOS E FOLGAS) */}
          {activeTab === 'bloqueios' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">Bloqueios de Horários</h3>
                <p className="text-sm text-slate-400">Marque folgas de barbeiros ou indisponibilidades específicas</p>
              </div>

              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Novo Bloqueio</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-1 ml-0.5">Profissional</label>
                    <select 
                      value={blockBarberId}
                      onChange={(e) => setBlockBarberId(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                    >
                      {BARBERS.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-1 ml-0.5">Data</label>
                    <input 
                      type="date"
                      value={blockDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBlockDate(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 uppercase font-bold mb-1 ml-0.5">Horário do Bloqueio</label>
                    <div className="flex gap-2">
                      <select 
                        value={blockTime}
                        onChange={(e) => setBlockTime(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                      >
                        <option value="ALL_DAY">Dia Inteiro (Folga)</option>
                        {TIME_SLOTS.map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                      <button 
                        onClick={handleAddBlock}
                        disabled={!blockDate}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-5 transition-colors font-bold flex items-center justify-center"
                        title="Bloquear"
                      >
                        <Lock className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Blocks List */}
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Bloqueios Ativos no Sistema</h4>
                {blockedTimes.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6">Nenhum barbeiro possui horários bloqueados no momento.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {blockedTimes.map(block => {
                      const barber = BARBERS.find(b => b.id === block.barberId);
                      return (
                        <div key={block.id} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-2 hover:border-red-500/30 transition-all">
                          <div>
                            <p className="font-bold text-slate-200 text-sm">{barber?.name}</p>
                            <p className="text-xs text-slate-400 mt-1">
                              {new Date(block.date).toLocaleDateString('pt-BR')} às {block.time === 'ALL_DAY' ? 'Folga' : block.time}
                            </p>
                          </div>
                          <button 
                            onClick={() => onUnblockTime(block.id)} 
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remover Bloqueio"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HOMEPAGE CONFIG (PÁGINA INICIAL) */}
          {activeTab === 'homepage' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">Configurar Página Inicial</h3>
                <p className="text-sm text-slate-400">Customize os textos, tagline e imagens que aparecem no site para os clientes</p>
              </div>

              <form onSubmit={handleSaveHomeConfig} className="space-y-6">
                
                {homeConfigSuccess && (
                  <div className="bg-green-600/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 text-green-400 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Página inicial atualizada com sucesso! Verifique as mudanças no início.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Hero Settings */}
                  <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-gold-500 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Hero / Banner Principal</h4>
                    
                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase font-bold">Tagline do Topo</label>
                      <input 
                        type="text" 
                        value={localHomeConfig.tagline}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, tagline: e.target.value })}
                        placeholder="Ex: Desde 2015"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase font-bold">Título Principal</label>
                      <input 
                        type="text" 
                        value={localHomeConfig.heroTitle}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, heroTitle: e.target.value })}
                        placeholder="Ex: ESTILO QUE RESPEITA SUA HISTÓRIA"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase font-bold">Subtítulo / Descrição</label>
                      <textarea 
                        value={localHomeConfig.heroSubtitle}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, heroSubtitle: e.target.value })}
                        placeholder="Uma breve introdução sobre a barbearia..."
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-slate-400 uppercase font-bold">URL da Imagem de Fundo</label>
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          value={localHomeConfig.bgUrl}
                          onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, bgUrl: e.target.value })}
                          placeholder="Link da imagem do Unsplash..."
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                          required
                        />
                        <div className="w-12 h-11 shrink-0 bg-slate-800 rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                          <img src={localHomeConfig.bgUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { (e.target as any).src = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=50" }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Features Settings */}
                  <div className="bg-slate-900/30 p-6 rounded-xl border border-slate-800 space-y-4">
                    <h4 className="font-bold text-gold-500 text-sm uppercase tracking-wider border-b border-slate-800 pb-2">Destaques / Vantagens</h4>
                    
                    {/* Feature 1 */}
                    <div className="space-y-2 border-b border-slate-800 pb-3">
                      <label className="text-xs text-slate-300 font-bold uppercase block">Destaque 1</label>
                      <input 
                        type="text" 
                        value={localHomeConfig.feature1Title}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, feature1Title: e.target.value })}
                        placeholder="Título do card 1"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none focus:border-gold-500"
                        required
                      />
                      <input 
                        type="text" 
                        value={localHomeConfig.feature1Desc}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, feature1Desc: e.target.value })}
                        placeholder="Descrição do card 1"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none focus:border-gold-500 mt-1"
                        required
                      />
                    </div>

                    {/* Feature 2 */}
                    <div className="space-y-2 border-b border-slate-800 pb-3">
                      <label className="text-xs text-slate-300 font-bold uppercase block">Destaque 2</label>
                      <input 
                        type="text" 
                        value={localHomeConfig.feature2Title}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, feature2Title: e.target.value })}
                        placeholder="Título do card 2"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none focus:border-gold-500"
                        required
                      />
                      <input 
                        type="text" 
                        value={localHomeConfig.feature2Desc}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, feature2Desc: e.target.value })}
                        placeholder="Descrição do card 2"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none focus:border-gold-500 mt-1"
                        required
                      />
                    </div>

                    {/* Feature 3 */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-300 font-bold uppercase block">Destaque 3</label>
                      <input 
                        type="text" 
                        value={localHomeConfig.feature3Title}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, feature3Title: e.target.value })}
                        placeholder="Título do card 3"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none focus:border-gold-500"
                        required
                      />
                      <input 
                        type="text" 
                        value={localHomeConfig.feature3Desc}
                        onChange={(e) => setLocalHomeConfig({ ...localHomeConfig, feature3Desc: e.target.value })}
                        placeholder="Descrição do card 3"
                        className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-2 text-white text-xs outline-none focus:border-gold-500 mt-1"
                        required
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-black py-3.5 px-8 rounded-xl text-sm transition-all shadow-lg shadow-gold-500/15"
                  >
                    Salvar Configurações da Home
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: PAYMENT CONFIG (FORMAS DE PAGAMENTO) */}
          {activeTab === 'pagamentos' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">Configurar Formas de Pagamento</h3>
                <p className="text-sm text-slate-400">Ative, desative ou mude os dados informados de cada meio de pagamento aceito no agendamento</p>
              </div>

              <form onSubmit={handleSavePaymentConfig} className="space-y-6">
                
                {paymentConfigSuccess && (
                  <div className="bg-green-600/10 border border-green-500/30 p-4 rounded-xl flex items-center gap-3 text-green-400 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-bold">Configurações de pagamento atualizadas com sucesso!</span>
                  </div>
                )}

                <div className="space-y-4">
                  {localPaymentMethods.map((method) => (
                    <div 
                      key={method.id}
                      className={`p-6 rounded-xl border transition-all ${
                        method.active 
                          ? 'bg-slate-900/60 border-slate-700' 
                          : 'bg-slate-950/20 border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.active ? 'bg-gold-500/10 text-gold-500' : 'bg-slate-800 text-slate-500'}`}>
                            <CreditCard className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-md">{method.name}</h4>
                            <p className="text-xs text-slate-400">Código interno: {method.id}</p>
                          </div>
                        </div>

                        {/* Custom Toggle Switch */}
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase ${method.active ? 'text-green-400' : 'text-slate-500'}`}>
                            {method.active ? 'Ativo' : 'Inativo'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentMethod(method.id)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors outline-none ${method.active ? 'bg-green-500' : 'bg-slate-700'}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow transition-transform ${method.active ? 'translate-x-6' : 'translate-x-0'}`}></div>
                          </button>
                        </div>
                      </div>

                      {method.active && (
                        <div className="space-y-4 mt-2 animate-fade-in">
                          <div className="space-y-2">
                            <label className="text-xs text-slate-400 uppercase font-bold">Informações adicionais para o cliente (chave Pix, detalhes de desconto, etc.)</label>
                            <input 
                              type="text"
                              value={method.details || ''}
                              onChange={(e) => handlePaymentDetailsChange(method.id, e.target.value)}
                              placeholder="Ex: Pix CNPJ 12345... ou Pago no local"
                              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                            />
                          </div>

                          {/* Bank database / API configuration for online payment methods */}
                          {(method.id === 'pix' || method.id === 'cartao') && (
                            <div className="mt-4 p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
                              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                <div>
                                  <h5 className="text-xs font-extrabold text-gold-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Globe className="w-4 h-4" /> Integração de API de Pagamento Online
                                  </h5>
                                  <p className="text-[10px] text-slate-400 mt-0.5">Vincule um banco para processar faturas automaticamente por API</p>
                                </div>
                                <span className="text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-bold">
                                  PRO
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[11px] text-slate-300 font-bold uppercase mb-1 ml-0.5">Selecione o Banco / Gateway</label>
                                  <select
                                    value={method.bankId || ''}
                                    onChange={(e) => handlePaymentBankChange(method.id, e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                                  >
                                    <option value="">-- Sem integração ativa (Apenas manual) --</option>
                                    {BANKS_DATABASE.map(b => (
                                      <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                  </select>
                                </div>

                                {method.bankId && (
                                  <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer mt-4 select-none">
                                      <input 
                                        type="checkbox" 
                                        checked={!!method.sandbox} 
                                        onChange={() => handlePaymentSandboxToggle(method.id)}
                                        className="rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-0 focus:ring-offset-0" 
                                      />
                                      <div>
                                        <span className="text-xs text-slate-300 font-bold block">Modo Sandbox (Homologação)</span>
                                        <span className="text-[10px] text-slate-500 block">Use para fazer pagamentos de teste sem cobrar dinheiro real</span>
                                      </div>
                                    </label>
                                  </div>
                                )}
                              </div>

                              {method.bankId && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/60 animate-fade-in">
                                  {/* Render fields dynamically based on banks requirements */}
                                  {(() => {
                                    const selectedBank = BANKS_DATABASE.find(b => b.id === method.bankId);
                                    if (!selectedBank) return null;
                                    
                                    return (
                                      <>
                                        {selectedBank.requiredFields.includes('apiKey') && (
                                          <div className="space-y-1 col-span-1">
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase ml-0.5 font-sans">Chave API / Token Privado</label>
                                            <input 
                                              type="password"
                                              value={method.apiKey || ''}
                                              onChange={(e) => handlePaymentFieldChange(method.id, 'apiKey', e.target.value)}
                                              placeholder="Ex: MP_PROD_API_KEY_abc123..."
                                              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-gold-500 font-mono"
                                            />
                                          </div>
                                        )}

                                        {selectedBank.requiredFields.includes('clientId') && (
                                          <div className="space-y-1 col-span-1">
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase ml-0.5 font-sans">Client ID / App ID</label>
                                            <input 
                                              type="text"
                                              value={method.clientId || ''}
                                              onChange={(e) => handlePaymentFieldChange(method.id, 'clientId', e.target.value)}
                                              placeholder="Ex: client_id_xyz..."
                                              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-gold-500 font-mono"
                                            />
                                          </div>
                                        )}

                                        {selectedBank.requiredFields.includes('clientSecret') && (
                                          <div className="space-y-1 col-span-1">
                                            <label className="block text-[10px] text-slate-400 font-bold uppercase ml-0.5 font-sans">Client Secret / Assinatura</label>
                                            <input 
                                              type="password"
                                              value={method.clientSecret || ''}
                                              onChange={(e) => handlePaymentFieldChange(method.id, 'clientSecret', e.target.value)}
                                              placeholder="Ex: client_secret_key_123..."
                                              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white text-xs outline-none focus:border-gold-500 font-mono"
                                            />
                                          </div>
                                        )}
                                      </>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    type="submit"
                    className="bg-gold-500 hover:bg-gold-600 text-slate-950 font-black py-3.5 px-8 rounded-xl text-sm transition-all shadow-lg shadow-gold-500/15"
                  >
                    Salvar Meios de Pagamento
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 6: NEW ADMIN (ADMINISTRADORES) */}
          {activeTab === 'admins' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-slate-800 pb-4">
                <h3 className="text-xl font-bold text-white">Cadastrar Administrador</h3>
                <p className="text-sm text-slate-400">Adicione novos membros da equipe para ter acesso total ao painel de controle</p>
              </div>

              <div className="max-w-xl bg-slate-900/40 border border-slate-800 rounded-xl p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-2 mb-4 text-white">
                  <Shield className="w-5 h-5 text-gold-500" />
                  <h4 className="font-bold">Dados do Novo Admin</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase ml-0.5">Nome Completo</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Carlos Silva"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-bold uppercase ml-0.5">Email de Acesso</label>
                    <input 
                      type="email" 
                      placeholder="Ex: carlos@barberking.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-bold uppercase ml-0.5">Senha</label>
                      <input 
                        type="password" 
                        placeholder="Mínimo 6 caracteres"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-400 font-bold uppercase ml-0.5">Confirmar Senha</label>
                      <input 
                        type="password" 
                        placeholder="Repita a senha"
                        value={newAdminConfirmPassword}
                        onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white text-sm outline-none focus:border-gold-500"
                      />
                    </div>
                  </div>
                  
                  {adminFormError && (
                    <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-fade-in">
                      <AlertCircle className="w-4 h-4" />
                      {adminFormError}
                    </div>
                  )}

                  {adminFormSuccess && (
                    <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-3 rounded-lg border border-green-500/20 animate-fade-in">
                      <Check className="w-4 h-4" />
                      {adminFormSuccess}
                    </div>
                  )}

                  <button 
                    onClick={handleRegisterAdmin}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-slate-950 font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors mt-2"
                  >
                    <UserPlus className="w-4 h-4" /> Cadastrar Administrador
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminPanel;
