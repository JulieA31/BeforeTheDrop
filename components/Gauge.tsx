import React from 'react';

interface GaugeProps {
  value: number; // 0 to 100
  label: string;
  inverse?: boolean; // If true, high value is bad (e.g., Sensory Load). If false, high value is good (e.g., Social Battery)
}

export const Gauge: React.FC<GaugeProps> = ({ value, label, inverse = false }) => {
  // Determine color based on status
  // If inverse: High (80+) is Red/Warning, Low is Green/Good
  // If normal: High (80+) is Green/Good, Low is Red/Warning
  
  let colorClass = 'bg-calm-green';
  
  if (inverse) {
    if (value > 80) colorClass = 'bg-red-400';
    else if (value > 50) colorClass = 'bg-alert-soft';
  } else {
    if (value < 20) colorClass = 'bg-red-400';
    else if (value < 50) colorClass = 'bg-alert-soft';
  }

  return (
    <div className="flex flex-col w-full mb-4">
      <div className="flex justify-between mb-1 text-sm text-gray-300">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-3 rounded-full transition-all duration-500 ease-out ${colorClass}`} 
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};