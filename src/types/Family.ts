import { Timestamp } from "firebase/firestore";

export interface Family {
  id: string; // Firestore document ID
  name: string;
  description?: string; // Optional description
  // The user who originally created the family.
  // While adminIds allows multiple admins, knowing the original creator can be useful.
  createdById: string; 
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
