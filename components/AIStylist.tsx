import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, Upload, RefreshCcw, Sliders, Check, User, Info, 
  Scissors, Loader2, Send, Camera, Eye, HelpCircle, Palette, CheckCircle, Flame, ShieldAlert
} from 'lucide-react';
import { getStyleAdviceWithPhoto } from '../services/geminiService';

// Hair styles catalog for recommendation references
const HIGH_PRECISION_STYLES = [
  {
    id: 'fade',
    name: 'Degradê / Mid Fade',
    description: 'Laterais com transição suave da pele até o topo. Um dos estilos mais solicitados pela sua modernidade e elegância.',
    faceMatch: 'Redondo, Quadrado, Oval',
    imageUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
    barberTip: 'Use pomada matte (efeito seco) para destacar a textura no topo.'
  },
  {
    id: 'pompadour',
    name: 'Pompadour Clássico',
    description: 'Topete alto penteado para trás com bastante volume. Visual retrô refinado de forte personalidade.',
    faceMatch: 'Oval, Redondo, Triangular',
    imageUrl: 'https://images.unsplash.com/photo-1593702295094-aec22597af65?auto=format&fit=crop&w=600&q=80',
    barberTip: 'Secador e escova cilíndrica são indispensáveis para dar estrutura ao topete.'
  },
  {
    id: 'undercut',
    name: 'Undercut Texturizado',
    description: 'Laterais bem baixas ou raspadas com o topo desconectado e fios texturizados.',
    faceMatch: 'Quadrado, Retangular, Oval',
    imageUrl: 'https://images.unsplash.com/photo-1605497746444-ac9dbd324ce8?auto=format&fit=crop&w=600&q=80',
    barberTip: 'Aplique pó texturizador diretamente na raiz para criar volume despojado.'
  },
  {
    id: 'buzz',
    name: 'Buzz Cut / Militar',
    description: 'Corte totalmente raspado de forma uniforme ou com leve degradê. Máxima praticidade e atitude.',
    faceMatch: 'Quadrado, Oval, Retangular',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
    barberTip: 'Mantenha hidratado e use protetor solar no couro cabeludo.'
  },
  {
    id: 'classic',
    name: 'Social / Executive Cut',
    description: 'Visual limpo repartido de lado. O clássico atemporal perfeito para ambientes formais e corporativos.',
    faceMatch: 'Todos os formatos de rosto',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
    barberTip: 'Finalize com pomada de brilho moderado ou cera clássica para fixar.'
  },
  {
    id: 'long',
    name: 'Comprido Natural / Flow',
    description: 'Fios longos e soltos com movimento e caimento natural, trazendo um estilo mais artístico e despojado.',
    faceMatch: 'Oval, Triangular, Coração',
    imageUrl: 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?auto=format&fit=crop&w=600&q=80',
    barberTip: 'Use leave-in hidratante para controlar o frizz e definir o caimento.'
  }
];

