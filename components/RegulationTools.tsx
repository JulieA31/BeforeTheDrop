import React, { useState, useEffect, useRef } from 'react';
import { Wind, Eye, Music, Waves, Zap, X, Droplets, Fish, Brain, Users, Heart, Sun, ListFilter, PlayCircle, BookOpen } from 'lucide-react';

type Category = 'all' | 'cognitive' | 'social' | 'sensory' | 'emotional';

interface Regulator {
  id: string;
  category: Exclude<Category, 'all'>;
  text: string;
}

const REGULATORS: Regulator[] = [
  // Cognitif
  { id: 'c1', category: 'cognitive', text: "Aucune décision aujourd’hui" },
  { id: 'c2', category: 'cognitive', text: "Lister 3 choses et n'en faire qu'une" },
  { id: 'c3', category: 'cognitive', text: "Mode avion pendant 1 heure" },
  { id: 'c4', category: 'cognitive', text: "Stop multi-tasking : une seule fenêtre ouverte" },
  // Social
  { id: 's1', category: 'social', text: "Annuler une interaction non essentielle" },
  { id: 's2', category: 'social', text: "Répondre par écrit uniquement" },
  { id: 's3', category: 'social', text: "Dire non sans se justifier" },
  { id: 's4', category: 'social', text: "Porter un casque/écouteurs en public" },
  // Sensoriel
  { id: 'se1', category: 'sensory', text: "Silence total 15 minutes" },
  { id: 'se2', category: 'sensory', text: "Lumière basse ou éteinte" },
  { id: 'se3', category: 'sensory', text: "S'allonger au sol (Grounding)" },
  { id: 'se4', category: 'sensory', text: "Manger quelque chose de croquant" },
  // Émotionnel
  { id: 'e1', category: 'emotional', text: "Respiration lente sans objectif" },
  { id: 'e2', category: 'emotional', text: "Marche sans téléphone" },
  { id: 'e3', category: 'emotional', text: "Regarder une vidéo réconfortante" },
  { id: 'e4', category: 'emotional', text: "Écrire tout ce qui vient (Brain dump)" },
];

