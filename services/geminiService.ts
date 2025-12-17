import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ExtractionResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    tableData: {
      type: Type.ARRAY,
      description: "A 2D array representing the rows and columns extracted from the image.",
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      }
    }
  },
  required: ["tableData"]
};

/**
 * Converts a File object to a Base64 string.
 */
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Extracts table data from an image using Gemini.
 */
export const extractTableFromImage = async (file: File): Promise<ExtractionResult> => {
  try {
    const base64Data = await fileToGenerativePart(file);

    const modelId = "gemini-2.5-flash"; // Efficient and good at vision tasks
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          {
            text: `You are a high-precision data extraction engine.
            
            Task: Extract all tabular data from the image into a clean 2D array.
            
            CRITICAL RULES:
            1. **Verbatim Extraction**: Extract text EXACTLY as it appears. Do not correct spelling, do not add spaces, and DO NOT remove hyphens, dashes, or special characters. 
               - Example: If the image says "RG-15221-I2I3G-10KW-8.75", output "RG-15221-I2I3G-10KW-8.75". Do not shorten it to "RG-15221" or remove the inner hyphens.
            2. **Alphanumeric Codes**: Pay extreme attention to technical codes, serial numbers, and part numbers. Distinguish clearly between 'I' (capital i), 'l' (lowercase L), '1' (one), and '|' (pipe).
            3. **Structure**: Preserve the grid structure. If there is a visual gap or empty cell between columns, insert an empty string ("") to maintain alignment.
            4. **Merged Cells**: If a value visually spans multiple columns, place the value in the first cell and empty strings in the subsequent covered cells, or replicate if appropriate for headers.
            5. **Completeness**: Do not skip any text "between" other elements. Capture every visible character.

            Return only the structured JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are a meticulous OCR assistant. Your highest priority is character-for-character accuracy. Never summarize or auto-correct technical data."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini.");
    }

    const result = JSON.parse(text) as ExtractionResult;
    return result;

  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw new Error("Failed to process image. Please try again.");
  }
};