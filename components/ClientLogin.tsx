import React, { useState } from 'react';
import { User, Appointment } from '../types';
import { Smartphone, User as UserIcon, ArrowRight, Scissors } from 'lucide-react';

interface ClientLoginProps {
  onLogin: (user: User) => void;
  appointments: Appointment[];
}

const ClientLogin: React.FC<ClientLoginProps> = ({ onLogin, appointments }) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'NAME'>('PHONE');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 8) return;

    // Check if user exists in previous appointments
    const existingApp = appointments.find(a => a.customerPhone === phone);
    
    if (existingApp) {
      // User exists, log them in
      onLogin({
        name: existingApp.customerName,
        phone: existingApp.customerPhone
      });
    } else {
      // New user, ask for name
      setIsNewUser(true);
      setStep('NAME');
    }
  };

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onLogin({
      name,
      phone
    });
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gold-500/30">
          <Scissors className="w-8 h-8 text-gold-500" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Área do Cliente</h2>
        <p className="text-slate-400 mb-8">
          {step === 'PHONE' 
            ? 'Digite seu celular para acessar seus agendamentos.' 
            : 'Como podemos te chamar?'}
        </p>

        {step === 'PHONE' ? (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="relative text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Celular</label>
              <div className="relative mt-1">
                <Smartphone className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="tel"
                  placeholder="DDD + Número"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 outline-none placeholder-slate-600 font-mono text-lg"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={phone.length < 8}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Continuar <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleNameSubmit} className="space-y-4 animate-fade-in">
             <div className="relative text-left">
              <label className="text-xs font-bold text-slate-500 uppercase ml-1">Seu Nome</label>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 outline-none placeholder-slate-600"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full bg-gold-500 hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              Acessar Área do Cliente <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              type="button"
              onClick={() => setStep('PHONE')}
              className="text-slate-500 hover:text-white text-sm underline"
            >
              Voltar e alterar telefone
            </button>
          </form>
        )}
      </div>
      <p className="text-center text-slate-500 text-xs mt-6">
        Seus dados são utilizados apenas para identificação e contato sobre seus agendamentos.
      </p>
    </div>
  );
};

export default ClientLogin;