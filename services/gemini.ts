
import { GoogleGenAI, Type } from "@google/genai";
import { GearItem, TripSettings, PackAnalysis, SuggestedItem } from "../types";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const formatPackContext = (items: GearItem[], settings: TripSettings): string => {
  const itemsList = items.map(i => `- ${i.id}: ${i.name} (${i.weight}g) [${i.category}]`).join('\n');
  const totalWeight = items.reduce((acc, i) => acc + i.weight, 0);
  
  return `
  TRIP SETTINGS:
  - Type: ${settings.tripType}
  - Location: ${settings.location || 'Unspecified'}
  - Style: ${settings.packStyle}
  - Environment: ${settings.environment}
  - Weather: ${settings.weatherCondition}
  - Season: ${settings.season}
  - Low Temp: ${settings.lowTemp}°C
  - Party Size: ${settings.partySize}
  - Distance/Day: ${settings.distancePerDay} km
  - Water Availability: ${settings.waterAvailability}

  CURRENT PACK LOADOUT:
  Total Weight: ${(totalWeight / 1000).toFixed(2)} kg
  Items:
  ${itemsList}
  `;
};

// Gemini Fast (Flash Lite) for quick checks
export const getQuickFeedback = async (items: GearItem[], settings: TripSettings): Promise<string> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);
  
  const prompt = `
  Analyze this backpack loadout for the specified trip. 
  Provide a single, concise paragraph (max 3 sentences) giving immediate feedback. 
  Focus on obvious red flags or easy wins for weight reduction based on the pack style (${settings.packStyle}).
  Tone: Helpful, encouraging, outdoorsy.
  ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    return response.text || "Could not generate quick feedback.";
  } catch (error) {
    console.error("Quick feedback error:", error);
    return "Error generating feedback. Please check your connection.";
  }
};

// Analyze Pack (Flash Lite) with JSON Schema
export const analyzePack = async (items: GearItem[], settings: TripSettings): Promise<PackAnalysis> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);
  
  const prompt = `
  Analyze the following backpacking gear list against the trip settings.
  1. Identify which items are ESSENTIAL for survival/safety (Shelter, Sleep, Rain gear, Water, Light, FAK). Return their IDs.
  2. Identify missing ESSENTIAL CATEGORIES (e.g. "No Rain Gear", "No Light Source", "No Shelter").
  3. Identify RED FLAGS (critical safety risks, e.g. "No warm layer for -5C").
  4. Assess the weight (Ultralight, Lightweight, Traditional, Heavy) considering the user's goal style (${settings.packStyle}).
  ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            essentialItemIds: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingCategories: { type: Type.ARRAY, items: { type: Type.STRING } },
            redFlags: { type: Type.ARRAY, items: { type: Type.STRING } },
            weightAssessment: { type: Type.STRING },
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No response");
    return JSON.parse(text) as PackAnalysis;
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      essentialItemIds: [],
      missingCategories: [],
      redFlags: [],
      weightAssessment: "Unknown"
    };
  }
};

// Get Gear Suggestions (Flash Lite) with JSON Schema
export const getGearSuggestions = async (items: GearItem[], settings: TripSettings): Promise<SuggestedItem[]> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);
  
  const prompt = `
  Based on the current pack and trip settings, suggest 3 to 6 items that the user is missing or should consider adding.
  Prioritize safety and comfort appropriate for the weather (${settings.weatherCondition}) and location.
  Do NOT suggest items that are already in the pack.
  ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING, enum: ['Shelter', 'Sleep', 'Clothing', 'Cooking', 'Water', 'Safety', 'Electronics', 'Misc'] },
              weight: { type: Type.NUMBER },
              reason: { type: Type.STRING },
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text) as SuggestedItem[];
  } catch (error) {
    console.error("Suggestion error:", error);
    return [];
  }
};

// Gemini Thinking (Pro Preview) for deep analysis
export const getDeepReview = async (items: GearItem[], settings: TripSettings): Promise<string> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);

  const prompt = `
  You are an expert backpacking guide named "CampCraft AI".
  Perform a deep, comprehensive safety and weight analysis of this loadout.
  
  Your output should use the following Markdown headers:
  ## Overall Pack Summary
  ## Critical Checks (Pass/Fail/Warn)
  ## Suggested Removals / Simplifications
  ## Trip-specific Advice

  Think deeply about the specific weather (${settings.weatherCondition}, ${settings.lowTemp}°C) and location (${settings.location}).
  Consider the user's pack style goal: ${settings.packStyle}.
  If safety items are missing (First Aid, Light, Navigation, Shelter), flag them clearly.
  Do NOT give medical advice.
  
  ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return response.text || "Could not generate deep review.";
  } catch (error) {
    console.error("Deep review error:", error);
    return "Error generating deep review. Please try again.";
  }
};

// Chat (Pro Preview)
export const sendChatMessage = async (
  history: {role: 'user' | 'model', content: string}[], 
  newMessage: string, 
  items: GearItem[], 
  settings: TripSettings
): Promise<string> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);
  
  const systemInstruction = `
  You are CampCraft, a helpful hiking gear assistant.
  Current Context:
  ${context}

  Answer the user's question specifically about their current pack and trip.
  Keep answers relatively concise unless asked for detail.
  Be friendly and practical.
  `;

  try {
    const validHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.content }]
    }));

    const chatSession = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: { systemInstruction },
      history: validHistory
    });

    const result = await chatSession.sendMessage({ message: newMessage });
    return result.text || "I'm not sure what to say.";

  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I'm having trouble connecting to the trail satellite (API Error).";
  }
};

// Search Grounding (Flash) for specific gear queries
export const searchGearInfo = async (query: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Find information about backpacking gear: ${query}. Summarize key specs or usage advice.`,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });
    
    return response.text || "No results found.";
  } catch (error) {
    console.error("Search error:", error);
    return "Could not perform search.";
  }
};
