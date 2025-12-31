import React, { useState } from 'react';
import { X, VolumeX, Moon, Send, Check } from 'lucide-react';

interface SOSCardProps {
  onClose: () => void;
  onActivateRecovery?: () => void;
}

export const SOSCard: React.FC<SOSCardProps> = ({ onClose, onActivateRecovery }) => {
  const [shared, setShared] = useState(false);

  const handleShare = async () => {
    const message = `SOS : Je suis actuellement en "Shutdown" (surcharge sensorielle sévère). 
Je ne peux pas parler au téléphone ni répondre aux messages complexes pour l'instant. 
Ce n'est pas de ta faute, mon cerveau a juste besoin de redémarrer dans le calme absolu. 
S'il te plaît, n'essaie pas de m'appeler. Je reviendrai vers toi dès que j'aurai récupéré un peu d'énergie.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mode Shutdown Activé',
          text: message,
        });
        setShared(true);
      } catch (err) {
        console.log('Partage annulé ou échoué', err);
      }
    } else {
      // Fallback : Copier dans le presse-papier
      try {
        await navigator.clipboard.writeText(message);
        alert("Message copié ! Tu peux le coller dans un SMS.");
        setShared(true);
      } catch (err) {
        console.error("Impossible de copier", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center p-6 text-center animate-fade-in overflow-y-auto">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 text-gray-600 hover:text-gray-400 p-2"
        aria-label="Fermer le mode SOS"
      >
        <X size={32} />
      </button>

      <div className="max-w-sm w-full space-y-6 my-auto">
        <div className="flex justify-center mb-4">
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

        <div className="grid gap-3">
            <button 
                onClick={handleShare}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-colors ${
                    shared 
                    ? 'bg-green-900/30 border border-green-800 text-green-400' 
                    : 'bg-slate-800 border border-slate-700 text-white hover:bg-slate-700'
                }`}
            >
                {shared ? <Check size={20} /> : <Send size={20} />}
                <span>{shared ? 'Message copié/envoyé' : 'Prévenir un proche (SMS/WhatsApp)'}</span>
            </button>

            {onActivateRecovery && (
            <button 
                onClick={onActivateRecovery}
                className="w-full bg-slate-900 border border-slate-800 text-blue-200 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-slate-800 transition-colors"
            >
                <Moon size={20} />
                <span>Passer en Mode Récupération</span>
            </button>
            )}
        </div>

        <p className="text-gray-600 text-sm italic">
          Montrez cet écran à votre entourage.
        </p>
      </div>
    </div>
  );
};