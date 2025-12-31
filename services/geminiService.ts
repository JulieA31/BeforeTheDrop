import { GoogleGenAI } from "@google/genai";
import { CheckIn } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const genAI = new GoogleGenAI(apiKey); // Note : Vérifie si c'est GoogleGenAI(apiKey) ou { apiKey } selon ta version

export const getGentleInsight = async (recentCheckIns: CheckIn[]): Promise<string> => {
  if (!apiKey) return "Clé API non configurée.";
  if (recentCheckIns.length === 0) return "En attente de données pour l'analyse...";

  // Assuming sorted by date desc (0 is now, 1 is previous, etc.)
  const latest = recentCheckIns[0]; 
  const history = recentCheckIns.slice(1, 4).map(c => 
    `[${new Date(c.timestamp).toLocaleDateString()} ${new Date(c.timestamp).getHours()}h]: Sens:${c.sensoryLoad}, Soc:${c.socialBattery}, Emo:${c.emotionalIntensity}`
  ).join('\n');

  const prompt = `
    Tu es un compagnon de régulation pour personnes autistes/TDAH.
    
    Données actuelles:
    - Charge Sensorielle: ${latest.sensoryLoad}/100
    - Batterie Sociale: ${latest.socialBattery}/100 (bas = vide)
    
    Historique récent:
    ${history}
    
    TACHE: Analyse le contexte pour donner UN conseil court (max 2 phrases).
    
    LOGIQUE D'ANALYSE :
    1. POST-CRISE (Débriefing) : Si l'utilisateur semble aller un peu mieux après un état critique récent (dans l'historique), fais le lien de cause à effet sans jugement. 
       Exemple : "Le shutdown d'hier semble lié à la forte charge sociale notée avant. C'est normal d'être fatigué."
       
    2. PRÉVENTION / RÉCUPÉRATION : Si l'utilisateur est stable mais que l'historique montre une grosse dépense d'énergie récente, suggère activement de bloquer du temps pour un Intérêt Spécifique.
       Exemple : "Après l'effort d'hier, c'est le moment idéal pour bloquer 1h dédiée à ton intérêt spécifique pour récupérer."
       
    3. TEMPS RÉEL : Si tout est calme ou si c'est la première donnée, donne un conseil de maintenance simple.
    
    TON : Doux, passif, validant. Jamais d'injonctions directes ("Fais ça"). Utilise "Il semble que...", "Peut-être que...".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Prenez soin de vous aujourd'hui.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Analyse momentanément indisponible.";
  }
};
