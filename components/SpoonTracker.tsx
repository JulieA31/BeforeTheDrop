import React, { useState, useEffect } from 'react';
import { Zap, Lock, Settings, RefreshCw, Coffee, Phone, Briefcase, ShowerHead, Utensils, ShoppingCart, Plus, Trash2, Star, Minus, LayoutGrid, Bus, FileText, Package } from 'lucide-react';
import { Activity } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToActivities, addActivityToDb, updateActivityInDb, deleteActivityFromDb } from '../services/db';

interface SpoonTrackerProps {
  total: number;
  remaining: number;
  onUpdate: (remaining: number) => void;
  onUpdateTotal: (total: number) => void;
}

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 'shower', name: 'Douche', cost: 1, isCritical: true, isPinned: true, icon: 'shower' },
  { id: 'meal', name: 'Cuisiner / Manger', cost: 1, isCritical: true, isPinned: true, icon: 'food' },
  { id: 'work', name: 'Travail (1h)', cost: 3, isCritical: false, isPinned: true, icon: 'work' },
  { id: 'social', name: 'Sortie Sociale', cost: 4, isCritical: false, isPinned: true, icon: 'coffee' },
  { id: 'call', name: 'Appel Téléphonique', cost: 2, isCritical: false, isPinned: false, icon: 'phone' },
  { id: 'chores', name: 'Ménage', cost: 3, isCritical: false, isPinned: false, icon: 'cart' },
  { id: 'transit', name: 'Transports', cost: 2, isCritical: false, isPinned: false, icon: 'bus' },
  { id: 'admin', name: 'Factures / Admin', cost: 2, isCritical: false, isPinned: false, icon: 'file' },
  { id: 'package', name: 'Récup. Colis', cost: 1, isCritical: false, isPinned: false, icon: 'package' },
];

