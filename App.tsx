import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Home, Sparkles, Wind, Activity, TriangleAlert, LogOut, RefreshCcw } from 'lucide-react';
import { CheckIn, ViewState, AppStatus, DailySpoons } from './types';
import { CheckInForm } from './components/CheckInForm';
import { Gauge } from './components/Gauge';
import { HistoryChart } from './components/HistoryChart';
import { RegulationTools } from './components/RegulationTools';
import { SOSCard } from './components/SOSCard';
import { SpoonTracker } from './components/SpoonTracker';
import { SensoryScan } from './components/SensoryScan';
import { AuthScreen } from './components/AuthScreen';
import { Onboarding } from './components/Onboarding';
import { RecoveryMode } from './components/RecoveryMode';
import { getGentleInsight } from './services/geminiService';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';
import { 
  subscribeToCheckIns, 
  addCheckInToDb, 
  subscribeToSpoons, 
  saveSpoonsToDb, 
  checkOnboardingStatus, 
  setOnboardingSeen 
} from './services/db';

const AppContent = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState<ViewState>('auth'); 
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [spoons, setSpoons] = useState<DailySpoons>({ date: new Date().toDateString(), total: 10, remaining: 10 });
  
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Gestion de l'authentification et des données
  useEffect(() => {
    if (!currentUser) {
      setLoadingData(false);
      setView('auth');
      return;
    }

    setLoadingData(true);
    const timeout = setTimeout(() => setLoadingData(false), 5000);

    checkOnboardingStatus(currentUser.uid).then((seen) => {
      if (!seen) setView('onboarding');
      else setView('dashboard');
    });

    const unsubscribeCheckIns = subscribeToCheckIns(currentUser.uid, (data) => {
      setCheckIns(data);
    });

    const unsubscribeSpoons = subscribeToSpoons(currentUser.uid, (data) => {
      if (data) {
        if (data.date !== new Date().toDateString()) {
           const newSpoons = { date: new Date().toDateString(), total: data.total || 10, remaining: data.total || 10 };
           saveSpoonsToDb(currentUser.uid, newSpoons);
        } else {
           setSpoons(data);
        }
      } else {
        const defaultSpoons = { date: new Date().toDateString(), total: 10, remaining: 10 };
        saveSpoonsToDb(currentUser.uid, defaultSpoons);
      }
      setLoadingData(false);
      clearTimeout(timeout);
    });

    return () => {
      unsubscribeCheckIns();
      unsubscribeSpoons();
      clearTimeout(timeout);
    };
  }, [currentUser]);

  const fetchInsight = async () => {
    if (checkIns.length === 0) return;
    setLoadingInsight(true);
    const result = await getGentleInsight(checkIns.slice(0, 5));
    setInsight(result);
    setLoadingInsight(false);
  };

  useEffect(() => {
    if (view === 'dashboard' && checkIns.length > 0 && !insight) {
      fetchInsight();
    }
  }, [view, checkIns.length]);

  const handleOnboardingFinish = async () => {
    if (currentUser) await setOnboardingSeen(currentUser.uid);
    setView('dashboard');
  };

  const handleSaveCheckIn = async (data: Omit<CheckIn, 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    await addCheckInToDb(currentUser.uid, { ...data, timestamp: Date.now() });
    setShowCheckIn(false);
    setInsight(null);
  };

  const handleUpdateSpoons = (newRemaining: number) => {
    if (!currentUser) return;
    saveSpoonsToDb(currentUser.uid, { ...spoons, remaining: newRemaining });
  };

  const handleUpdateTotalSpoons = (newTotal: number) => {
    if (!currentUser) return;
    saveSpoonsToDb(currentUser.uid, { ...spoons, total: newTotal, remaining: Math.min(spoons.remaining, newTotal) });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView('auth');
    } catch (error) {
      console.error("Erreur déconnexion", error);
    }
  };

  const current = checkIns.length > 0 ? checkIns[0] : undefined;

  const getBackgroundClass = () => {
    if (view === 'recovery') return 'bg-[#050a14]';
    return 'bg-gradient-to-b from-blue-900/20 via-[#0f172a] to-[#0f172a]';
  };

  // --- Rendu conditionnel des écrans ---
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={() => setView('dashboard')} />;
  }

  if (loadingData && view !== 'recovery') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <RefreshCcw className="animate-spin text-green-400" size={32} />
      </div>
    );
  }

  if (view === 'onboarding') {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }

  return (
    <div className={`min-h-screen ${getBackgroundClass()} text-gray-100 flex flex-col pb-20 max-w-lg mx-auto relative`}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center font-bold">
            {currentUser.displayName?.charAt(0) || 'V'}
          </div>
          <div>
             <h1 className="text-sm font-bold">Bonjour, {currentUser.displayName || 'Voyageur'}</h1>
             <p className="text-[10px] text-gray-500">Aujourd'hui</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="p-2 text-gray-400 hover:text-white">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        {view === 'dashboard' && (
          <div className="space-y-6">
            <SpoonTracker 
              total={spoons.total} 
              remaining={spoons.remaining} 
              onUpdate={handleUpdateSpoons}
              onUpdateTotal={handleUpdateTotalSpoons}
            />
            
            {checkIns.length > 0 && (
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h3 className="text-xs font-bold text-green-400 mb-2 uppercase">Aperçu IA</h3>
                <p className="text-sm italic">"{insight || 'Analyse en cours...'}"</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               <button onClick={() => setView('sensory-scan')} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center gap-2">
                 <Activity className="text-blue-400" />
                 <span className="text-xs">Scan Corps</span>
               </button>
               <button onClick={() => setView('regulation')} className="bg-slate-800 p-4 rounded-xl flex flex-col items-center gap-2">
                 <Wind className="text-green-400" />
                 <span className="text-xs">Respiration</span>
               </button>
            </div>
          </div>
        )}

        {view === 'regulation' && <RegulationTools />}
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 p-4 flex justify-around max-w-lg mx-auto">
        <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-green-400' : 'text-gray-500'}>
          <Home size={24} />
        </button>
        <button onClick={() => setView('regulation')} className={view === 'regulation' ? 'text-green-400' : 'text-gray-500'}>
          <Wind size={24} />
        </button>
      </nav>

      {showCheckIn && <CheckInForm onSave={handleSaveCheckIn} onCancel={() => setShowCheckIn(false)} />}
      {showSOS && <SOSCard onClose={() => setShowSOS(false)} onActivateRecovery={() => setView('recovery')} />}
      {view === 'recovery' && <RecoveryMode onExit={() => setView('dashboard')} />}
      {view === 'sensory-scan' && <SensoryScan onComplete={() => setView('dashboard')} onCancel={() => setView('dashboard')} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
