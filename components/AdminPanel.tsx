import React, { useState } from 'react';
import { Appointment, AppointmentStatus, BlockedTime, AppNotification } from '../types';
import { SERVICES, BARBERS, TIME_SLOTS } from '../constants';
import { DollarSign, Users, CalendarDays, Check, Trash2, Ban, Lock, Bell, Filter, Shield, UserPlus, AlertCircle, Download } from 'lucide-react';

interface AdminPanelProps {
  appointments: Appointment[];
  blockedTimes: BlockedTime[];
  notifications: AppNotification[];
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onBlockTime: (block: BlockedTime) => void;
  onUnblockTime: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ appointments, blockedTimes, notifications, onUpdateStatus, onBlockTime, onUnblockTime }) => {
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
      // Reset form slightly but keep date for convenience
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

    // Password Confirmation Logic
    if (newAdminPassword !== newAdminConfirmPassword) {
      setAdminFormError('As senhas não coincidem.');
      return;
    }

    // Mock Success
    setAdminFormSuccess(`Admin ${newAdminName} cadastrado com sucesso!`);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setNewAdminConfirmPassword('');
    
    // Clear success message after 3 seconds
    setTimeout(() => setAdminFormSuccess(''), 3000);
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

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Painel Administrativo</h2>
          <p className="text-slate-400">Visão geral da barbearia</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Data de hoje</p>
          <p className="text-xl font-bold text-gold-500">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded-full">
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Faturamento Estimado</p>
            <h3 className="text-2xl font-bold text-white">R$ {totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-full">
            <CalendarDays className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Agendados</p>
            <h3 className="text-2xl font-bold text-white">{pendingAppointments}</h3>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-gold-500/10 rounded-full">
            <Users className="w-8 h-8 text-gold-500" />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium">Atendimentos Realizados</p>
            <h3 className="text-2xl font-bold text-white">{completedAppointments}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Management (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
            {/* Blocking Management Section */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-red-400">
                        <Ban className="w-5 h-5" />
                        <h3 className="text-lg font-bold text-white">Bloquear Horário / Folga</h3>
                    </div>
                </div>
            
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Profissional</label>
                        <select 
                            value={blockBarberId}
                            onChange={(e) => setBlockBarberId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1 text-sm"
                        >
                            {BARBERS.map(b => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Data</label>
                        <input 
                            type="date"
                            value={blockDate}
                            onChange={(e) => setBlockDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1 text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold">Horário</label>
                        <div className="flex gap-2">
                             <select 
                                value={blockTime}
                                onChange={(e) => setBlockTime(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white mt-1 text-sm"
                            >
                                <option value="ALL_DAY">Dia Inteiro (Folga)</option>
                                {TIME_SLOTS.map(t => (
                                <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            <button 
                                onClick={handleAddBlock}
                                disabled={!blockDate}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg px-3 mt-1 disabled:opacity-50"
                                title="Bloquear"
                            >
                                <Lock className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                 {/* Active Blocks Mini List */}
                 {blockedTimes.length > 0 && (
                     <div className="mt-4 pt-4 border-t border-slate-700">
                        <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Bloqueios Ativos</p>
                        <div className="flex flex-wrap gap-2">
                            {blockedTimes.map(block => (
                                <span key={block.id} className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300">
                                    {BARBERS.find(b => b.id === block.barberId)?.name.split(' ')[0]} • 
                                    {new Date(block.date).toLocaleDateString('pt-BR').slice(0,5)} • 
                                    {block.time === 'ALL_DAY' ? 'Folga' : block.time}
                                    <button onClick={() => onUnblockTime(block.id)} className="ml-1 text-red-400 hover:text-red-300"><Trash2 className="w-3 h-3" /></button>
                                </span>
                            ))}
                        </div>
                     </div>
                 )}
            </div>

             {/* Appointment Table with Date Filter */}
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h3 className="text-xl font-bold text-white">Agenda</h3>
                    
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={handleExportCSV}
                          disabled={filteredAppointments.length === 0}
                          className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/50 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Exportar CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                          CSV
                        </button>

                        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-700">
                            <div className="px-3 text-slate-400">
                                <Filter className="w-4 h-4" />
                            </div>
                            <input 
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="bg-transparent text-white text-sm outline-none p-1"
                            />
                            {filterDate && (
                                <button onClick={() => setFilterDate('')} className="text-xs text-slate-500 hover:text-white px-2">
                                    Limpar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium">Horário</th>
                        <th className="p-4 font-medium">Info</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-right">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                    {filteredAppointments.length === 0 ? (
                        <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">
                            {filterDate ? 'Nenhum agendamento para esta data.' : 'Nenhum agendamento encontrado.'}
                        </td>
                        </tr>
                    ) : (
                        filteredAppointments.sort((a,b) => a.time.localeCompare(b.time)).map((app) => {
                        const service = SERVICES.find(s => s.id === app.serviceId);
                        const barber = BARBERS.find(b => b.id === app.barberId);
                        
                        return (
                            <tr key={app.id} className="hover:bg-slate-700/30 transition-colors">
                            <td className="p-4 align-top">
                                <div className="flex flex-col">
                                <span className="font-bold text-white text-lg">{app.time}</span>
                                {(!filterDate || filterDate !== app.date) && (
                                    <span className="text-xs text-slate-500">{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                                )}
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="font-medium text-slate-200">{app.customerName}</div>
                                <div className="text-xs text-gold-500 mb-1">{service?.name}</div>
                                <div className="text-xs text-slate-500 flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {barber?.name}
                                </div>
                            </td>
                            <td className="p-4 align-top">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(app.status)}`}>
                                {getStatusLabel(app.status)}
                                </span>
                            </td>
                            <td className="p-4 align-top">
                                <div className="flex justify-end gap-2">
                                {app.status === 'CONFIRMED' && (
                                    <>
                                    <button 
                                        onClick={() => onUpdateStatus(app.id, 'COMPLETED')}
                                        title="Concluir"
                                        className="p-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                    >
                                        <Check className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => onUpdateStatus(app.id, 'CANCELLED')}
                                        title="Cancelar"
                                        className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    </>
                                )}
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

        {/* Right Column: Create Admin & Notifications (1/3 width) */}
        <div className="space-y-6">
             {/* New Admin Form */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4 text-white">
                    <Shield className="w-5 h-5 text-gold-500" />
                    <h3 className="text-lg font-bold">Novo Administrador</h3>
                </div>
                
                <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Nome"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                    />
                    <input 
                      type="email" 
                      placeholder="Email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                    />
                    <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="password" 
                          placeholder="Senha"
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                        />
                         <input 
                          type="password" 
                          placeholder="Confirmar"
                          value={newAdminConfirmPassword}
                          onChange={(e) => setNewAdminConfirmPassword(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm"
                        />
                    </div>
                    
                    {adminFormError && (
                      <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded">
                        <AlertCircle className="w-3 h-3" />
                        {adminFormError}
                      </div>
                    )}

                    {adminFormSuccess && (
                      <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-2 rounded">
                        <Check className="w-3 h-3" />
                        {adminFormSuccess}
                      </div>
                    )}

                    <button 
                      onClick={handleRegisterAdmin}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 mt-2"
                    >
                      <UserPlus className="w-4 h-4" /> Cadastrar
                    </button>
                </div>
             </div>

             {/* Notifications */}
             <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 flex flex-col h-[400px]">
                <div className="flex items-center gap-2 mb-4 text-gold-500 border-b border-slate-700 pb-4">
                    <Bell className="w-5 h-5" />
                    <h3 className="text-lg font-bold text-white">Atividades Recentes</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {notifications.length === 0 ? (
                        <p className="text-slate-500 text-sm text-center py-4">Nenhuma atividade recente.</p>
                    ) : (
                        notifications.map((notif) => (
                            <div key={notif.id} className="bg-slate-900/50 p-3 rounded-lg border-l-2 border-slate-700 animate-fade-in relative">
                                <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                                    notif.type === 'success' ? 'bg-green-500' : 
                                    notif.type === 'error' ? 'bg-red-500' :
                                    notif.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}></div>
                                <p className="text-sm text-slate-200 ml-2">{notif.message}</p>
                                <p className="text-xs text-slate-500 ml-2 mt-1">
                                    {new Date(notif.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;