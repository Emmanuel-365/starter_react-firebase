// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage"; // Added for Firebase Storage as per README

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app); // Initialize Firebase Storage

import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";

// Export Firebase services
export { app, auth, db, storage };

// Log to console to confirm Firebase is initialized (optional, for development)
console.log("Firebase initialized with Project ID:", firebaseConfig.projectId);

// Interface for email data to be saved
export interface EmailHistoryEntry {
  userId: string; // ID of the user who sent the email
  to: string;
  subject: string;
  body: string;
  sentAt: Timestamp; // Firestore Timestamp for server-side timestamping
  // Add any other fields you want to store, e.g., status, emailjsResponseId
}

/**
 * Saves an email to the user's history in Firestore.
 * @param emailData - The email data to save.
 * @returns A promise that resolves when the email is saved.
 */
export const saveEmailToHistory = async (emailData: Omit<EmailHistoryEntry, 'sentAt' | 'id'>): Promise<void> => {
  if (!db) {
    console.error("Firestore database is not initialized!");
    throw new Error("Firestore database is not initialized.");
  }
  if (!emailData.userId) {
    console.warn("Attempting to save email history without a userId. This email will not be associated with a specific user.");
    // In a real app, you might prevent saving or assign to an anonymous/guest ID
    // For now, we'll proceed but this should be handled by auth.
  }

  try {
    const historyCollectionRef = collection(db, "emailHistory"); // Collection name
    await addDoc(historyCollectionRef, {
      ...emailData,
      sentAt: serverTimestamp(), // Use server timestamp
    });
    console.log("Email saved to history successfully.");
  } catch (error) {
    console.error("Error saving email to history:", error);
    throw error; // Re-throw to be handled by the caller
  }
};