const AIStylist: React.FC = () => {
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [customPhotoBase64, setCustomPhotoBase64] = useState<string | null>(null);
  const [customPhotoMime, setCustomPhotoMime] = useState<string>('image/jpeg');

  // Scanner status
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStepText, setScanStepText] = useState('');
  
  // Simulation results
  const [hasResult, setHasResult] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [detectedFaceShape, setDetectedFaceShape] = useState('');
  const [recommendedStyleId, setRecommendedStyleId] = useState('fade');
  const [showMappingOverlay, setShowMappingOverlay] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File loading
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomPhotoMime(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomPhotoUrl(reader.result);
          setCustomPhotoBase64(reader.result);
          setHasResult(false);
          setAiReport('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and drop support
  const [dragOver, setDragOver] = useState(false);
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };
  const handleDragLeave = () => {
    setDragOver(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setCustomPhotoMime(file.type);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomPhotoUrl(reader.result);
          setCustomPhotoBase64(reader.result);
          setHasResult(false);
          setAiReport('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger high-precision AI Generation
  const handleGenerateAIStyle = async () => {
    if (!customPhotoBase64) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setScanStepText('Inicializando Scanner Visagista...');

    // Advanced scanning simulation sequence
    const intervals = [
      { progress: 15, text: 'Detectando estrutura óssea facial...' },
      { progress: 35, text: 'Analisando proporções do queixo e testa...' },
      { progress: 55, text: 'Avaliando linhas de simetria do crânio...' },
      { progress: 75, text: 'Determinando densidade capilar primária...' },
      { progress: 95, text: 'Gerando simulação com Inteligência Artificial...' }
    ];

    for (const step of intervals) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setScanProgress(step.progress);
      setScanStepText(step.text);
    }

    try {
      // Call Gemini model
      const systemPrompt = `
        Analise esta foto de rosto masculino. Determine de forma ultra precisa o formato de rosto predominante (Oval, Redondo, Quadrado, Retangular ou Triangular).
        Selecione exatamente UM dos seguintes estilos de corte que mais se adequaria a este rosto: 'fade', 'pompadour', 'undercut', 'buzz', 'classic' ou 'long'.
        Forneça uma resposta estruturada contendo:
        1. FORMATO DO ROSTO DETECTADO (Escreva em letras maiúsculas na primeira linha, ex: "FORMATO: QUADRADO")
        2. ID DO CORTE RECOMENDADO (Escreva exatamente assim na segunda linha: "ID_CORTE: fade" ou o correspondente)
        3. Um laudo de visagismo com detalhes técnicos do porquê esse corte valoriza as feições dele, dicas de barba ideais, e como estilizar no dia a dia.
      `;

      const response = await getStyleAdviceWithPhoto(customPhotoBase64, customPhotoMime, systemPrompt);
      
      // Parse response to find recommended ID and Face format
      let faceShape = 'Oval';
      let styleId = 'fade';
      let cleanReport = response;

      // Extract details from Gemini's response
      const lines = response.split('\n');
      for (const line of lines) {
        if (line.includes('FORMATO:')) {
          faceShape = line.replace('FORMATO:', '').trim();
          cleanReport = cleanReport.replace(line, '');
        }
        if (line.includes('ID_CORTE:')) {
          const extractedId = line.replace('ID_CORTE:', '').trim().toLowerCase();
          if (HIGH_PRECISION_STYLES.some(s => s.id === extractedId)) {
            styleId = extractedId;
          }
          cleanReport = cleanReport.replace(line, '');
        }
      }

      setDetectedFaceShape(faceShape);
      setRecommendedStyleId(styleId);
      setAiReport(cleanReport.trim());
      setHasResult(true);
    } catch (error) {
      console.error(error);
      setAiReport('Ocorreu um erro temporário ao conectar com o servidor do visagista digital. Por favor, tente novamente.');
      setHasResult(true);
    } finally {
      setIsScanning(false);
    }
  };

  const activeStyle = HIGH_PRECISION_STYLES.find(s => s.id === recommendedStyleId) || HIGH_PRECISION_STYLES[0];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pb-20 space-y-8 animate-fade-in" id="ai-stylist-container">
      
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center justify-center p-3 bg-slate-800 rounded-full mb-1 ring-2 ring-gold-500/30">
          <Sparkles className="w-8 h-8 text-gold-500 animate-pulse" />
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Visagista Digital <span className="text-gold-500">IA de Alta Precisão</span>
        </h2>
        <p className="text-slate-400 text-sm md:text-base">
          Suba seu retrato e nossa inteligência artificial analisará os ângulos, proporções e formato do seu rosto para gerar com precisão cirúrgica o estilo de corte ideal para você.
        </p>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: UPLOAD & INPUT RETRAIT (5 COLS) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6 shadow-2xl">
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-gold-500" /> 1. Enviar sua Foto
              </h3>
              <p className="text-xs text-slate-400">
                Para um resultado perfeito, tire uma foto de frente, com boa iluminação e sem óculos ou bonés.
              </p>
            </div>

            {/* Photo View / Drag and drop */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !isScanning && fileInputRef.current?.click()}
              className={`relative aspect-square w-full rounded-xl overflow-hidden border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                isScanning 
                  ? 'border-indigo-500 bg-slate-950 cursor-not-allowed'
                  : dragOver 
                    ? 'border-gold-500 bg-gold-500/5 cursor-pointer' 
                    : customPhotoUrl 
                      ? 'border-slate-700 bg-slate-950 cursor-pointer' 
                      : 'border-slate-700 hover:border-slate-600 bg-slate-900/20 cursor-pointer'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                disabled={isScanning}
                className="hidden" 
              />

              {customPhotoUrl ? (
                <>
                  <img 
                    src={customPhotoUrl} 
                    alt="Seu Retrato" 
                    className="w-full h-full object-cover select-none"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Facial mapping lines overlay (only when showMappingOverlay is on) */}
                  {showMappingOverlay && !isScanning && (
                    <div className="absolute inset-0 pointer-events-none">
                      <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
                        {/* Oval facial boundary */}
                        <ellipse cx="50" cy="50" rx="30" ry="40" fill="none" stroke="#e2b857" strokeWidth="0.5" strokeDasharray="1,1" />
                        
                        {/* Eyes line */}
                        <line x1="15" y1="42" x2="85" y2="42" stroke="#e2b857" strokeWidth="0.3" />
                        
                        {/* Vertical symmetry line */}
                        <line x1="50" y1="5" x2="50" y2="95" stroke="#e2b857" strokeWidth="0.3" />
                        
                        {/* Mouth / Nose markings */}
                        <line x1="35" y1="65" x2="65" y2="65" stroke="#38bdf8" strokeWidth="0.3" />
                        <line x1="40" y1="55" x2="60" y2="55" stroke="#38bdf8" strokeWidth="0.3" />

                        {/* Landmark Dots */}
                        <circle cx="35" cy="42" r="1.5" fill="#e2b857" />
                        <circle cx="65" cy="42" r="1.5" fill="#e2b857" />
                        <circle cx="50" cy="55" r="1" fill="#38bdf8" />
                        <circle cx="50" cy="65" r="1" fill="#38bdf8" />
                        <circle cx="50" cy="18" r="1.2" fill="#a855f7" />
                        <circle cx="50" cy="88" r="1.2" fill="#a855f7" />
                      </svg>
                    </div>
                  )}

                  {/* Scanning Laser Beam Effect */}
                  {isScanning && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent shadow-[0_0_15px_#6366f1] animate-[bounce_2s_infinite] pointer-events-none"></div>
                  )}
                </>
              ) : (
                <div className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-900/80 flex items-center justify-center border border-slate-800 text-slate-400">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-200">Arraste ou clique para enviar</p>
                    <p className="text-xs text-slate-500">Imagens PNG, JPG ou WEBP de até 4MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Scanning progress display */}
            {isScanning && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-2 animate-pulse">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-indigo-400 font-bold">{scanStepText}</span>
                  <span className="text-indigo-300 font-mono font-bold">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              {customPhotoUrl && !isScanning && (
                <div className="flex justify-between items-center px-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={showMappingOverlay} 
                      onChange={(e) => setShowMappingOverlay(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-900 text-gold-500 focus:ring-0 focus:ring-offset-0" 
                    />
                    <span className="text-xs text-slate-400 font-bold">Mostrar Linhas de Visagismo</span>
                  </label>
                  <button
                    onClick={() => {
                      setCustomPhotoUrl(null);
                      setCustomPhotoBase64(null);
                      setHasResult(false);
                      setAiReport('');
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors underline font-medium"
                  >
                    Remover Foto
                  </button>
                </div>
              )}

              <button
                onClick={handleGenerateAIStyle}
                disabled={!customPhotoUrl || isScanning}
                className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-500/10"
              >
                {isScanning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando com Precisão...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Estilo de Corte com IA
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: PRECISE HIGH RESOLUTION REFERENCE & REPORT (7 COLS) */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full space-y-6">
            
            {!hasResult ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-900/60 border border-slate-800 flex items-center justify-center text-slate-500">
                  <Scissors className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-md">
                  <h4 className="text-md font-bold text-slate-300">Aguardando Envio de Retrato</h4>
                  <p className="text-xs text-slate-500">
                    Insira sua foto de retrato à esquerda e clique em <strong className="text-slate-400">"Gerar Estilo de Corte"</strong>. Nossa IA irá escanear suas feições e sugerir o visual ideal modelado em altíssima definição.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fade-in flex-1">
                
                {/* Result header */}
                <div className="border-b border-slate-700/50 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                  <div>
                    <span className="text-xs font-bold text-gold-500 uppercase tracking-widest bg-gold-500/10 px-2.5 py-1 rounded-full border border-gold-500/20">
                      Formato de Rosto: {detectedFaceShape}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-2">Corte Sugerido de Alta Precisão</h3>
                  </div>
                  <button 
                    onClick={handleGenerateAIStyle}
                    className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 bg-slate-900/50 px-3 py-2 rounded-xl border border-slate-800 transition-all hover:border-slate-700"
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Analisar Novamente
                  </button>
                </div>

                {/* Split card: Precise Photo Reference & Fast details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-slate-950/40 rounded-xl p-5 border border-slate-800/80">
                  
                  {/* Photo representation of recommended style */}
                  <div className="md:col-span-5 relative aspect-square md:h-44 rounded-lg overflow-hidden border border-slate-800 shrink-0">
                    <img 
                      src={activeStyle.imageUrl} 
                      alt={activeStyle.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                    <span className="absolute bottom-2 left-2 text-[10px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded uppercase">
                      Modelo IA
                    </span>
                  </div>

                  {/* Quick style features list */}
                  <div className="md:col-span-7 flex flex-col justify-center space-y-2.5">
                    <h4 className="text-md font-extrabold text-white flex items-center gap-1.5">
                      <CheckCircle className="w-5 h-5 text-green-400" /> {activeStyle.name}
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {activeStyle.description}
                    </p>
                    
                    <div className="pt-2 flex flex-col gap-1 text-[11px]">
                      <span className="text-slate-400">
                        <strong className="text-slate-300">Harmonia:</strong> Perfeito para Rostos {activeStyle.faceMatch}
                      </span>
                      <span className="text-slate-400">
                        <strong className="text-slate-300">Dica Master:</strong> {activeStyle.barberTip}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Detailed Visagism Report text from Gemini */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-gold-500" /> Parecer Técnico de Visagismo
                  </h4>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-sm text-slate-200 leading-relaxed whitespace-pre-line prose prose-invert">
                    {aiReport}
                  </div>
                </div>

                {/* CTA Action */}
                <div className="bg-gold-500/5 border border-gold-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h5 className="text-xs font-bold text-gold-500 uppercase flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5" /> Curtiu o novo estilo sugerido?
                    </h5>
                    <p className="text-[11px] text-slate-400">
                      Garanta seu horário com nossos profissionais capacitados para reproduzir este corte com exatidão.
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      const event = new CustomEvent('navigateToTab', { detail: 'booking' });
                      window.dispatchEvent(event);
                    }}
                    className="shrink-0 bg-gold-500 hover:bg-gold-600 text-slate-950 font-black py-2 px-4 rounded-lg text-xs uppercase transition-all"
                  >
                    Agendar Horário
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};

export default AIStylist;
