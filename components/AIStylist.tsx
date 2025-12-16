import React, { useState } from 'react';
import { Sparkles, Send, Loader2, UserRound } from 'lucide-react';
import { getStyleAdvice } from '../services/geminiService';

const AIStylist: React.FC = () => {
  const [input, setInput] = useState('');
  const [advice, setAdvice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConsultation = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    setAdvice('');
    
    const result = await getStyleAdvice(input);
    
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-full mb-4 ring-1 ring-gold-500/50">
          <Sparkles className="w-8 h-8 text-gold-500" />
        </div>
        <h2 className="text-3xl font-bold text-white">Consultor de Estilo IA</h2>
        <p className="text-slate-400">
          Não sabe qual corte combina com você? Descreva seu rosto, tipo de cabelo e estilo, e nossa IA especialista recomendará o visual perfeito.
        </p>
      </div>

      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700 shadow-xl">
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Descreva suas características
        </label>
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ex: Tenho rosto redondo, cabelo liso e curto. Gosto de estilos modernos mas práticos para o trabalho..."
            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-200 focus:ring-2 focus:ring-gold-500 focus:border-transparent resize-none placeholder-slate-600"
          />
          <button
            onClick={handleConsultation}
            disabled={loading || !input.trim()}
            className="absolute bottom-3 right-3 bg-gold-500 hover:bg-gold-600 text-slate-900 font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Consultar
          </button>
        </div>
      </div>

      {advice && (
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border-l-4 border-gold-500 shadow-2xl animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="bg-slate-700 p-2 rounded-full hidden sm:block">
              <UserRound className="w-6 h-6 text-gold-400" />
            </div>
            <div className="space-y-4 w-full">
              <h3 className="text-xl font-bold text-gold-400">Sugestão do Mestre</h3>
              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line">
                {advice}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStylist;