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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Updated model

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

    // Check if response.text is a function before calling it
    if (typeof response.text === 'function') {
      const text = response.text();
      console.log("Gemini API response:", text);
      return text;
    } else {
      // Handle cases where response.text is not a function (e.g., if the API changes or there's an unexpected response structure)
      const noTextMessage = "Gemini API response does not contain a text function.";
      console.error(noTextMessage, response);
      return Promise.reject(new Error(noTextMessage));
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Enhance error message for better debugging
    const err = error as Error;
    const errorMessage = `Gemini API request failed: ${err.message || 'Unknown error'}`;
    return Promise.reject(new Error(errorMessage));
  }
};

interface ChatMessage {
  role: "user" | "model";
  parts: Array<{ text: string }>;
}

/**
 * Generates a chat response using the Gemini API, restricted to cooking and user information.
 *
 * @param userPrompt The user's message.
 * @param history The conversation history.
 * @param generationConfig Optional configuration for the generation process.
 * @returns A promise that resolves with the generated text or rejects with an error.
 */
export const generateChatResponse = async (
  userPrompt: string,
  history: ChatMessage[], // Assuming history is an array of ChatMessage objects
  generationConfig: GenerationConfig = defaultGenerationConfig
): Promise<string> => {
  if (!API_KEY) {
    const errorMessage = "Gemini API Key is not configured. Please set VITE_GEMINI_API_KEY.";
    console.error(errorMessage);
    return Promise.reject(new Error(errorMessage));
  }

  // System instruction to guide the model's behavior
  const systemInstruction = {
    role: "system", // Or use a specific role if the API supports it for system-level instructions
    parts: [{ text: "Tu es un assistant culinaire. Tu ne dois répondre qu'aux questions concernant la cuisine, les recettes, les ingrédients, les techniques de cuisson et les informations relatives à l'utilisateur dans ce contexte. Ignore toute autre question. Si une question n'est pas liée à la cuisine, réponds poliment que tu ne peux pas aider avec ce sujet." }],
  };
  
  // Construct the full prompt including history and the new user message
  // The exact format for including system instructions might vary based on API updates.
  // This example prepends it to the history.
  const fullHistory: ChatMessage[] = [
    // The system instruction might be passed differently depending on the API's capabilities.
    // For some models, it's part of the initial message or a separate parameter.
    // For this example, let's assume it's treated like a message in the history.
    // However, for newer models/APIs, there might be a dedicated 'system' role or parameter.
    // The GoogleGenerativeAI SDK might handle system instructions differently.
    // It's often part of the model's initialization or a specific parameter in generateContent.
    // For now, we'll prepend a user role message that acts as a system instruction.
    // This is a common workaround if a direct 'system' role isn't explicitly supported in the `contents` array in the same way.
    // Refer to the specific Gemini API documentation for the best way to set system-level instructions.
    // The instruction below is a simplified way to influence the model.
    { role: "user", parts: [{ text: "Important: Tu es un assistant culinaire. Tu ne dois répondre qu'aux questions concernant la cuisine, les recettes, les ingrédients, les techniques de cuisson. Ignore toute autre question. Si une question n'est pas liée à la cuisine, réponds poliment que tu ne peux pas aider avec ce sujet." }] },
    ...history,
    { role: "user", parts: [{ text: userPrompt }] }
  ];


  try {
    // It's good practice to use a model that's optimized for chat or instruction-following.
    // "gemini-1.5-flash" is a good general-purpose model.
    // For chat, ensure the model version supports multi-turn conversations well.
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


    // The `generateContent` method might take the history directly if formatted correctly.
    // The `contents` should be an array of `Content` objects, where each object has `role` and `parts`.
    const result = await model.generateContent({
      contents: fullHistory, // Pass the full conversation history
      generationConfig: { ...defaultGenerationConfig, ...generationConfig },
      safetySettings,
      // System instruction can also be passed here if supported by the SDK version
      // systemInstruction: systemInstruction, // This is hypothetical; check SDK docs
    });

    const response = result.response;
    if (response.promptFeedback?.blockReason) {
      const blockMessage = `Content generation blocked due to: ${response.promptFeedback.blockReason}. Details: ${response.promptFeedback.blockReasonMessage || 'No additional details.'}`;
      console.warn(blockMessage);
      return Promise.reject(new Error(blockMessage));
    }
    
    if (typeof response.text === 'function') {
        const text = response.text();
        console.log("Gemini API chat response:", text);
        return text;
    } else {
        const noTextMessage = "Gemini API chat response does not contain a text function.";
        console.error(noTextMessage, response);
        return Promise.reject(new Error(noTextMessage));
    }

  } catch (error) {
    console.error("Error calling Gemini API for chat:", error);
    const err = error as Error;
    const errorMessage = `Gemini API chat request failed: ${err.message || 'Unknown error'}`;
    return Promise.reject(new Error(errorMessage));
  }
};


// Example usage (for testing purposes, can be removed later):
/*
generateEmailContent("Write a short thank you email to a customer for their recent purchase.")
  .then(content => console.log("Generated email content:", content))
  .catch(err => console.error("Failed to generate email content:", err));
*/

console.log('Gemini service configured with chat functionality.');
