import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Home, Sparkles, Wind, Zap, Activity, TriangleAlert, LogOut, RefreshCcw } from 'lucide-react';
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

// Wrapper component to handle content once Auth is initialized
const AppContent = () => {
  const { currentUser } = useAuth();
  console.log("L'application démarre ! User est :", currentUser);
  const [view, setView] = useState<ViewState>('auth'); 
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showSOS, setShowSOS] = useState(false);
  
  // Data State
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [spoons, setSpoons] = useState<DailySpoons>({ date: new Date().toDateString(), total: 10, remaining: 10 });
  
  const [insight, setInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Firestore Subscriptions
  useEffect(() => {
    // Si pas de currentUser, on ne fait rien, le rendu affichera AuthScreen
    if (!currentUser) {
      setLoadingData(false);
      return;
    }

    setLoadingData(true);

    // Sécurité pour ne pas rester bloqué
    const timeout = setTimeout(() => setLoadingData(false), 5000);

    // 1. Vérifier l'Onboarding
    checkOnboardingStatus(currentUser.uid).then((seen) => {
      if (!seen) setView('onboarding');
      else setView('dashboard');
    });

    // 2. S'abonner aux Check-ins
    const unsubscribeCheckIns = subscribeToCheckIns(currentUser.uid, (data) => {
      setCheckIns(data);
    });

    // 3. S'abonner aux Cuillères
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

    // 1. Check Onboarding
    checkOnboardingStatus(currentUser.uid).then((seen) => {
      if (!seen) setView('onboarding');
      else setView('dashboard');
    });

    // 2. Subscribe to CheckIns
    const unsubscribeCheckIns = subscribeToCheckIns(currentUser.uid, (data) => {
      setCheckIns(data);
    });

    // 3. Subscribe to Spoons
    const unsubscribeSpoons = subscribeToSpoons(currentUser.uid, (data) => {
      if (data) {
        // Reset daily logic if needed
        if (data.date !== new Date().toDateString()) {
           const newSpoons = { date: new Date().toDateString(), total: data.total || 10, remaining: data.total || 10 };
           saveSpoonsToDb(currentUser.uid, newSpoons);
           // Subscription will update state automatically
        } else {
           setSpoons(data);
        }
      } else {
        // Init default spoons if doesn't exist
        const defaultSpoons = { date: new Date().toDateString(), total: 10, remaining: 10 };
        saveSpoonsToDb(currentUser.uid, defaultSpoons);
      }
      setLoadingData(false);
    });

    return () => {
      unsubscribeCheckIns();
      unsubscribeSpoons();
    };
  }, [currentUser]);

  // Fetch insight when dashboard is viewed and we have data
  useEffect(() => {
    if (view === 'dashboard' && checkIns.length > 0 && !insight) {
      fetchInsight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, checkIns.length]);

  const fetchInsight = async () => {
    setLoadingInsight(true);
    // Sort logic handled by Firestore query usually, but double check
    const result = await getGentleInsight(checkIns.slice(0, 5));
    setInsight(result);
    setLoadingInsight(false);
  };

  const handleOnboardingFinish = async () => {
    if (currentUser) {
      await setOnboardingSeen(currentUser.uid);
    }
    setView('dashboard');
  };

  const handleSaveCheckIn = async (data: Omit<CheckIn, 'id' | 'timestamp'>) => {
    if (!currentUser) return;
    
    // Optimistic update handled by Firestore subscription, but we send it off
    await addCheckInToDb(currentUser.uid, {
      ...data,
      timestamp: Date.now(),
    });

    setShowCheckIn(false);
    setInsight(null);
  };

  const handleUpdateSpoons = (newRemaining: number) => {
    if (!currentUser) return;
    saveSpoonsToDb(currentUser.uid, { ...spoons, remaining: newRemaining });
  };

  const handleUpdateTotalSpoons = (newTotal: number) => {
    if (!currentUser) return;
    // When updating total, decide if we reset remaining or scale it. 
    // Simple approach: just update total and keep remaining bounded.
    saveSpoonsToDb(currentUser.uid, { ...spoons, total: newTotal, remaining: Math.min(spoons.remaining, newTotal) });
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView('auth');
      setCheckIns([]); 
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const getAppStatus = (current: CheckIn | undefined, spoonState: DailySpoons): AppStatus => {
    const spoonRatio = spoonState.remaining / spoonState.total;
    let spoonStatus: AppStatus = 'green';
    if (spoonRatio <= 0.2) spoonStatus = 'red';
    else if (spoonRatio <= 0.4) spoonStatus = 'orange';

    let checkInStatus: AppStatus = 'green';
    if (current) {
      const sensoryScore = current.sensoryLoad;
      const emotionalScore = current.emotionalIntensity;
      const physicalScore = current.physicalFatigue;
      const socialScore = 100 - current.socialBattery;
      const avgLoad = (sensoryScore * 1.5 + emotionalScore + physicalScore + socialScore) / 4.5;
      if (avgLoad > 70 || sensoryScore > 85) checkInStatus = 'red';
      else if (avgLoad > 40 || sensoryScore > 60) checkInStatus = 'orange';
    }

    if (spoonStatus === 'red' || checkInStatus === 'red') return 'red';
    if (spoonStatus === 'orange' || checkInStatus === 'orange') return 'orange';
    return 'green';
  };

  const current = checkIns.length > 0 ? checkIns[0] : undefined;
  const status = getAppStatus(current, spoons);

  const getBackgroundClass = () => {
    if (view === 'recovery') return 'bg-[#050a14]';
    switch (status) {
      case 'red': return 'bg-gradient-to-b from-red-950 via-[#1e0a0a] to-bg-app';
      case 'orange': return 'bg-gradient-to-b from-amber-900/40 via-[#2a1b10] to-bg-app';
      case 'green': return 'bg-gradient-to-b from-blue-900/20 via-[#0f172a] to-bg-app';
      default: return 'bg-bg-app';
    }
  };

  // --- Views Handling ---

  // 1. SI PAS DE USER : On affiche l'écran de login immédiatement
  if (!currentUser) {
    return <AuthScreen onLoginSuccess={() => setView('dashboard')} />;
  }

  // 2. SI USER MAIS EN CHARGEMENT : On affiche le spinner
  if (loadingData && view !== 'recovery' && view !== 'sensory-scan') {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <RefreshCcw className="animate-spin text-calm-green" size={32} />
      </div>
    );
  }

  // 3. SI ONBOARDING PAS FAIT
  if (view === 'onboarding') {
    return <Onboarding onFinish={handleOnboardingFinish} />;
  }
  // --- Main App ---

  return (
    <div className={`min-h-screen ${getBackgroundClass()} text-gray-100 flex flex-col pb-20 max-w-lg mx-auto shadow-2xl overflow-hidden relative transition-all duration-1000 ease-in-out`}>
      
      {/* SOS Overlay */}
      {showSOS && (
        <SOSCard 
          onClose={() => setShowSOS(false)} 
          onActivateRecovery={() => {
            setShowSOS(false);
            setView('recovery');
          }}
        />
      )}

      {/* Recovery Mode Overlay (takes over main content) */}
      {view === 'recovery' && (
        <div className="fixed inset-0 z-40 bg-[#050a14]">
          <RecoveryMode onExit={() => setView('dashboard')} />
        </div>
      )}

      {/* Sensory Scan Overlay */}
      {view === 'sensory-scan' && (
        <SensoryScan 
          onComplete={() => setView('dashboard')} 
          onCancel={() => setView('dashboard')} 
        />
      )}

      {/* Header - Hidden in Recovery Mode */}
      {view !== 'recovery' && (
        <header className="p-6 pb-2 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <img 
              src="logo2.png" 
              alt="Logo" 
              className="w-12 h-12 object-contain rounded-full shadow-lg border border-white/10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div>
               <h1 className="text-sm font-bold text-gray-300">Bonjour, {currentUser?.displayName || 'Voyageur'}</h1>
               <p className="text-[10px] text-gray-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
                onClick={handleSignOut}
                className="bg-slate-800 border border-slate-700 text-slate-400 p-2 rounded-lg hover:text-white transition-colors"
                title="Déconnexion"
            >
                <LogOut size={16} />
            </button>
            <button 
                onClick={() => setShowSOS(true)}
                className="bg-red-500/10 border border-red-500/50 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-500/20 transition-colors animate-pulse"
            >
                SOS
            </button>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className={`flex-1 overflow-y-auto p-6 pt-2 z-10 ${view === 'recovery' ? 'hidden' : ''}`}>
        
        {view === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            
            <SpoonTracker 
              total={spoons.total} 
              remaining={spoons.remaining} 
              onUpdate={handleUpdateSpoons}
              onUpdateTotal={handleUpdateTotalSpoons}
            />

            {checkIns.length > 0 && (
              <div className="bg-card-bg/80 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-calm-green">
                  <Sparkles size={16} />
                  <h3 className="text-xs font-bold uppercase tracking-wider">Aperçu</h3>
                </div>
                {loadingInsight ? (
                  <div className="animate-pulse h-4 bg-slate-700 rounded w-3/4"></div>
                ) : (
                  <p className="text-sm text-gray-300 italic leading-relaxed">
                    "{insight}"
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
               <button 
                 onClick={() => setView('sensory-scan')}
                 className="bg-slate-800/80 backdrop-blur hover:bg-slate-700 border border-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors"
               >
                 <Activity size={24} className="text-blue-400" />
                 <span className="text-xs font-medium">Scan Corps</span>
               </button>
               <button 
                 onClick={() => setView('regulation')}
                 className="bg-slate-800/80 backdrop-blur hover:bg-slate-700 border border-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 transition-colors"
               >
                 <Wind size={24} className="text-calm-green" />
                 <span className="text-xs font-medium">Respiration</span>
               </button>
            </div>

            {current ? (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center mb-2">
                   <h2 className="text-lg font-semibold">État Actuel</h2>
                   {status === 'orange' && (
                     <div className="flex items-center gap-2 text-orange-400 bg-orange-950/40 px-2 py-1 rounded border border-orange-900/50">
                       <TriangleAlert size={14} />
                       <span className="text-xs font-bold uppercase tracking-wide">Vigilance</span>
                     </div>
                   )}
                   {status === 'red' && (
                     <div className="flex items-center gap-2 text-red-400 bg-red-950/40 px-2 py-1 rounded border border-red-900/50">
                       <TriangleAlert size={14} />
                       <span className="text-xs font-bold uppercase tracking-wide">Risque de Shutdown</span>
                     </div>
                   )}
                </div>
                
                <Gauge label="Charge Sensorielle" value={current.sensoryLoad} inverse />
                <Gauge label="Batterie Sociale" value={current.socialBattery} />
                <Gauge label="Intensité Émotionnelle" value={current.emotionalIntensity} inverse />
                <Gauge label="Fatigue Physique" value={current.physicalFatigue} inverse />
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                Aucun point fait aujourd'hui.
                <br/>Utilisez le bouton + pour commencer.
              </div>
            )}
          </div>
        )}

        {view === 'regulation' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Espace de Régulation</h2>
            <RegulationTools />
          </div>
        )}

        {view === 'history' && (
          <div className="animate-fade-in">
            <h2 className="text-xl font-semibold mb-6">Tendances</h2>
            <div className="bg-card-bg p-4 rounded-xl border border-slate-700 shadow-sm">
               <HistoryChart data={checkIns} />
            </div>
            <div className="mt-6 text-sm text-gray-400 space-y-2">
              <p>Observer vos tendances aide à repérer les seuils de tolérance.</p>
              <p>Il n'y a pas de "bon" graphique. Juste votre rythme.</p>
            </div>
          </div>
        )}

      </main>

      {/* FAB - Hidden in Recovery */}
      {view === 'dashboard' && (
        <div className="absolute bottom-24 right-6 z-30">
          <button
            onClick={() => setShowCheckIn(true)}
            className="bg-slate-100 text-slate-900 rounded-full p-4 shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
            aria-label="Nouveau point complet"
          >
            <Plus size={28} />
          </button>
        </div>
      )}

      {/* Nav - Hidden in Recovery */}
      {view !== 'recovery' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-md border-t border-slate-800 max-w-lg mx-auto z-40">
          <div className="flex justify-around p-4">
            <button 
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-calm-green' : 'text-slate-500'}`}
            >
              <Home size={24} />
              <span className="text-[10px]">Accueil</span>
            </button>
            
            <button 
              onClick={() => setView('regulation')}
              className={`flex flex-col items-center gap-1 ${view === 'regulation' ? 'text-calm-green' : 'text-slate-500'}`}
            >
              <Wind size={24} />
              <span className="text-[10px]">Outils</span>
            </button>

            <button 
              onClick={() => setView('history')}
              className={`flex flex-col items-center gap-1 ${view === 'history' ? 'text-calm-green' : 'text-slate-500'}`}
            >
              <BarChart3 size={24} />
              <span className="text-[10px]">Suivi</span>
            </button>
          </div>
        </nav>
      )}

      {showCheckIn && (
        <CheckInForm 
          onSave={handleSaveCheckIn} 
          onCancel={() => setShowCheckIn(false)} 
        />
      )}

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
