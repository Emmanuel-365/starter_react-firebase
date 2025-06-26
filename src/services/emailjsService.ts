import emailjs from '@emailjs/browser';

const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

interface EmailParams {
  to_name?: string; // Optional: recipient's name
  from_name?: string; // Optional: sender's name (or app name)
  reply_to?: string; // User's email, if they are sending on their own behalf
  to_email: string; // Recipient's email address
  subject: string;
  message: string;
  // Add any other parameters your EmailJS template expects
}

/**
 * Sends an email using EmailJS.
 *
 * @param templateParams The parameters for the EmailJS template.
 *                       Ensure these match the variables in your EmailJS template.
 * @returns A promise that resolves with the EmailJS response or rejects with an error.
 */
export const sendEmail = async (templateParams: EmailParams): Promise<emailjs.EmailJSResponseStatus> => {
  if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
    const missingVars = [
      !SERVICE_ID && "VITE_EMAILJS_SERVICE_ID",
      !TEMPLATE_ID && "VITE_EMAILJS_TEMPLATE_ID",
      !PUBLIC_KEY && "VITE_EMAILJS_PUBLIC_KEY"
    ].filter(Boolean).join(", ");
    console.error(`EmailJS environment variables are missing: ${missingVars}`);
    return Promise.reject(new Error(`EmailJS configuration is incomplete. Missing: ${missingVars}`));
  }

  try {
    // Default some parameters if not provided
    const paramsToSend = {
      to_name: templateParams.to_name || templateParams.to_email, // Default to_name to recipient's email if not set
      from_name: templateParams.from_name || "AI Email Assistant", // Default sender name
      ...templateParams,
    };

    console.log("Sending email with params:", paramsToSend);
    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, paramsToSend as Record<string, unknown>, PUBLIC_KEY);
    console.log('EmailJS SUCCESS!', response.status, response.text);
    return response;
  } catch (error) {
    console.error('EmailJS FAILED...', error);
    throw error; // Re-throw the error to be caught by the caller
  }
};

// Example usage (for testing purposes, can be removed later):
/*
sendEmail({
  to_email: 'test@example.com',
  subject: 'Hello from AI Assistant',
  message: 'This is a test email sent via EmailJS!'
})
.then(response => console.log('Test email sent successfully:', response))
.catch(err => console.error('Test email sending failed:', err));
*/

console.log('EmailJS service configured.');
