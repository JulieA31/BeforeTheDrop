import React, { useState, useEffect, useRef } from 'react';
import { Wind, Eye, Music, Waves, Zap, X, Droplets } from 'lucide-react';

export const RegulationTools: React.FC = () => {
  const [activeTool, setActiveTool] = useState<'none' | 'breathing' | 'visual' | 'brown-noise' | 'fractal' | 'jellyfish' | 'lavalamp'>('none');

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

  // --- Active Tool Views ---

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

  if (activeTool === 'fractal') {
    return (
      <FullScreenContainer title="Immersion Fractale">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover opacity-80"
          src="https://cdn.pixabay.com/video/2020/06/18/42435-432247551_tiny.mp4"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="text-white/80 text-center px-4 font-light text-lg">Laissez votre regard suivre les lignes...</p>
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
          src="https://cdn.pixabay.com/video/2019/04/09/22687-329432420_tiny.mp4"
        />
        <div className="absolute inset-0 bg-blue-900/20 pointer-events-none"></div>
      </FullScreenContainer>
    );
  }

  if (activeTool === 'lavalamp') {
    return (
      <FullScreenContainer title="Lampe à Lave">
        <video 
          autoPlay loop muted playsInline 
          className="w-full h-full object-cover"
          src="https://cdn.pixabay.com/video/2022/10/05/133682-757805178_tiny.mp4"
        />
        <div className="absolute inset-0 bg-orange-900/10 pointer-events-none"></div>
      </FullScreenContainer>
    );
  }

  // --- Menu Grid ---

  return (
    <div className="grid grid-cols-1 gap-3">
      
      {/* Visuals - Zen Videos */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-2 mb-1">Vidéos Zen</h3>
      <div className="grid grid-cols-2 gap-3">
        <ToolCard 
          icon={<Eye size={24} className="text-purple-300" />} 
          title="Fractales" 
          desc="Encre fluide"
          color="bg-purple-500/20"
          onClick={() => setActiveTool('fractal')}
        />
        <ToolCard 
          icon={<Waves size={24} className="text-blue-300" />} 
          title="Méduses" 
          desc="Mouvement lent"
          color="bg-blue-500/20"
          onClick={() => setActiveTool('jellyfish')}
        />
         <ToolCard 
          icon={<Droplets size={24} className="text-pink-300" />} 
          title="Lampe Lave" 
          desc="Bulles & Huile"
          color="bg-pink-500/20"
          onClick={() => setActiveTool('lavalamp')}
        />
      </div>

      {/* Audio & Breath */}
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4 mb-1">Audio & Corps</h3>
      <ToolCard 
        icon={<Music size={24} className="text-orange-300" />} 
        title="Bruit Brun" 
        desc="Masquage sonore profond"
        color="bg-orange-500/20"
        onClick={() => setActiveTool('brown-noise')}
      />
      <ToolCard 
        icon={<Wind size={24} className="text-calm-green" />} 
        title="Respiration" 
        desc="Cohérence cardiaque (4-4-4)"
        color="bg-green-500/20"
        onClick={() => setActiveTool('breathing')}
      />

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