export const SpoonTracker: React.FC<SpoonTrackerProps> = ({ total, remaining, onUpdate, onUpdateTotal }) => {
  const { currentUser } = useAuth();
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // New Activity State
  const [newActName, setNewActName] = useState('');
  const [newActCost, setNewActCost] = useState(1);
  const [newActCritical, setNewActCritical] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToActivities(currentUser.uid, (data) => {
        if (data.length === 0) {
            // Initial seed if empty
            DEFAULT_ACTIVITIES.forEach(act => {
                addActivityToDb(currentUser.uid, act);
            });
        } else {
            setActivities(data);
        }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const isLowEnergy = remaining <= 2;

  const handleActivity = (cost: number) => {
    const newRemaining = Math.max(0, remaining - cost);
    onUpdate(newRemaining);
  };

  const resetDay = () => {
    onUpdate(total);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'shower': return <ShowerHead size={16} />;
      case 'food': return <Utensils size={16} />;
      case 'phone': return <Phone size={16} />;
      case 'work': return <Briefcase size={16} />;
      case 'coffee': return <Coffee size={16} />;
      case 'cart': return <ShoppingCart size={16} />;
      case 'bus': return <Bus size={16} />;
      case 'file': return <FileText size={16} />;
      case 'package': return <Package size={16} />;
      case 'custom': return <Star size={16} />;
      default: return <Zap size={16} />;
    }
  };

  // --- Management Functions ---

  const addActivity = async () => {
    if (!newActName.trim() || !currentUser) return;
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      name: newActName,
      cost: newActCost,
      isCritical: newActCritical,
      isPinned: true, // Auto pin custom activities
      icon: 'custom'
    };
    await addActivityToDb(currentUser.uid, newActivity);
    setNewActName('');
    setNewActCost(1);
    setNewActCritical(false);
  };

  const togglePin = async (id: string) => {
    if (!currentUser) return;
    const activity = activities.find(a => a.id === id);
    if (activity) {
        await updateActivityInDb(currentUser.uid, { ...activity, isPinned: !activity.isPinned });
    }
  };

  const deleteCustomActivity = async (id: string) => {
    if (!currentUser) return;
    await deleteActivityFromDb(currentUser.uid, id);
  };

  // Filter activities for dashboard (only pinned)
  const dashboardActivities = activities.filter(a => a.isPinned);

  return (
    <div className="bg-card-bg/80 backdrop-blur border border-slate-700 p-5 rounded-2xl shadow-lg transition-all duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2 uppercase tracking-wider">
            <Zap size={16} className={isLowEnergy ? "text-red-400 animate-pulse" : "text-yellow-400"} />
            Budget Énergie
          </h3>
          <p className="text-[10px] text-gray-400 mt-1">
            {isLowEnergy 
              ? "Mode économie activé." 
              : "Dépensez vos cuillères avec précaution."}
          </p>
        </div>
        <button 
          onClick={() => setIsLibraryOpen(true)}
          className="text-slate-500 hover:text-white transition-colors p-2"
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Numerical Display & Slider (Simplified) */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
            <span className={`text-4xl font-bold ${isLowEnergy ? 'text-red-400' : 'text-white'}`}>
            {remaining}
            </span>
            <div className="text-right">
                <span className="text-xs text-gray-500 block">Sur un stock de {total}</span>
                <button 
                    onClick={resetDay}
                    className="text-[10px] text-yellow-500 hover:text-yellow-300 underline"
                >
                    Réinitialiser
                </button>
            </div>
        </div>
        
        {/* Visualization Grid */}
        <div className="flex flex-wrap gap-1.5 justify-start">
            {Array.from({ length: total }).map((_, i) => (
            <div
                key={i}
                className={`w-3 h-6 rounded-full border transition-all duration-500 ${
                i < remaining 
                    ? isLowEnergy 
                        ? 'bg-red-500 border-red-600 shadow-[0_0_8px_rgba(239,68,68,0.4)]' 
                        : 'bg-yellow-400 border-yellow-500 shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                    : 'bg-slate-800 border-slate-700 opacity-30'
                }`}
            />
            ))}
        </div>
      </div>
      
      {/* Dashboard Activity List (Pinned Only) */}
      <div className="grid grid-cols-2 gap-3">
        {dashboardActivities.map((activity) => {
          const isDisabled = (isLowEnergy && !activity.isCritical) || remaining < activity.cost;
          
          return (
            <button
              key={activity.id}
              onClick={() => handleActivity(activity.cost)}
              disabled={isDisabled}
              className={`
                relative p-3 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300
                ${isDisabled 
                  ? 'bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed grayscale' 
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-600 hover:border-slate-500 text-gray-200 active:scale-95'
                }
              `}
            >
              {isDisabled && isLowEnergy && !activity.isCritical && (
                 <div className="absolute top-2 right-2 text-red-900">
                   <Lock size={12} />
                 </div>
              )}

              <div className={isDisabled ? 'opacity-50' : 'text-calm-green'}>
                {getIcon(activity.icon || 'custom')}
              </div>
              
              <div className="text-center w-full">
                <span className="block text-xs font-medium truncate px-1">{activity.name}</span>
                <span className="text-[10px] font-bold mt-1 inline-block bg-slate-900 px-2 py-0.5 rounded-full text-gray-400">
                  -{activity.cost} 🥄
                </span>
              </div>
            </button>
          );
        })}
        
        {/* Add/Manage Button in Grid */}
        <button
          onClick={() => setIsLibraryOpen(true)}
          className="p-3 rounded-xl border border-dashed border-slate-600 bg-slate-900/30 hover:bg-slate-800 text-slate-500 flex flex-col items-center justify-center gap-2 transition-colors"
        >
          <LayoutGrid size={20} />
          <span className="text-[10px] font-medium">Gérer</span>
        </button>
      </div>

      {/* LIBRARY MODAL / DRAWER */}
      {isLibraryOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex flex-col animate-fade-in p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <LayoutGrid size={20} className="text-calm-green"/>
                    Tiroir à cuillères
                </h2>
                <button onClick={() => setIsLibraryOpen(false)} className="bg-slate-800 p-2 rounded-full text-white">
                    <LayoutGrid size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8">
                
                {/* 1. Daily Total Setting */}
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                    <label className="block text-xs text-gray-400 mb-2 uppercase font-bold">Stock quotidien : {total}</label>
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={total} 
                        onChange={(e) => onUpdateTotal(Number(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                    />
                </div>

                {/* 2. Pinned Items */}
                <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase">Mes Raccourcis (Accueil)</h3>
                    <div className="space-y-2">
                        {activities.filter(a => a.isPinned).map(act => (
                            <div key={act.id} className="flex items-center justify-between bg-slate-800 border border-slate-600 p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className="text-calm-green">{getIcon(act.icon || 'custom')}</div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{act.name}</p>
                                        <p className="text-xs text-gray-500">{act.cost} cuillère(s)</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => togglePin(act.id)}
                                    className="p-2 bg-slate-700 rounded-lg text-red-300 hover:bg-red-900/30 transition-colors"
                                    title="Retirer de l'accueil"
                                >
                                    <Minus size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Suggestions / Unpinned */}
                <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase">Suggestions</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {activities.filter(a => !a.isPinned).map(act => (
                             <div key={act.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-lg opacity-70 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <div className="text-slate-400">{getIcon(act.icon || 'custom')}</div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-300">{act.name}</p>
                                        <p className="text-xs text-gray-600">{act.cost} cuillère(s)</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => deleteCustomActivity(act.id)}
                                        className="p-2 text-slate-600 hover:text-red-400"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => togglePin(act.id)}
                                        className="p-2 bg-calm-green text-slate-900 rounded-lg hover:bg-white transition-colors"
                                        title="Ajouter à l'accueil"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 4. Create Custom */}
                <div>
                    <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase">Créer une tâche</h3>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 space-y-3">
                        <input 
                            type="text" 
                            placeholder="Nom (ex: Jardinage)" 
                            value={newActName}
                            onChange={(e) => setNewActName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-calm-green"
                        />
                        <div className="flex gap-2">
                            <div className="flex items-center bg-slate-800 border border-slate-600 rounded px-2 w-1/2">
                                <span className="text-xs text-gray-400 mr-2">Coût:</span>
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10" 
                                    value={newActCost}
                                    onChange={(e) => setNewActCost(Number(e.target.value))}
                                    className="bg-transparent text-sm text-white w-full focus:outline-none py-2"
                                />
                            </div>
                            <button 
                                onClick={addActivity}
                                className="flex-1 bg-slate-700 text-white font-bold text-xs rounded hover:bg-slate-600 transition-colors"
                            >
                                Ajouter
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};