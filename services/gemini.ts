
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

// Estimate Gear Weight (Flash Search + Flash Lite Extraction)
export const estimateGearWeight = async (itemName: string): Promise<number> => {
  const ai = getClient();
  
  try {
    // Step 1: Search for the info using Flash (Standard) to get real world data
    const searchPrompt = `Find the weight in grams for the hiking/camping item: "${itemName}". 
    If it's a specific product, find its actual weight. 
    If it's generic, find a typical weight for a lightweight backpacking version.
    Provide the weight clearly.`;
    
    const searchResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: searchPrompt,
      config: {
        tools: [{ googleSearch: {} }],
      }
    });

    const searchResultText = searchResponse.text || "";

    // Step 2: Extract specific number using Flash Lite
    const extractionPrompt = `
    Based on the following search result text, extract the weight of "${itemName}" in GRAMS.
    
    Search Result Text: "${searchResultText}"
    
    Rules:
    - Return a JSON object with a single "weight" property (number).
    - If a range is found (e.g. 200-300g), return the average.
    - If units are pounds (lbs) or ounces (oz), convert to grams (1 oz = 28.35g, 1 lb = 453.6g).
    - If NO weight is found in the text, estimate a reasonable weight based on your own knowledge for a generic version of "${itemName}".
    - Example output: {"weight": 1200}
    `;

    const extractionResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: extractionPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weight: { type: Type.NUMBER, description: "Weight in grams" }
          }
        }
      }
    });

    const text = extractionResponse.text;
    if (!text) return 0;
    const json = JSON.parse(text);
    // Round to 1 decimal place
    let weight = typeof json.weight === 'number' ? Math.round(json.weight * 10) / 10 : 0;
    
    // Safety check: if weight is suspiciously small (e.g. < 5) it might be kg. Convert to g.
    if (weight > 0 && weight < 5) {
        weight = weight * 1000;
    }

    return weight;

  } catch (error) {
    console.error("Weight estimation error:", error);
    
    // Fallback: Just ask Flash Lite if search fails
    try {
        const fallbackPrompt = `Estimate the weight in GRAMS for: "${itemName}". Return JSON { "weight": number }.`;
        const fallbackResp = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: fallbackPrompt,
            config: { responseMimeType: 'application/json' }
        });
        const json = JSON.parse(fallbackResp.text || "{}");
        return json.weight || 0;
    } catch (e) {
        return 0;
    }
  }
};

// Analyze Pack (Flash Lite) with JSON Schema
export const analyzePack = async (items: GearItem[], settings: TripSettings): Promise<PackAnalysis> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);
  
  const prompt = `
  Analyze the following backpacking gear list against the trip settings.
  1. Identify which items are ESSENTIAL for survival/safety (Shelter, Sleep, Rain gear, Water, Light, FAK). 
     Return their exact IDs in 'essentialItemIds'. Be strict: luxury items (pillow, electronics, camp shoes, extra cup) are NOT essential.
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
    
    const parsed = JSON.parse(text);
    
    return {
        essentialItemIds: parsed.essentialItemIds || [],
        missingCategories: parsed.missingCategories || [],
        redFlags: parsed.redFlags || [],
        weightAssessment: parsed.weightAssessment || "Unknown"
    };

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

// Get Gear Suggestions (Gemini Thinking + Search)
export const getGearSuggestions = async (items: GearItem[], settings: TripSettings): Promise<SuggestedItem[]> => {
  const ai = getClient();
  const context = formatPackContext(items, settings);
  
  const prompt = `
  You are an expert ultralight backpacking guide.
  Suggest 3 to 5 gear items that are MISSING from this pack or would be a significant upgrade.
  
  Rules for Suggestions:
  1. Suggest REAL PRODUCTS from well-known brands (e.g., Enlightened Equipment, Gossamer Gear, Hyperlite, Osprey, Petzl, Sawyer, Toaks, Patagonia, Montbell) whenever possible.
  2. Use the 'googleSearch' tool to verify the existence and approximate weight of these specific items.
  3. If searching fails or for general categories, suggest a "Generic" item but describe typical weights.
  4. WEIGHTS MUST BE REALISTIC. 
     - Do not invent precise numbers (like 231.5g) unless you found a spec.
     - Prefer ranges if weight varies by size (e.g. "300-400g").
  
  Output Format (JSON Array):
  - "name": Brand and Model (e.g. "Enlightened Equipment Revelation 20F") or Generic Name.
  - "category": Shelter, Sleep, Clothing, Cooking, Water, Safety, Electronics, or Misc.
  - "weight": A single numeric estimate in GRAMS (integer) for the calculator. (e.g. 550).
  - "weightDisplay": A text string describing the weight honestly. (e.g. "~550g" or "400-600g").
  - "reason": Brief 1-sentence reason.

  Context:
  ${context}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Thinking models work best when allowed to output thinking trace, 
        // asking for strict JSON schema with tools can sometimes be brittle in preview.
        // We will parse the code block.
      }
    });

    const text = response.text;
    if (!text) return [];
    
    try {
        // Extract JSON from code block
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/);
        const jsonStr = jsonMatch ? jsonMatch[1] : text;
        const suggestions = JSON.parse(jsonStr);
        return Array.isArray(suggestions) ? suggestions : [];
    } catch (parseError) {
        console.warn("Failed to parse suggestions JSON:", text);
        return [];
    }

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
  Give specific advice on how to reduce weight if they are over heavy.
  
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
