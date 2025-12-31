import React, { useState } from 'react';
import { ArrowRight, Mail, Lock, AlertCircle, Loader } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthScreenProps {
  onLoginSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // Only for signup
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Update display name
        if (name) {
          await updateProfile(userCredential.user, {
            displayName: name
          });
        }
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error(err);
      let msg = "Une erreur est survenue.";
      if (err.code === 'auth/invalid-credential') msg = "Email ou mot de passe incorrect.";
      if (err.code === 'auth/email-already-in-use') msg = "Cet email est déjà utilisé.";
      if (err.code === 'auth/weak-password') msg = "Le mot de passe est trop faible (6 car. min).";
      if (err.code === 'auth/invalid-email') msg = "Format d'email invalide.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-center animate-fade-in relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500 rounded-full blur-[100px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[100px]"></div>
      </div>

      <div className="z-10 w-full max-w-xs flex flex-col items-center">
        <img 
          src="logo2.png" 
          alt="Before the Drop Logo" 
          className="scale-[0.8]"
        />
        
       
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg flex items-center gap-2 text-left">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="relative">
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Prénom"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-4 text-white focus:outline-none focus:border-calm-green transition-colors text-sm"
                required
              />
            </div>
          )}

          <div className="relative">
            <Mail size={18} className="absolute left-3 top-3.5 text-slate-500" />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-calm-green transition-colors text-sm"
              required
            />
          </div>

          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3.5 text-slate-500" />
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mot de passe"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white focus:outline-none focus:border-calm-green transition-colors text-sm"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-calm-green text-slate-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg hover:shadow-calm-green/20"
          >
            {loading ? <Loader size={20} className="animate-spin" /> : (isLogin ? "Se connecter" : "S'inscrire")}
            {!loading && <ArrowRight size={20} />}
          </button>
        </form>

        <button 
          onClick={() => { setIsLogin(!isLogin); setError(null); }}
          className="mt-6 text-xs text-slate-400 hover:text-white transition-colors"
        >
          {isLogin ? "Pas encore de compte ? Créer un compte" : "Déjà un compte ? Se connecter"}
        </button>
      </div>
      
      <p className="absolute bottom-6 text-gray-600 text-[10px]">
        Authentification sécurisée par Firebase.
      </p>
    </div>
  );
};