export const RegulationTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'none' | 'breathing' | 'brown-noise' | 'fractal' | 'jellyfish' | 'lavalamp' | 'waves'>('none');
  const [viewMode, setViewMode] = useState<'tools' | 'library'>('tools');
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  // --- Breath Logic ---
  const [breathPhase, setBreathPhase] = useState('Inspirer');
  const [scale, setScale] = useState(1);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTool === 'breathing') {
      let count = 0;
      interval = setInterval(() => {
        count = (count + 1) % 3;
        if (count === 0) {
          setBreathPhase('Inspirer');
          setScale(1.5);
        } else if (count === 1) {
          setBreathPhase('Bloquer');
          setScale(1.5);
        } else {
          setBreathPhase('Expirer');
          setScale(1);
        }
      }, 4000);
      setBreathPhase('Inspirer');
      setScale(1.5);
    }
    return () => clearInterval(interval);
  }, [activeTool]);

  // --- Brown Noise Logic (Web Audio API) ---
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (activeTool === 'brown-noise') {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;
        
        const bufferSize = 4096;
        const brownNoiseScriptNode = ctx.createScriptProcessor(bufferSize, 1, 1);
        
        let lastOut = 0;
        brownNoiseScriptNode.onaudioprocess = (e) => {
          const output = e.outputBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            // Brown noise formula (integrate white noise)
            output[i] = (lastOut + (0.02 * white)) / 1.02;
            lastOut = output[i];
            output[i] *= 3.5; // Compensate gain
          }
        };

        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.5; // Default volume
        gainNodeRef.current = gainNode;

        brownNoiseScriptNode.connect(gainNode);
        gainNode.connect(ctx.destination);
      } catch (e) {
        console.error("Audio API not supported", e);
      }
    } else {
      // Cleanup
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    }

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [activeTool]);

  // --- Render Helpers ---

  const FullScreenContainer = ({ children, title }: { children: React.ReactNode, title: string }) => (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
       <div className="absolute top-4 right-4 z-50">
          <button onClick={() => setActiveTool('none')} className="bg-black/50 p-2 rounded-full text-white hover:bg-white/20 backdrop-blur transition-colors">
            <X size={24} />
          </button>
       </div>
       <div className="absolute top-4 left-4 z-50 pointer-events-none">
          <h3 className="text-white/50 text-xs font-bold uppercase tracking-widest bg-black/30 px-2 py-1 rounded">{title}</h3>
       </div>
       {children}
    </div>
  );

  const getCategoryColor = (cat: string) => {
    switch(cat) {
        case 'cognitive': return 'border-blue-500/30 bg-blue-500/10 text-blue-200';
        case 'social': return 'border-green-500/30 bg-green-500/10 text-green-200';
        case 'sensory': return 'border-orange-500/30 bg-orange-500/10 text-orange-200';
        case 'emotional': return 'border-pink-500/30 bg-pink-500/10 text-pink-200';
        default: return 'border-slate-700 bg-slate-800';
    }
  };

  const getCategoryIcon = (cat: string) => {
      switch(cat) {
          case 'cognitive': return <Brain size={16} className="text-blue-400"/>;
          case 'social': return <Users size={16} className="text-green-400"/>;
          case 'sensory': return <Sun size={16} className="text-orange-400"/>; // Sun as simplified sensory input
          case 'emotional': return <Heart size={16} className="text-pink-400"/>;
          default: return <Zap size={16}/>;
      }
  };

  // --- Active Tool Views (Overlays) ---

  if (activeTool === 'breathing') {
    return (
      <div className="flex flex-col items-center justify-center h-64 py-8">
        <div 
          className="w-40 h-40 bg-calm-green/20 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out border-4 border-calm-green/50"
          style={{ transform: `scale(${scale})` }}
        >
          <span className="text-white font-medium text-lg drop-shadow-md transition-none transform-none" style={{ transform: `scale(${1/scale})` }}>
            {breathPhase}
          </span>
        </div>
        <button onClick={() => setActiveTool('none')} className="mt-8 text-gray-400 text-sm underline">Arrêter</button>
      </div>
    );
  }

  if (activeTool === 'brown-noise') {
    return (
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col items-center text-center animate-fade-in">
        <div className="w-16 h-16 bg-orange-900/30 rounded-full flex items-center justify-center mb-4 animate-pulse">
          <Music size={32} className="text-orange-400" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Bruit Brun Actif</h3>
        <p className="text-gray-400 text-sm mb-6">Le bruit brun lisse les fréquences agressives. Il aide à calmer l'hyperacousie et favorise la concentration.</p>
        
        <div className="w-full max-w-xs mb-4">
          <label className="text-xs text-gray-500 mb-1 block">Volume</label>
          <input 
            type="range" 
            min="0" max="1" step="0.01" 
            defaultValue="0.5"
            onChange={(e) => {
              if (gainNodeRef.current) gainNodeRef.current.gain.value = Number(e.target.value);
            }}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-400"
          />
        </div>

        <button onClick={() => setActiveTool('none')} className="bg-slate-700 px-6 py-2 rounded-full text-white text-sm hover:bg-slate-600">
          Arrêter le son
        </button>
      </div>
    );
  }

  // --- Zen Videos ---

  if (activeTool === 'fractal') {
    return (
      <FullScreenContainer title="Immersion Hypnotique">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover opacity-90"
          src="/hypnose.mp4"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-white/80 text-center px-4 font-light text-lg">Suivez les motifs...</p>
        </div>
      </FullScreenContainer>
    );
  }

  if (activeTool === 'jellyfish') {
    return (
      <FullScreenContainer title="Aquarium Méduses">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover"
          src="/public/meduses.mp4"
        />
        <div className="absolute inset-0 bg-blue-900/10 pointer-events-none"></div>
      </FullScreenContainer>
    );
  }

  if (activeTool === 'lavalamp') {
    return (
      <FullScreenContainer title="Lampe à Lave">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover"
          src="/bulles.mp4"
        />
        <div className="absolute inset-0 bg-orange-900/10 pointer-events-none"></div>
      </FullScreenContainer>
    );
  }

  if (activeTool === 'waves') {
    return (
      <FullScreenContainer title="Vagues Calmes">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover"
          src="/vagues.mp4"
        />
        <div className="absolute inset-0 bg-cyan-900/10 pointer-events-none"></div>
      </FullScreenContainer>
    );
  }

  // --- MAIN VIEW ---

  return (
    <div className="flex flex-col gap-4">
        
        {/* Toggle Tabs */}
        <div className="bg-slate-800 p-1 rounded-xl flex gap-1">
            <button 
                onClick={() => setViewMode('tools')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${viewMode === 'tools' ? 'bg-slate-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
                <PlayCircle size={16} />
                Outils Immédiats
            </button>
            <button 
                onClick={() => setViewMode('library')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${viewMode === 'library' ? 'bg-slate-600 text-white shadow' : 'text-gray-400 hover:text-gray-200'}`}
            >
                <BookOpen size={16} />
                Bibliothèque
            </button>
        </div>

        {viewMode === 'tools' ? (
            <div className="grid grid-cols-1 gap-3 animate-fade-in">
            {/* Visuals - Zen Videos */}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">Vidéos Zen</h3>
            <div className="grid grid-cols-2 gap-3">
                <ToolCard 
                icon={<Eye size={24} className="text-purple-300" />} 
                title="Fractales" 
                desc="Hypnotique"
                color="bg-purple-500/20"
                onClick={() => setActiveTool('fractal')}
                />
                <ToolCard 
                icon={<Fish size={24} className="text-blue-300" />} 
                title="Méduses" 
                desc="Lenteur"
                color="bg-blue-500/20"
                onClick={() => setActiveTool('jellyfish')}
                />
                <ToolCard 
                icon={<Droplets size={24} className="text-pink-300" />} 
                title="Bulles" 
                desc="Lampe lave"
                color="bg-pink-500/20"
                onClick={() => setActiveTool('lavalamp')}
                />
                <ToolCard 
                icon={<Waves size={24} className="text-cyan-300" />} 
                title="Vagues" 
                desc="Rythme naturel"
                color="bg-cyan-500/20"
                onClick={() => setActiveTool('waves')}
                />
            </div>

            {/* Audio & Breath */}
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-1">Audio & Corps</h3>
            <ToolCard 
                icon={<Music size={24} className="text-orange-300" />} 
                title="Bruit Brun" 
                desc="Silence mental"
                color="bg-orange-500/20"
                onClick={() => setActiveTool('brown-noise')}
            />
            <ToolCard 
                icon={<Wind size={24} className="text-calm-green" />} 
                title="Respiration" 
                desc="4-4-4"
                color="bg-green-500/20"
                onClick={() => setActiveTool('breathing')}
            />
            </div>
        ) : (
            <div className="animate-fade-in space-y-4">
                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'all' ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                    >
                        Tout
                    </button>
                    <button 
                        onClick={() => setSelectedCategory('cognitive')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1 ${selectedCategory === 'cognitive' ? 'bg-blue-500/20 text-blue-200 border-blue-500/50' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                    >
                        <Brain size={12} /> Cognitif
                    </button>
                    <button 
                        onClick={() => setSelectedCategory('social')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1 ${selectedCategory === 'social' ? 'bg-green-500/20 text-green-200 border-green-500/50' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                    >
                        <Users size={12} /> Social
                    </button>
                    <button 
                        onClick={() => setSelectedCategory('sensory')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1 ${selectedCategory === 'sensory' ? 'bg-orange-500/20 text-orange-200 border-orange-500/50' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                    >
                        <Sun size={12} /> Sensoriel
                    </button>
                    <button 
                        onClick={() => setSelectedCategory('emotional')}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border flex items-center gap-1 ${selectedCategory === 'emotional' ? 'bg-pink-500/20 text-pink-200 border-pink-500/50' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                    >
                        <Heart size={12} /> Émotionnel
                    </button>
                </div>

                {/* Library Grid */}
                <div className="grid grid-cols-1 gap-2">
                    {REGULATORS.filter(r => selectedCategory === 'all' || r.category === selectedCategory).map((reg) => (
                        <div 
                            key={reg.id}
                            className={`p-4 rounded-xl border flex items-start gap-3 transition-transform active:scale-[0.99] ${getCategoryColor(reg.category)}`}
                        >
                            <div className="mt-0.5 opacity-80">
                                {getCategoryIcon(reg.category)}
                            </div>
                            <div>
                                <p className="text-sm font-medium leading-relaxed">{reg.text}</p>
                                <p className="text-[10px] uppercase tracking-wider opacity-60 mt-1 font-bold">{reg.category === 'sensory' ? 'Sensoriel' : reg.category === 'social' ? 'Social' : reg.category === 'cognitive' ? 'Cognitif' : 'Émotionnel'}</p>
                            </div>
                        </div>
                    ))}
                    
                    {REGULATORS.filter(r => selectedCategory === 'all' || r.category === selectedCategory).length === 0 && (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            Aucune stratégie trouvée pour cette catégorie.
                        </div>
                    )}
                </div>
            </div>
        )}

    </div>
  );
};

const ToolCard = ({ icon, title, desc, color, onClick }: any) => (
  <div 
    onClick={onClick}
    className="bg-card-bg border border-slate-700 p-4 rounded-xl flex flex-col gap-3 cursor-pointer hover:bg-slate-800 transition-colors active:scale-95"
  >
    <div className={`p-3 rounded-full w-fit ${color}`}>
      {icon}
    </div>
    <div>
      <h3 className="font-medium text-gray-100 text-sm">{title}</h3>
      <p className="text-[10px] text-gray-400 leading-tight mt-1">{desc}</p>
    </div>
  </div>
);
