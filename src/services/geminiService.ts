import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("VITE_GEMINI_API_KEY is not set in the environment variables.");
  // Potentially throw an error or handle this scenario appropriately
  // For now, we'll let the application continue but log the error.
}

const genAI = new GoogleGenerativeAI(API_KEY || "DEFAULT_KEY_IF_NOT_SET"); // Fallback to avoid crash if API_KEY is undefined during init

interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

// Default generation configuration
const defaultGenerationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 2048, // Adjust as needed
};

// Safety settings to block harmful content
// Adjust these based on your application's needs
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Generates email content using the Gemini API.
 *
 * @param prompt The prompt to send to the Gemini API.
 * @param generationConfig Optional configuration for the generation process.
 * @returns A promise that resolves with the generated text or rejects with an error.
 */
export const generateEmailContent = async (
  prompt: string,
  generationConfig: GenerationConfig = defaultGenerationConfig
): Promise<string> => {
  if (!API_KEY) {
    const errorMessage = "Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY.";
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Or other suitable model like "gemini-1.0-pro"

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { ...defaultGenerationConfig, ...generationConfig },
      safetySettings,
    });

    const response = result.response;
    if (response.promptFeedback?.blockReason) {
        const blockMessage = `Content generation blocked due to: ${response.promptFeedback.blockReason}. Details: ${response.promptFeedback.blockReasonMessage || 'No additional details.'}`;
        console.warn(blockMessage);
        return Promise.reject(new Error(blockMessage));
    }

    const text = response.text();
    console.log("Gemini API response:", text);
    return text;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Enhance error message for better debugging
    const err = error as Error;
    const errorMessage = `Gemini API request failed: ${err.message || 'Unknown error'}`;
    return Promise.reject(new Error(errorMessage));
  }
};

// Example usage (for testing purposes, can be removed later):
/*
generateEmailContent("Write a short thank you email to a customer for their recent purchase.")
  .then(content => console.log("Generated email content:", content))
  .catch(err => console.error("Failed to generate email content:", err));
*/

console.log('Gemini service configured.');
