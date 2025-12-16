import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import AIStylist from './components/AIStylist';
import AdminPanel from './components/AdminPanel';
import ClientLogin from './components/ClientLogin';
import ClientDashboard from './components/ClientDashboard';
import { AppView, Appointment, AppointmentStatus, BlockedTime, AppNotification, User } from './types';
import { SERVICES, BARBERS } from './constants';
import { Scissors, CalendarCheck, Clock, CheckCircle } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  
  // Initialize with some dummy data for the Admin Panel demonstration
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: 'mock1',
      serviceId: '1',
      barberId: 'b1',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      customerName: 'Roberto Silva',
      customerPhone: '11999999999',
      status: 'CONFIRMED'
    },
    {
      id: 'mock2',
      serviceId: '3',
      barberId: 'b2',
      date: new Date().toISOString().split('T')[0],
      time: '10:00',
      customerName: 'Fernando Costa',
      customerPhone: '11988888888',
      status: 'COMPLETED'
    },
     {
      id: 'mock3',
      serviceId: '2',
      barberId: 'b3',
      date: new Date().toISOString().split('T')[0],
      time: '16:00',
      customerName: 'Lucas Pereira',
      customerPhone: '11977777777',
      status: 'CONFIRMED'
    }
  ]);
  
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for rescheduling
  const [rescheduleData, setRescheduleData] = useState<{ serviceId: string; barberId: string } | null>(null);

  const addNotification = (message: string, type: AppNotification['type']) => {
    const newNote: AppNotification = {
      id: Date.now().toString(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const handleBookingComplete = (appointment: Appointment) => {
    setAppointments([...appointments, appointment]);
    addNotification(`Novo agendamento: ${appointment.customerName} às ${appointment.time}`, 'success');
    
    // Automatically log in the user if not logged in
    if (!currentUser) {
        setCurrentUser({
            name: appointment.customerName,
            phone: appointment.customerPhone
        });
    }

    // Clear reschedule data
    setRescheduleData(null);

    setShowSuccessModal(true);
    // Return to home after a delay or user interaction
    setTimeout(() => {
        setShowSuccessModal(false);
        setCurrentView(AppView.MY_APPOINTMENTS);
    }, 3000);
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => 
      app.id === id ? { ...app, status } : app
    ));
    
    const app = appointments.find(a => a.id === id);
    if (app) {
      const msg = status === 'CANCELLED' 
        ? `Agendamento cancelado: ${app.customerName}` 
        : `Agendamento concluído: ${app.customerName}`;
      addNotification(msg, status === 'CANCELLED' ? 'error' : 'info');
    }
  };

  const handleBlockTime = (block: BlockedTime) => {
    setBlockedTimes([...blockedTimes, block]);
    addNotification('Novo bloqueio de agenda realizado', 'warning');
  };

  const handleUnblockTime = (id: string) => {
    setBlockedTimes(prev => prev.filter(b => b.id !== id));
    addNotification('Bloqueio de agenda removido', 'info');
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleClientCancel = (id: string) => {
     handleUpdateStatus(id, 'CANCELLED');
  };

  const handleReschedule = (appointment: Appointment) => {
    // We do not cancel the old appointment immediately, only when the new one is confirmed (if desired)
    // Or we simply start a new booking with the same data.
    // The user manually cancels the old one or we could automate it.
    // For this flow, let's just pre-fill a new booking. The user can cancel the old one separately or we assume they want a new one.
    // If we want to move/update, we'd need an update logic, but "Reschedule" often implies "Book new, cancel old".
    // Let's just pre-fill for now as requested.
    setRescheduleData({
      serviceId: appointment.serviceId,
      barberId: appointment.barberId
    });
    setCurrentView(AppView.BOOKING);
  };

  const renderHome = () => (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6">
          <div className="inline-block border border-gold-500 text-gold-500 px-4 py-1 rounded-full text-sm font-semibold tracking-wider uppercase mb-4">
            Desde 2015
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight">
            ESTILO QUE <span className="text-gold-500">RESPEITA</span><br />SUA HISTÓRIA
          </h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            A união perfeita entre a barbearia clássica e a tecnologia moderna. Agende seu horário ou use nossa IA para descobrir seu novo visual.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button 
                onClick={() => setCurrentView(AppView.BOOKING)}
                className="bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold py-4 px-8 rounded-lg text-lg transition-transform hover:scale-105"
            >
              Agendar Agora
            </button>
            <button 
                onClick={() => setCurrentView(AppView.AI_STYLIST)}
                className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 font-bold py-4 px-8 rounded-lg text-lg transition-colors flex items-center justify-center gap-2"
            >
              <Scissors className="w-5 h-5" /> Consultoria IA
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors">
          <Scissors className="w-10 h-10 text-gold-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Profissionais de Elite</h3>
          <p className="text-slate-400">Nossa equipe é formada por barbeiros premiados com vasta experiência em cortes clássicos e modernos.</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors">
          <Clock className="w-10 h-10 text-gold-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Sem Filas</h3>
          <p className="text-slate-400">Respeitamos seu tempo. Com nosso sistema de agendamento inteligente, você é atendido na hora marcada.</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors">
          <CheckCircle className="w-10 h-10 text-gold-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Produtos Premium</h3>
          <p className="text-slate-400">Utilizamos apenas produtos de alta qualidade para garantir a saúde do seu cabelo e barba.</p>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-gold-500 selection:text-white">
      <Navbar currentView={currentView} onChangeView={(view) => {
          // Clear reschedule data when manually changing views to avoid stale state
          setRescheduleData(null);
          setCurrentView(view);
      }} />
      
      <main className="pt-6">
        {currentView === AppView.HOME && renderHome()}
        
        {currentView === AppView.BOOKING && (
          <div className="px-4 pb-20">
             <div className="text-center mb-10">
               <h2 className="text-3xl font-bold text-white">Agende seu Horário</h2>
               <p className="text-slate-400 mt-2">Simples, rápido e no seu tempo.</p>
             </div>
             <BookingForm 
                onBookingComplete={handleBookingComplete} 
                existingAppointments={appointments}
                blockedTimes={blockedTimes}
                currentUser={currentUser}
                initialData={rescheduleData}
             />
          </div>
        )}
        
        {currentView === AppView.AI_STYLIST && (
           <div className="pb-20">
             <AIStylist />
           </div>
        )}
        
        {currentView === AppView.MY_APPOINTMENTS && (
            <div className="pb-20">
                {currentUser ? (
                    <ClientDashboard 
                        user={currentUser}
                        appointments={appointments}
                        onLogout={handleLogout}
                        onCancelAppointment={handleClientCancel}
                        onReschedule={handleReschedule}
                        onNewBooking={() => {
                            setRescheduleData(null);
                            setCurrentView(AppView.BOOKING);
                        }}
                    />
                ) : (
                    <ClientLogin 
                        onLogin={handleLogin}
                        appointments={appointments}
                    />
                )}
            </div>
        )}

        {currentView === AppView.ADMIN && (
          <div className="pb-20">
            <AdminPanel 
              appointments={appointments} 
              blockedTimes={blockedTimes}
              notifications={notifications}
              onUpdateStatus={handleUpdateStatus} 
              onBlockTime={handleBlockTime}
              onUnblockTime={handleUnblockTime}
            />
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-gold-500 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-in">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Agendado com Sucesso!</h3>
            <p className="text-slate-300">Te esperamos na barbearia. Redirecionando...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;