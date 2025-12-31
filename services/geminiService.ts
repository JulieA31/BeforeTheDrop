import { GoogleGenerativeAI } from "@google/generative-ai";
import { CheckIn } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
// On utilise le nom officiel : GoogleGenerativeAI
const genAI = new GoogleGenerativeAI(apiKey);

export const getGentleInsight = async (recentCheckIns: CheckIn[]): Promise<string> => {
  if (!apiKey) return "Clé API non configurée.";
  if (recentCheckIns.length === 0) return "En attente de données pour l'analyse...";

  const latest = recentCheckIns[0]; 
  const history = recentCheckIns.slice(1, 4).map(c => 
    `[${new Date(c.timestamp).toLocaleDateString()}]: Sens:${c.sensoryLoad}, Soc:${c.socialBattery}, Emo:${c.emotionalIntensity}`
  ).join('\n');

  const prompt = `
    Tu es un compagnon de régulation pour personnes autistes/TDAH.
    
    Données actuelles:
    - Charge Sensorielle: ${latest.sensoryLoad}/100
    - Batterie Sociale: ${latest.socialBattery}/100
    
    Historique récent:
    ${history}
    
    TACHE: Analyse le contexte pour donner UN conseil court (max 2 phrases).
    
    LOGIQUE D'ANALYSE :
    1. POST-CRISE : Si l'utilisateur va mieux après un état critique, valide le besoin de repos.
    2. PRÉVENTION : Suggère un temps pour un Intérêt Spécifique si l'énergie a été bcp dépensée.
    3. TEMPS RÉEL : Conseil de maintenance simple.
    
    TON : Doux, passif, validant. Utilise "Il semble que...", "Peut-être que...". Pas d'injonctions.
  `;

  try {
    // On utilise le modèle stable gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || "Prenez soin de vous aujourd'hui.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analyse momentanément indisponible.";
  }
};
