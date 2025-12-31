import React, { useState } from 'react';
import { Zap, Gauge, VolumeX, ArrowRight, Check } from 'lucide-react';

interface OnboardingProps {
  onFinish: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const slides = [
    {
      icon: <Zap size={48} className="text-yellow-400" />,
      title: "La Théorie des Cuillères",
      desc: "Chaque jour, tu as un stock d'énergie limité (tes cuillères). Chaque action en coûte une ou plusieurs. Quand le stock est vide, c'est le risque de crise.",
    },
    {
      icon: <Gauge size={48} className="text-calm-green" />,
      title: "Écoute tes jauges",
      desc: "Note régulièrement tes niveaux : sensoriel, social, émotionnel. L'application apprendra à détecter tes signes avant-coureurs de 'Drop'.",
    },
    {
      icon: <VolumeX size={48} className="text-red-400" />,
      title: "Mode SOS",
      desc: "En cas de shutdown (mutisme, surcharge), active le mode SOS. Il affiche un message clair pour ton entourage sans que tu aies besoin de parler.",
    }
  ];

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a] z-50 flex flex-col items-center justify-center p-6 animate-fade-in">
      <div className="w-full max-w-sm flex-1 flex flex-col justify-center">
        
        {/* Slide Content */}
        <div className="bg-card-bg border border-slate-700 p-8 rounded-3xl shadow-2xl text-center min-h-[300px] flex flex-col items-center justify-center">
          <div className="mb-6 p-4 bg-slate-800 rounded-full shadow-inner">
            {slides[step].icon}
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{slides[step].title}</h2>
          <p className="text-gray-400 leading-relaxed text-sm">
            {slides[step].desc}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-8 mb-8">
          {slides.map((_, i) => (
            <div 
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-calm-green' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <button 
        onClick={handleNext}
        className="w-full max-w-sm bg-slate-100 text-slate-900 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-transform active:scale-95 shadow-lg mb-8"
      >
        {step === slides.length - 1 ? (
          <>C'est compris <Check size={20} /></>
        ) : (
          <>Suivant <ArrowRight size={20} /></>
        )}
      </button>
    </div>
  );
};