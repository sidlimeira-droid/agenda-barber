import React from 'react';
import { User, Appointment, AppointmentStatus } from '../types';
import { SERVICES, BARBERS } from '../constants';
import { Calendar, Clock, LogOut, Scissors, User as UserIcon, CalendarCheck, AlertCircle, XCircle, RefreshCw } from 'lucide-react';

interface ClientDashboardProps {
  user: User;
  appointments: Appointment[];
  onLogout: () => void;
  onCancelAppointment: (id: string) => void;
  onReschedule: (appointment: Appointment) => void;
  onNewBooking: () => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user, appointments, onLogout, onCancelAppointment, onReschedule, onNewBooking }) => {
  // Filter appointments for this user
  const userAppointments = appointments
    .filter(app => app.customerPhone === user.phone)
    .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());

  const upcomingAppointments = userAppointments.filter(
    app => app.status === 'CONFIRMED' && new Date(app.date + 'T' + app.time) >= new Date()
  );

  const pastAppointments = userAppointments.filter(
    app => app.status !== 'CONFIRMED' || new Date(app.date + 'T' + app.time) < new Date()
  ).reverse(); // Most recent first

  const getStatusConfig = (status: AppointmentStatus) => {
    switch (status) {
      case 'CONFIRMED': return { label: 'Confirmado', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
      case 'COMPLETED': return { label: 'Concluído', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/30' };
      case 'CANCELLED': return { label: 'Cancelado', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' };
      default: return { label: status, color: 'text-slate-400', bg: 'bg-slate-800' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center border-2 border-gold-500">
            <UserIcon className="w-8 h-8 text-gold-500" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Olá, {user.name.split(' ')[0]}</h2>
            <p className="text-slate-400">{user.phone}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors px-4 py-2 rounded-lg hover:bg-slate-800"
        >
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column: Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-gold-500" /> Próximos Cortes
             </h3>
             <button 
               onClick={onNewBooking}
               className="text-sm font-bold text-gold-500 hover:text-gold-400 hover:underline"
             >
               + Novo Agendamento
             </button>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center border-dashed">
              <Scissors className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 font-medium mb-2">Nada agendado por enquanto.</p>
              <p className="text-slate-500 text-sm mb-6">Que tal dar um tapa no visual?</p>
              <button 
                onClick={onNewBooking}
                className="bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold py-2 px-6 rounded-lg transition-colors"
              >
                Agendar Agora
              </button>
            </div>
          ) : (
            upcomingAppointments.map(app => {
              const service = SERVICES.find(s => s.id === app.serviceId);
              const barber = BARBERS.find(b => b.id === app.barberId);
              
              return (
                <div key={app.id} className="bg-gradient-to-r from-slate-800 to-slate-800/50 rounded-xl p-6 border border-gold-500/30 shadow-lg relative overflow-hidden group hover:border-gold-500 transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Scissors className="w-32 h-32 text-gold-500 rotate-12" />
                  </div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded border border-green-500/30 uppercase tracking-wide">
                          Confirmado
                        </span>
                        <span className="text-slate-500 text-xs">#{app.id}</span>
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-1">{service?.name}</h4>
                      <p className="text-slate-300 flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-gold-500" /> {barber?.name}
                      </p>
                    </div>

                    <div className="flex flex-col justify-center items-start md:items-end gap-1 min-w-[120px]">
                       <div className="flex items-center gap-2 text-xl font-bold text-white">
                          <Clock className="w-5 h-5 text-gold-500" /> {app.time}
                       </div>
                       <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" /> {new Date(app.date).toLocaleDateString('pt-BR')}
                       </div>
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/50 flex flex-wrap justify-between items-center gap-3">
                     <span className="text-white font-bold text-lg">R$ {service?.price.toFixed(2)}</span>
                     <div className="flex gap-3">
                         <button 
                           onClick={() => onReschedule(app)}
                           className="text-gold-500 hover:text-gold-400 text-sm flex items-center gap-1 hover:underline font-medium"
                         >
                           <RefreshCw className="w-4 h-4" /> Reagendar
                         </button>
                         <button 
                           onClick={() => onCancelAppointment(app.id)}
                           className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 hover:underline"
                         >
                           <XCircle className="w-4 h-4" /> Cancelar
                         </button>
                     </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar: History */}
        <div className="space-y-6">
           <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-500" /> Histórico
           </h3>
           
           <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden max-h-[500px] overflow-y-auto custom-scrollbar">
             {pastAppointments.length === 0 ? (
               <div className="p-8 text-center text-slate-500 text-sm">
                 Seu histórico aparecerá aqui.
               </div>
             ) : (
               <div className="divide-y divide-slate-700">
                 {pastAppointments.map(app => {
                    const statusConfig = getStatusConfig(app.status);
                    const service = SERVICES.find(s => s.id === app.serviceId);
                    
                    return (
                      <div key={app.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-200 text-sm">{new Date(app.date).toLocaleDateString('pt-BR')}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold border ${statusConfig.bg} ${statusConfig.color}`}>
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-slate-300 font-medium text-sm truncate">{service?.name}</p>
                        <p className="text-slate-500 text-xs mt-1">com {BARBERS.find(b => b.id === app.barberId)?.name}</p>
                      </div>
                    );
                 })}
               </div>
             )}
           </div>
           
           <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-gold-500 shrink-0 mt-0.5" />
             <p className="text-xs text-slate-400 leading-relaxed">
               Para alterar dados cadastrais ou relatar problemas com atendimentos passados, por favor entre em contato diretamente na barbearia.
             </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default ClientDashboard;