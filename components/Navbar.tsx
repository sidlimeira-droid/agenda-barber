import React from 'react';
import { Scissors, User, Calendar, Sparkles, Lock } from 'lucide-react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: AppView.HOME, label: 'Início', icon: <Scissors className="w-5 h-5" /> },
    { view: AppView.BOOKING, label: 'Agendar', icon: <Calendar className="w-5 h-5" /> },
    { view: AppView.AI_STYLIST, label: 'IA Stylist', icon: <Sparkles className="w-5 h-5 text-gold-400" /> },
    { view: AppView.MY_APPOINTMENTS, label: 'Área do Cliente', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onChangeView(AppView.HOME)}>
            <div className="bg-gold-500 p-1.5 rounded-lg">
              <Scissors className="text-slate-900 w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">BARBER<span className="text-gold-500">KING</span></span>
          </div>

          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  currentView === item.view
                    ? 'text-gold-500'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            {/* Admin Link - Distinctive */}
            <button
                onClick={() => onChangeView(AppView.ADMIN)}
                className={`flex items-center gap-2 text-sm font-medium transition-colors ml-4 border-l border-slate-700 pl-6 ${
                  currentView === AppView.ADMIN
                    ? 'text-red-400'
                    : 'text-slate-500 hover:text-red-400'
                }`}
              >
                <Lock className="w-4 h-4" />
                Admin
              </button>
          </div>

          {/* Mobile Menu Icon would go here (simplified for this demo) */}
        </div>
      </div>
      
      {/* Mobile Bottom Bar for easy access */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950 border-t border-slate-800 pb-safe z-50">
        <div className="flex justify-around py-3">
           {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => onChangeView(item.view)}
                className={`flex flex-col items-center gap-1 text-xs font-medium ${
                  currentView === item.view
                    ? 'text-gold-500'
                    : 'text-slate-500'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
             <button
                onClick={() => onChangeView(AppView.ADMIN)}
                className={`flex flex-col items-center gap-1 text-xs font-medium ${
                  currentView === AppView.ADMIN
                    ? 'text-red-400'
                    : 'text-slate-600'
                }`}
              >
                <Lock className="w-4 h-4" />
                Admin
              </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;