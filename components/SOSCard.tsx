import React from 'react';
import { X, VolumeX } from 'lucide-react';

interface SOSCardProps {
  onClose: () => void;
}

export const SOSCard: React.FC<SOSCardProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-600 hover:text-gray-400 p-2"
        aria-label="Fermer le mode SOS"
      >
        <X size={32} />
      </button>

      <div className="max-w-sm w-full space-y-8">
        <div className="flex justify-center mb-8">
          <VolumeX size={64} className="text-gray-500" />
        </div>

        <div className="bg-gray-900 border-l-4 border-alert-soft p-6 rounded-r-xl text-left shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-4">Je ne peux pas parler.</h2>
          <p className="text-xl text-gray-300 leading-relaxed">
            Je suis en surcharge sensorielle (Shutdown). 
            S'il vous plaît, ne me posez pas de questions.
          </p>
          <p className="text-xl text-gray-300 mt-4 font-semibold">
            J'ai besoin de calme et de temps.
          </p>
        </div>

        <p className="text-gray-600 text-sm mt-12 italic">
          Montrez cet écran à votre entourage.
        </p>
      </div>
    </div>
  );
};