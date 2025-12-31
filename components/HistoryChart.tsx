import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckIn } from '../types';

interface HistoryChartProps {
  data: CheckIn[];
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ data }) => {
  // Sort data chronologically for the chart
  const chartData = [...data].sort((a, b) => a.timestamp - b.timestamp).slice(-20); // Last 20 entries

  if (chartData.length < 2) {
    return <div className="text-center text-gray-500 py-10">Pas assez de données pour afficher l'historique.</div>;
  }

  const formatDate = (tick: number) => {
    return new Date(tick).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="h-64 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={formatDate} 
            stroke="#94a3b8" 
            tick={{fontSize: 10}}
            interval="preserveStartEnd"
          />
          <YAxis stroke="#94a3b8" tick={{fontSize: 10}} domain={[0, 100]} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
            itemStyle={{ fontSize: '12px' }}
            labelFormatter={(label) => new Date(label).toLocaleString('fr-FR')}
          />
          <Line type="monotone" dataKey="sensoryLoad" stroke="#F4A261" strokeWidth={2} dot={false} name="Sensoriel" />
          <Line type="monotone" dataKey="socialBattery" stroke="#A7D3A6" strokeWidth={2} dot={false} name="Social" />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 text-xs mt-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#F4A261] rounded-full"></div>
          <span className="text-gray-400">Charge Sensorielle</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-[#A7D3A6] rounded-full"></div>
          <span className="text-gray-400">Batterie Sociale</span>
        </div>
      </div>
    </div>
  );
};