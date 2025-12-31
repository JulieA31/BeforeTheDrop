import React, { useState } from 'react';
import { X, Check, ArrowRight } from 'lucide-react';

interface SensoryScanProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const SensoryScan: React.FC<SensoryScanProps> = ({ onComplete, onCancel }) => {
  const questions = [
    { id: 'thirst', text: "As-tu bu de l'eau récemment ?", type: 'need' },
    { id: 'hunger', text: "As-tu mangé quelque chose ?", type: 'need' },
    { id: 'noise', text: "Y a-t-il trop de bruit autour de toi ?", type: 'irritant' },
    { id: 'light', text: "La lumière est-elle trop forte ?", type: 'irritant' },
    { id: 'temp', text: "As-tu trop chaud ou trop froid ?", type: 'irritant' },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnswer = (yes: boolean) => {
    // In a real app we would save this answer
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50">
      <button onClick={onCancel} className="absolute top-6 right-6 text-gray-400 hover:text-white">
        <X size={24} />
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="h-1 w-full bg-slate-800 rounded-full mb-8">
            <div 
              className="h-1 bg-calm-green transition-all duration-300 rounded-full" 
              style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
            ></div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-2 animate-fade-in">
            {currentQ.text}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleAnswer(false)}
            className="h-32 rounded-2xl border-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
            <X size={32} className="text-red-400" />
            <span className="text-lg font-medium text-gray-300">Non</span>
          </button>

          <button
            onClick={() => handleAnswer(true)}
            className="h-32 rounded-2xl border-2 border-slate-700 bg-slate-800/50 hover:bg-slate-800 flex flex-col items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Check size={32} className="text-green-400" />
            <span className="text-lg font-medium text-gray-300">Oui</span>
          </button>
        </div>
      </div>
    </div>
  );
};