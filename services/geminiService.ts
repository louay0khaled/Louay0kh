
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generateImage(prompt: string): Promise<string> {
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  });

  if (response.generatedImages && response.generatedImages.length > 0) {
    return response.generatedImages[0].image.imageBytes;
  }
  
  throw new Error("Image generation failed or returned no images.");
}

export async function sortInventoryByName(productNames: string[]): Promise<string[]> {
    if (productNames.length === 0) {
        return [];
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Here is a list of products: ${productNames.join(', ')}. Please categorize them and return a JSON array of just the product names in a professionally sorted order based on common store categories (e.g., fruits, vegetables, dairy, etc.). Only return the JSON array of names.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.STRING
                }
            }
        }
    });
    
    try {
        const jsonStr = response.text.trim();
        const sortedNames = JSON.parse(jsonStr);
        if (Array.isArray(sortedNames) && sortedNames.every(item => typeof item === 'string')) {
            return sortedNames;
        }
        throw new Error("AI response is not a valid string array.");
    } catch(e) {
        console.error("Failed to parse AI sort response:", e);
        // Fallback to simple alphabetical sort on failure
        return productNames.sort();
    }
}
   