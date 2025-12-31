import React, { useState, useEffect } from 'react';
import { Moon, Droplets, Coffee, BatteryCharging, LogOut, Clock, Heart } from 'lucide-react';

interface RecoveryModeProps {
  onExit: () => void;
}

export const RecoveryMode: React.FC<RecoveryModeProps> = ({ onExit }) => {
  const [minutes, setMinutes] = useState(0);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setMinutes(m => m + 1);
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const handleExitRequest = () => {
    setIsExiting(true);
    // Délai de 3 secondes pour lire le message bienveillant avant de quitter vraiment
    setTimeout(() => {
        onExit();
    }, 3500);
  };

  const needs = [
    { id: 'water', text: "Boire une gorgée d'eau", icon: <Droplets size={20} className="text-blue-400" /> },
    { id: 'dark', text: "Lumière tamisée / Noir", icon: <Moon size={20} className="text-purple-400" /> },
    { id: 'food', text: "Manger un truc simple", icon: <Coffee size={20} className="text-orange-400" /> },
    { id: 'rest', text: "S'allonger / Ne rien faire", icon: <BatteryCharging size={20} className="text-green-400" /> },
  ];

  const toggleItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isExiting) {
    return (
        <div className="fixed inset-0 bg-[#050a14] z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <Heart size={64} className="text-calm-green mb-6 animate-pulse" />
            <h2 className="text-2xl font-light text-white mb-4">Doucement...</h2>
            <p className="text-gray-400 text-lg leading-relaxed max-w-xs">
                Le monde est toujours là.<br/>
                Prends ton temps pour y retourner.<br/>
                Tu as bien fait de t'arrêter.
            </p>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#050a14] z-50 flex flex-col justify-between p-6 text-center animate-fade-in transition-colors duration-1000 overflow-y-auto">
      
      {/* Header Section */}
      <div className="flex flex-col items-center pt-8 opacity-60">
        <Clock size={24} className="text-gray-500 mb-2" />
        <span className="text-gray-400 text-sm font-mono tracking-widest">
          EN PAUSE DEPUIS {minutes} MIN
        </span>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col items-center justify-center flex-1 my-6">
        {/* Breathing Visual Center */}
        <div className="relative flex items-center justify-center mb-8">
            <div className="w-48 h-48 bg-blue-900/10 rounded-full animate-pulse blur-3xl absolute"></div>
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700/50 shadow-2xl">
                <Moon size={48} className="text-slate-500 opacity-80" />
            </div>
        </div>

        <h2 className="text-2xl font-light text-gray-300 mb-2">Mode Récupération</h2>
        <p className="text-gray-600 text-sm mb-8 max-w-xs mx-auto">
            Il n'y a rien à réussir ici.<br/>Juste exister.
        </p>

        {/* Physiological Needs Checklist */}
        <div className="w-full max-w-xs space-y-3">
            {needs.map(item => (
            <button
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all duration-500 ${
                checkedItems[item.id] 
                    ? 'bg-slate-900/30 border-slate-800 opacity-40 grayscale' 
                    : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 text-gray-200'
                }`}
            >
                <div className={`p-2 rounded-full bg-[#0f172a] ${checkedItems[item.id] ? 'opacity-50' : ''}`}>
                    {item.icon}
                </div>
                <span className={`text-sm font-medium ${checkedItems[item.id] ? 'line-through' : ''}`}>
                    {item.text}
                </span>
            </button>
            ))}
        </div>
      </div>

      {/* Footer Exit Section */}
      <div className="pb-8 flex justify-center">
        <button 
            onClick={handleExitRequest}
            className="flex items-center gap-2 text-slate-500 hover:text-calm-green transition-colors text-sm px-6 py-3 border border-slate-800 rounded-full hover:bg-slate-900"
        >
            <LogOut size={16} />
            <span>Je me sens un peu mieux</span>
        </button>
      </div>

    </div>
  );
};