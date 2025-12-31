import React, { useState } from 'react';
import { CheckIn } from '../types';
import { Save, X } from 'lucide-react';

interface CheckInFormProps {
  onSave: (data: Omit<CheckIn, 'id' | 'timestamp'>) => void;
  onCancel: () => void;
}

export const CheckInForm: React.FC<CheckInFormProps> = ({ onSave, onCancel }) => {
  const [sensory, setSensory] = useState(50);
  const [social, setSocial] = useState(50);
  const [emotional, setEmotional] = useState(50);
  const [physical, setPhysical] = useState(50);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      sensoryLoad: sensory,
      socialBattery: social,
      emotionalIntensity: emotional,
      physicalFatigue: physical,
    });
  };

  const Slider = ({ label, value, setter, lowLabel, highLabel }: { label: string, value: number, setter: (v: number) => void, lowLabel: string, highLabel: string }) => (
    <div className="mb-6">
      <label className="block text-gray-200 text-sm font-medium mb-2">{label}</label>
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={(e) => setter(Number(e.target.value))}
        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-calm-green"
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>{lowLabel}</span>
        <span>{highLabel}</span>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-card-bg w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Comment ça va ?</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <Slider 
            label="Charge Sensorielle" 
            value={sensory} 
            setter={setSensory} 
            lowLabel="Calme"
            highLabel="Surcharge"
          />
          <Slider 
            label="Batterie Sociale" 
            value={social} 
            setter={setSocial}
            lowLabel="Vide"
            highLabel="Pleine"
          />
          <Slider 
            label="Intensité Émotionnelle" 
            value={emotional} 
            setter={setEmotional}
            lowLabel="Neutre"
            highLabel="Intense"
          />
          <Slider 
            label="Fatigue Physique" 
            value={physical} 
            setter={setPhysical}
            lowLabel="En forme"
            highLabel="Épuisé(e)"
          />

          <button 
            type="submit"
            className="w-full bg-slate-100 text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-colors mt-4"
          >
            <Save size={20} />
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};