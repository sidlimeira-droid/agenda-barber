import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, User as UserIcon, Scissors, Ban } from 'lucide-react';
import { Service, Barber, TimeSlot, Appointment, BlockedTime, User, PaymentMethod } from '../types';
import { SERVICES, BARBERS, TIME_SLOTS } from '../constants';

interface BookingFormProps {
  onBookingComplete: (appointment: Appointment) => void;
  existingAppointments: Appointment[];
  blockedTimes: BlockedTime[];
  currentUser: User | null;
  initialData?: { serviceId: string; barberId: string } | null;
  paymentMethods?: PaymentMethod[]; // Optional to avoid breaks
}

const BookingForm: React.FC<BookingFormProps> = ({ onBookingComplete, existingAppointments, blockedTimes, currentUser, initialData, paymentMethods = [] }) => {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string>('');

  // Set default payment method
  useEffect(() => {
    const firstActive = paymentMethods.find(m => m.active);
    if (firstActive && !selectedPaymentMethodId) {
      setSelectedPaymentMethodId(firstActive.id);
    }
  }, [paymentMethods, selectedPaymentMethodId]);

  // Initialize with initialData if provided (Reschedule flow)
  useEffect(() => {
    if (initialData) {
      const service = SERVICES.find(s => s.id === initialData.serviceId);
      const barber = BARBERS.find(b => b.id === initialData.barberId);
      
      if (service && barber) {
        setSelectedService(service);
        setSelectedBarber(barber);
        setStep(3); // Jump straight to Date/Time selection
      }
    }
  }, [initialData]);

  // Auto-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      setCustomerName(currentUser.name);
      setCustomerPhone(currentUser.phone);
    }
  }, [currentUser]);

  const handleNext = () => {
    setStep((prev) => prev + 1);
  };

  const handleConfirm = () => {
    if (selectedService && selectedBarber && selectedDate && selectedTime && customerName) {
      const newAppointment: Appointment = {
        id: Math.random().toString(36).substr(2, 9),
        serviceId: selectedService.id,
        barberId: selectedBarber.id,
        date: selectedDate,
        time: selectedTime,
        customerName,
        customerPhone,
        status: 'CONFIRMED',
        paymentMethodId: selectedPaymentMethodId
      };
      onBookingComplete(newAppointment);
    }
  };

  const renderStep1_Services = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Escolha o Serviço</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            onClick={() => setSelectedService(service)}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              selectedService?.id === service.id
                ? 'bg-slate-800 border-gold-500 ring-1 ring-gold-500'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-lg text-slate-100">{service.name}</h4>
              <span className="text-gold-400 font-bold">R$ {service.price.toFixed(2)}</span>
            </div>
            <p className="text-sm text-slate-400 mb-3">{service.description}</p>
            <div className="flex items-center text-xs text-slate-500 gap-1">
              <Clock className="w-3 h-3" />
              {service.duration} min
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button
          onClick={handleNext}
          disabled={!selectedService}
          className="bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-600 text-slate-900 font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
        >
          Próximo <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep2_Barber = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4">Escolha o Profissional</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BARBERS.map((barber) => (
          <div
            key={barber.id}
            onClick={() => setSelectedBarber(barber)}
            className={`cursor-pointer p-4 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${
              selectedBarber?.id === barber.id
                ? 'bg-slate-800 border-gold-500 ring-1 ring-gold-500'
                : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
            }`}
          >
            <img src={barber.image} alt={barber.name} className="w-20 h-20 rounded-full object-cover border-2 border-slate-600" />
            <div>
              <h4 className="font-bold text-slate-100">{barber.name}</h4>
              <p className="text-xs text-gold-500">{barber.specialty}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(1)} className="text-slate-400 hover:text-white px-4">Voltar</button>
        <button
          onClick={handleNext}
          disabled={!selectedBarber}
          className="bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gold-600 text-slate-900 font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
        >
          Próximo <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  const renderStep3_DateTime = () => {
    // Check if the whole day is blocked
    const isDayBlocked = selectedDate && selectedBarber && blockedTimes.some(b => 
        b.barberId === selectedBarber.id && 
        b.date === selectedDate && 
        b.time === 'ALL_DAY'
    );

    const getSlotStatus = (time: string) => {
        if (!selectedDate || !selectedBarber) return 'available';
        
        // Check if day is blocked
        if (isDayBlocked) return 'blocked';

        // Check if specific time is blocked
        const isTimeBlocked = blockedTimes.some(b => 
            b.barberId === selectedBarber.id && 
            b.date === selectedDate && 
            b.time === time
        );
        if (isTimeBlocked) return 'blocked';

        // Check if already booked (active appointment)
        const isBooked = existingAppointments.some(a => 
            a.barberId === selectedBarber.id && 
            a.date === selectedDate && 
            a.time === time && 
            a.status !== 'CANCELLED'
        );
        if (isBooked) return 'booked';

        return 'available';
    };

    return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white mb-4">Data e Hora</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Selecione a Data</label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime(''); // Reset time when date changes
          }}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-300">Horários Disponíveis</label>
        
        {isDayBlocked ? (
             <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-center text-red-300 flex items-center justify-center gap-2">
                <Ban className="w-5 h-5" />
                <span>O profissional não está disponível nesta data.</span>
             </div>
        ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {TIME_SLOTS.map((time) => {
                const status = getSlotStatus(time);
                const isAvailable = status === 'available';
                
                return (
                    <button
                    key={time}
                    disabled={!isAvailable}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2 px-1 rounded-md text-sm font-medium transition-colors border ${
                        selectedTime === time
                        ? 'bg-gold-500 text-slate-900 border-gold-500'
                        : isAvailable
                            ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            : 'bg-slate-800/50 text-slate-600 border-transparent cursor-not-allowed decoration-slate-600'
                    }`}
                    >
                    <span className={status !== 'available' ? 'line-through' : ''}>{time}</span>
                    </button>
                );
            })}
            </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-700">
        <h4 className="text-lg font-semibold text-white">Seus Dados</h4>
        <input
          type="text"
          placeholder="Seu Nome Completo"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          readOnly={!!currentUser}
          className={`w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none placeholder-slate-500 ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
         <input
          type="tel"
          placeholder="Seu Telefone (opcional)"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
          readOnly={!!currentUser}
          className={`w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-gold-500 outline-none placeholder-slate-500 ${currentUser ? 'opacity-70 cursor-not-allowed' : ''}`}
        />
        {currentUser && (
            <p className="text-xs text-slate-500">Logado como: {currentUser.name}</p>
        )}
      </div>

      {/* Dynamic Payment Method Selection */}
      {paymentMethods && paymentMethods.filter(m => m.active).length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-700 animate-fade-in">
          <h4 className="text-lg font-semibold text-white">Forma de Pagamento</h4>
          <p className="text-xs text-slate-400">Selecione como deseja realizar o pagamento no local ou via Pix:</p>
          <div className="grid grid-cols-1 gap-2">
            {paymentMethods
              .filter(m => m.active)
              .map((method) => (
                <div
                  key={method.id}
                  onClick={() => setSelectedPaymentMethodId(method.id)}
                  className={`cursor-pointer p-3 rounded-lg border transition-all flex flex-col ${
                    selectedPaymentMethodId === method.id
                      ? 'bg-slate-800 border-gold-500 ring-1 ring-gold-500'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-200 text-sm">{method.name}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethodId === method.id ? 'border-gold-500 bg-gold-500' : 'border-slate-600'
                    }`}>
                      {selectedPaymentMethodId === method.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-900"></div>
                      )}
                    </div>
                  </div>
                  {method.details && (
                    <p className="text-xs text-slate-400 mt-1 pl-0.5">{method.details}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(step - 1)} className="text-slate-400 hover:text-white px-4">Voltar</button>
        <button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || !customerName || isDayBlocked}
          className="bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-green-900/20"
        >
          Confirmar Agendamento <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )};

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
      <div className="bg-slate-950 p-4 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-gold-500">
          <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-gold-500 bg-gold-500 text-slate-900' : 'border-slate-600 text-slate-600'} font-bold`}>1</span>
          <div className={`h-1 w-8 ${step >= 2 ? 'bg-gold-500' : 'bg-slate-700'}`}></div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-gold-500 bg-gold-500 text-slate-900' : 'border-slate-600 text-slate-600'} font-bold`}>2</span>
          <div className={`h-1 w-8 ${step >= 3 ? 'bg-gold-500' : 'bg-slate-700'}`}></div>
          <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-gold-500 bg-gold-500 text-slate-900' : 'border-slate-600 text-slate-600'} font-bold`}>3</span>
        </div>
        <div className="text-sm text-slate-400">
          Passo {step} de 3
        </div>
      </div>
      
      <div className="p-6 md:p-8">
        {step === 1 && renderStep1_Services()}
        {step === 2 && renderStep2_Barber()}
        {step === 3 && renderStep3_DateTime()}
      </div>
    </div>
  );
};

export default BookingForm;