import { GoogleGenAI } from "@google/genai";
import { PROMPTS } from '../constants';
import { GenerationMode, AspectRatio, AssetItem } from '../types';

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper to convert base64 URL to GenerativePart
const base64UrlToGenerativePart = async (base64Url: string): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  // If it's a data URL, extract base64
  if (base64Url.startsWith('data:')) {
    const base64Content = base64Url.split(',')[1];
    const mimeType = base64Url.match(/data:([^;]+)/)?.[1] || 'image/png';
    return {
      inlineData: {
        data: base64Content,
        mimeType,
      },
    };
  }
  
  // If it's a URL, fetch and convert
  const response = await fetch(base64Url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: blob.type || 'image/png',
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const generateFoodImage = async (
  imageFile: File, 
  mode: GenerationMode, 
  aspectRatio: AspectRatio = AspectRatio.FOUR_THREE,
  asset?: AssetItem | null,
  foodDescription?: string
): Promise<string> => {
  try {
    // We strictly use gemini-3-pro-image-preview for high quality as requested
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                   (window as any).process?.env?.GEMINI_API_KEY || 
                   (window as any).process?.env?.API_KEY || '';
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("APIキーが設定されていません。環境変数VITE_GEMINI_API_KEYを設定してください。");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    const imagePart = await fileToGenerativePart(imageFile);
    
    // Build prompt with asset reference if available
    let textPrompt = `${PROMPTS.BASE} ${PROMPTS[mode]}`;
    
    // Add food description if provided
    if (foodDescription && foodDescription.trim() !== '') {
      textPrompt += ` Food description: ${foodDescription.trim()}. Use this information to enhance the accuracy of the food representation.`;
    }
    
    if (asset) {
      if (asset.type === 'store') {
        textPrompt += ` Use the store environment and background from the provided store reference image to make it look like it was actually photographed in this store.`;
      } else if (asset.type === 'table') {
        textPrompt += ` Use the table surface and setting from the provided table reference image to make it look like it was actually photographed on this table.`;
      }
    }

    // Build parts array
    const parts: any[] = [imagePart];
    
    // Add asset image if available
    if (asset) {
      try {
        const assetImageUrl = `http://localhost:3001${asset.imageUrl}`;
        const assetPart = await base64UrlToGenerativePart(assetImageUrl);
        parts.push(assetPart);
      } catch (assetError) {
        console.warn('Failed to load asset image, continuing without it:', assetError);
      }
    }
    
    // Add text prompt
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts
      },
      config: {
        imageConfig: {
          imageSize: '2K', // High quality request
          aspectRatio: aspectRatio // User-selected aspect ratio
        }
      }
    });

    // Check for image in response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};

// Retake function: Generate image based on previously generated image with adjustment prompt
export const generateFoodImageRetake = async (
  generatedImageUrl: string, // Base64 data URL of the generated image
  mode: GenerationMode,
  aspectRatio: AspectRatio = AspectRatio.FOUR_THREE,
  adjustmentPrompt: string // User's adjustment instructions
): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 
                   (window as any).process?.env?.GEMINI_API_KEY || 
                   (window as any).process?.env?.API_KEY || '';
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error("APIキーが設定されていません。環境変数VITE_GEMINI_API_KEYを設定してください。");
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // Convert generated image (base64 data URL) to GenerativePart
    const imagePart = await base64UrlToGenerativePart(generatedImageUrl);
    
    // Build prompt with adjustment instructions
    let textPrompt = `${PROMPTS.BASE} ${PROMPTS[mode]}`;
    
    // Add adjustment prompt if provided
    if (adjustmentPrompt && adjustmentPrompt.trim() !== '') {
      textPrompt += ` Additional adjustments requested: ${adjustmentPrompt.trim()}`;
    }

    // Build parts array
    const parts: any[] = [imagePart];
    
    // Add text prompt
    parts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts
      },
      config: {
        imageConfig: {
          imageSize: '2K',
          aspectRatio: aspectRatio
        }
      }
    });

    // Check for image in response
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating retake image:", error);
    throw error;
  }
};