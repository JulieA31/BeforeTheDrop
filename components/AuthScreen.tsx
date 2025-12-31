import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (name: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-xs flex flex-col items-center">
        <img 
            src="logo2.png" 
            alt="Before the Drop Logo" 
            className="w-32 h-32 object-contain rounded-full shadow-2xl mb-8 border border-white/10"
        />
        
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-200 to-calm-green mb-2">
          Before the Drop
        </h1>
        <p className="text-gray-400 text-sm mb-12">
          Prévenir le burn-out, une cuillère à la fois.
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div className="text-left">
            <label className="text-xs text-gray-500 font-bold uppercase ml-1">Comment t'appelles-tu ?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ton prénom"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-calm-green transition-colors mt-2 shadow-inner"
              autoFocus
            />
          </div>
          
          <button 
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-calm-green text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg hover:shadow-calm-green/20"
          >
            Commencer
            <ArrowRight size={20} />
          </button>
        </form>
      </div>
      
      <p className="absolute bottom-6 text-gray-600 text-xs">
        Données stockées uniquement sur votre appareil.
      </p>
    </div>
  );
};