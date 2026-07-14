import React, { useState } from 'react';
import Navbar from './components/Navbar';
import BookingForm from './components/BookingForm';
import AIStylist from './components/AIStylist';
import AdminPanel from './components/AdminPanel';
import ClientLogin from './components/ClientLogin';
import ClientDashboard from './components/ClientDashboard';
import { AppView, Appointment, AppointmentStatus, BlockedTime, AppNotification, User, HomepageConfig, PaymentMethod } from './types';
import { SERVICES, BARBERS } from './constants';
import { Scissors, CalendarCheck, Clock, CheckCircle, MapPin } from 'lucide-react';

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current text-green-500 inline-block mr-1" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.008c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const getWhatsAppLink = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 || digits.length === 10) {
    return `https://wa.me/55${digits}`;
  }
  return `https://wa.me/${digits}`;
};

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

  // Home Page Settings State
  const [homepageConfig, setHomepageConfig] = useState<HomepageConfig>(() => {
    const saved = localStorage.getItem('barberking_home_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      heroTitle: 'ESTILO QUE\nRESPEITA SUA HISTÓRIA',
      heroSubtitle: 'A união perfeita entre a barbearia clássica e a tecnologia moderna. Agende seu horário ou use nossa IA para descobrir seu novo visual.',
      tagline: 'Desde 2015',
      bgUrl: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80',
      feature1Title: 'Profissionais de Elite',
      feature1Desc: 'Nossa equipe é formada por barbeiros premiados com vasta experiência em cortes clássicos e modernos.',
      feature2Title: 'Sem Filas',
      feature2Desc: 'Respeitamos seu tempo. Com nosso sistema de agendamento inteligente, você é atendido na hora marcada.',
      feature3Title: 'Produtos Premium',
      feature3Desc: 'Utilizamos apenas produtos de alta qualidade para garantir a saúde do seu cabelo e barba.',
      salonLogoUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=150&q=80',
      salonName: 'BarberKing',
      salonAddress: 'Av. Herculano Bandeira, 513 - Pina, Recife - PE',
      salonWhatsApp: '81 99401-1440',
    };
  });

  // Payment Methods Configuration State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(() => {
    const saved = localStorage.getItem('barberking_payment_methods');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      { id: 'pix', name: 'PIX', active: true, details: 'Chave CNPJ: 12.345.678/0001-90 (BarberKing Ltda)' },
      { id: 'cartao', name: 'Cartão de Crédito/Débito', active: true, details: 'Pago diretamente no balcão' },
      { id: 'dinheiro', name: 'Dinheiro', active: true, details: 'Desconto de 5% se pago em dinheiro' },
    ];
  });

  const handleUpdateHomepageConfig = (config: HomepageConfig) => {
    setHomepageConfig(config);
    localStorage.setItem('barberking_home_config', JSON.stringify(config));
    addNotification('Página inicial configurada com sucesso', 'success');
  };

  const handleUpdatePaymentMethods = (methods: PaymentMethod[]) => {
    setPaymentMethods(methods);
    localStorage.setItem('barberking_payment_methods', JSON.stringify(methods));
    addNotification('Formas de pagamento atualizadas', 'info');
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
    addNotification('Agendamento excluído do sistema', 'error');
  };

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
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-500"
          style={{ backgroundImage: `url('${homepageConfig.bgUrl}')` }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent"></div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto space-y-6 animate-fade-in">
          <div className="inline-block border border-gold-500 text-gold-500 px-4 py-1 rounded-full text-sm font-semibold tracking-wider uppercase mb-4">
            {homepageConfig.tagline}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase whitespace-pre-line">
            {homepageConfig.heroTitle}
          </h1>
          <p className="text-md md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {homepageConfig.heroSubtitle}
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
          <h3 className="text-xl font-bold text-white mb-2">{homepageConfig.feature1Title}</h3>
          <p className="text-slate-400">{homepageConfig.feature1Desc}</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors">
          <Clock className="w-10 h-10 text-gold-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{homepageConfig.feature2Title}</h3>
          <p className="text-slate-400">{homepageConfig.feature2Desc}</p>
        </div>
        <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-gold-500/50 transition-colors">
          <CheckCircle className="w-10 h-10 text-gold-500 mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">{homepageConfig.feature3Title}</h3>
          <p className="text-slate-400">{homepageConfig.feature3Desc}</p>
        </div>
      </section>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 font-sans selection:bg-gold-500 selection:text-white">
      <Navbar currentView={currentView} homepageConfig={homepageConfig} onChangeView={(view) => {
          // Clear reschedule data when manually changing views to avoid stale state
          setRescheduleData(null);
          setCurrentView(view);
      }} />
      
      <main className="pt-6 flex-grow">
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
                paymentMethods={paymentMethods}
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
              homepageConfig={homepageConfig}
              onUpdateHomepageConfig={handleUpdateHomepageConfig}
              paymentMethods={paymentMethods}
              onUpdatePaymentMethods={handleUpdatePaymentMethods}
              onUpdateStatus={handleUpdateStatus} 
              onDeleteAppointment={handleDeleteAppointment}
              onBlockTime={handleBlockTime}
              onUnblockTime={handleUnblockTime}
            />
          </div>
        )}
      </main>

      <footer className="w-full bg-slate-950 border-t border-slate-800/60 py-6 text-center mt-auto" id="app-footer">
        <div className="max-w-6xl mx-auto px-4 space-y-2.5 text-xs text-slate-400">
          <p>© {homepageConfig.salonName || "BarberKing"} - Todos os direitos reservados 2026</p>
          
          {homepageConfig.salonAddress && (
            <div className="text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-center gap-1">
              <span>{homepageConfig.salonAddress}</span>
              <span className="hidden sm:inline text-slate-700">•</span>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(homepageConfig.salonAddress)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gold-500 hover:underline hover:text-gold-400 transition-colors font-medium flex items-center gap-1 justify-center"
              >
                <MapPin className="w-3.5 h-3.5 text-gold-500" /> Como chegar
              </a>
            </div>
          )}

          <p className="text-slate-500">
            Desenvolvido por <span className="text-gold-500 font-semibold">Sidney Limeira</span>
          </p>
          
          {homepageConfig.salonWhatsApp && (
            <div className="pt-1">
              <a 
                href={getWhatsAppLink(homepageConfig.salonWhatsApp)} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-full text-[11px] text-slate-300 hover:text-green-400 transition-all font-mono shadow-sm"
              >
                <WhatsAppIcon />
                <span>{homepageConfig.salonWhatsApp}</span>
              </a>
            </div>
          )}
        </div>
      </footer>

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