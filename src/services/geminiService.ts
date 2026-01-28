import { GoogleGenAI } from "@google/genai";
import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.geminiApiKey || '';
// Only initialize if key looks vaguely valid
const ai = apiKey && apiKey.length > 10 ? new GoogleGenAI({ apiKey }) : null;

export const analyzeRoomStyle = async (mockImageData: string): Promise<string> => {
  if (!ai) {
    console.warn("Gemini API Key missing or invalid. Returning mock response.");
    return "Based on the layout, this room suggests a Modern Minimalist style with open flow concepts.";
  }

  try {
    const model = 'gemini-2.5-flash-latest';
    // Use a simple prompt to minimize token usage for the check
    const response = await ai.models.generateContent({
      model: model,
      contents: `Analyze a room layout. Provide a 1-sentence design insight.`,
    });
    
    return response.text || "Modern and spacious design.";
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);

    // Robust error checking for various SDK error formats
    const msg = (error.message || error.toString()).toLowerCase();
    const code = error.status || error.code || error?.error?.code;
    const status = error?.error?.status || '';

    if (
      code === 403 || 
      status === 'PERMISSION_DENIED' || 
      msg.includes('region not supported') || 
      msg.includes('location not supported') ||
      msg.includes('403')
    ) {
      console.warn("Gemini API Region/Permission Error. Using fallback response.");
      return "Region not supported for AI features. This layout features a balanced Modern Open style (AI Simulation).";
    }

    return "Unable to connect to AI service. Please check your network.";
  }
};
