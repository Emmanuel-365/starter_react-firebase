import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db, auth } from "./firebase"; // Assuming auth might be needed for current user context
import type { Family } from "../types/Family";
import { type FamilyMember, FamilyMemberRole, FamilyMemberStatus, type MemberProfileInfo } from "../types/FamilyMember";

const familiesCollection = collection(db, "families");
const familyMembersCollection = collection(db, "familyMembers");

/**
 * Creates a new family and adds the creator as the first admin member.
 * @param name - The name of the family.
 * @param createdById - The ID of the user creating the family.
 * @param description - Optional description for the family.
 * @returns The ID of the newly created family.
 */
export const createFamily = async (
  name: string,
  createdById: string,
  description?: string
): Promise<string> => {
  if (!createdById) {
    throw new Error("User ID is required to create a family.");
  }

  const batch = writeBatch(db);

  // 1. Create the family document
  const familyDocRef = doc(familiesCollection); // Auto-generate ID
  const newFamilyData: Omit<Family, "id"> = {
    name,
    description: description || "",
    createdById,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp,
  };
  batch.set(familyDocRef, newFamilyData);

  // 2. Add the creator as the first admin member of this family
  const memberDocRef = doc(familyMembersCollection); // Auto-generate ID
  // Attempt to get user's profile info (e.g., email for profile if needed)
  // This part is simplified; in a real app, you'd fetch the user's actual profile for defaults
  const creatorProfile: MemberProfileInfo = {
    firstName: auth.currentUser?.displayName || "Admin", // Placeholder
    relationship: "Créateur", // Or "Admin"
  };

  const firstMemberData: Omit<FamilyMember, "id"> = {
    familyId: familyDocRef.id,
    userId: createdById,
    profileInfo: creatorProfile, // Should ideally fetch from user's main profile
    role: FamilyMemberRole.ADMIN,
    status: FamilyMemberStatus.ACTIVE, // Creator is active by default
    joinedAt: serverTimestamp() as Timestamp,
  };
  batch.set(memberDocRef, firstMemberData);

  await batch.commit();
  console.log(`Family created with ID: ${familyDocRef.id} and admin member ${memberDocRef.id}`);
  return familyDocRef.id;
};

/**
 * Retrieves all families a specific user belongs to.
 * It queries the familyMembers collection for the userId, then fetches the family details.
 * @param userId - The ID of the user.
 * @returns A promise that resolves to an array of Family objects.
 */
export const getUserFamilies = async (userId: string): Promise<Family[]> => {
  if (!userId) {
    console.warn("getUserFamilies called without a userId.");
    return [];
  }

  const q = query(familyMembersCollection, where("userId", "==", userId), where("status", "==", FamilyMemberStatus.ACTIVE));
  const memberDocsSnapshot = await getDocs(q);

  if (memberDocsSnapshot.empty) {
    return [];
  }

  const familyIds = memberDocsSnapshot.docs.map(doc => doc.data().familyId as string);
  
  if (familyIds.length === 0) {
    return [];
  }

  // Fetch details for each family
  // Firestore 'in' query supports up to 30 equality clauses. If more, batch or change strategy.
  const familyDetailsPromises = familyIds.map(familyId => getFamilyDetails(familyId));
  const families = (await Promise.all(familyDetailsPromises)).filter(family => family !== null) as Family[];
  
  return families;
};

/**
 * Retrieves the details of a specific family.
 * @param familyId - The ID of the family.
 * @returns A promise that resolves to a Family object or null if not found.
 */
export const getFamilyDetails = async (familyId: string): Promise<Family | null> => {
  if (!familyId) {
    console.error("getFamilyDetails called without familyId");
    return null;
  }
  const familyDocRef = doc(db, "families", familyId);
  const familyDocSnap = await getDoc(familyDocRef);

  if (familyDocSnap.exists()) {
    return { id: familyDocSnap.id, ...familyDocSnap.data() } as Family;
  } else {
    console.log(`No family found with ID: ${familyId}`);
    return null;
  }
};

/**
 * Updates the name and/or description of a family.
 * @param familyId - The ID of the family to update.
 * @param data - An object containing the fields to update (name, description).
 * @returns A promise that resolves when the update is complete.
 */
export const updateFamily = async (
  familyId: string,
  data: Partial<Pick<Family, "name" | "description">>
): Promise<void> => {
  if (!familyId) {
    throw new Error("Family ID is required to update a family.");
  }
  if (Object.keys(data).length === 0) {
    console.warn("updateFamily called with no data to update.");
    return;
  }

  const familyDocRef = doc(db, "families", familyId);
  const updateData: any = { ...data, updatedAt: serverTimestamp() };
  
  await updateDoc(familyDocRef, updateData);
  console.log(`Family ${familyId} updated.`);
};

/**
 * Deletes a family and all its associated members.
 * This is a critical operation and should be handled with care on the frontend (e.g., confirmation dialog).
 * @param familyId - The ID of the family to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const deleteFamily = async (familyId: string): Promise<void> => {
  if (!familyId) {
    throw new Error("Family ID is required to delete a family.");
  }

  const batch = writeBatch(db);

  // 1. Delete all members of the family
  const membersQuery = query(familyMembersCollection, where("familyId", "==", familyId));
  const membersSnapshot = await getDocs(membersQuery);
  membersSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  // 2. Delete the family itself
  const familyDocRef = doc(db, "families", familyId);
  batch.delete(familyDocRef);

  await batch.commit();
  console.log(`Family ${familyId} and all its members have been deleted.`);
};

/**
 * Adds a new member to a family.
 * If memberData.userId is provided (existing user), status is PENDING, and an invitation should be triggered.
 * If memberData.userId is not provided (manual profile), status is ACTIVE.
 * @param familyId - The ID of the family to add the member to.
 * @param memberData - Core data for the new member (excluding id, familyId).
 * @param invitedByUserId - The ID of the user who is adding this member.
 * @returns The ID of the newly added family member document.
 */
// This is the core logic without email sending, not exported directly.
const internalAddFamilyMember = async (
  familyId: string,
  memberData: Omit<FamilyMember, "id" | "familyId" | "status" | "joinedAt" | "invitationSentAt" | "updatedAt" | "invitedEmail"> & { userId?: string; profileInfo: MemberProfileInfo; role: FamilyMemberRole; invitedEmail?: string },
  invitedByUserId: string
): Promise<{memberId: string, fullMemberData: Omit<FamilyMember, "id">}> => {
  if (!familyId || !invitedByUserId) {
    throw new Error("Family ID and inviting user ID are required.");
  }
  if (!memberData.profileInfo || !memberData.profileInfo.firstName) {
    throw new Error("Member's first name is required in profileInfo.");
  }

  const newMemberDocRef = doc(familyMembersCollection); // Firestore auto-generates an ID for this ref

  // Base data, always present
  const dataToSave: any = { // Use 'any' temporarily for easier conditional property adding, or build step-by-step
    familyId: familyId,
    profileInfo: memberData.profileInfo,
    role: memberData.role,
    status: (memberData.userId || memberData.invitedEmail) ? FamilyMemberStatus.PENDING : FamilyMemberStatus.ACTIVE,
    invitedByUserId: invitedByUserId,
    invitationSentAt: (memberData.userId || memberData.invitedEmail) ? serverTimestamp() : undefined,
    joinedAt: !(memberData.userId || memberData.invitedEmail) ? serverTimestamp() : undefined,
    updatedAt: serverTimestamp(),
  };

  // Conditionally add userId and invitedEmail to avoid storing 'undefined'
  if (memberData.userId) {
    dataToSave.userId = memberData.userId;
  }
  if (memberData.invitedEmail) {
    dataToSave.invitedEmail = memberData.invitedEmail;
  }
  
  // Remove any fields that are explicitly undefined, as Firestore does not support them.
  // serverTimestamp() is fine, it's a sentinel value.
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === undefined) {
      delete dataToSave[key];
    }
  });

  // Use setDoc with the pre-generated document reference
  await setDoc(newMemberDocRef, dataToSave); 
  const memberId = newMemberDocRef.id;

  // Construct fullMemberData for return by spreading dataToSave and adding server-generated timestamps if needed
  // For simplicity, we'll return dataToSave which now correctly omits undefined fields.
  // The actual timestamp values will be on the server, this fullMemberData is mostly for client-side state update.
  const fullMemberDataForReturn: Omit<FamilyMember, "id"> = {
    ...dataToSave,
    // If serverTimestamp() was used, those fields will be placeholder objects on client until data is refetched.
    // This is usually fine for Redux state updates.
    createdAt: dataToSave.createdAt || serverTimestamp(), // Example if createdAt was part of it
    updatedAt: dataToSave.updatedAt || serverTimestamp(),
    joinedAt: dataToSave.joinedAt, // Will be serverTimestamp() or undefined
    invitationSentAt: dataToSave.invitationSentAt, // Will be serverTimestamp() or undefined
  };


  console.log(`Member ${memberId} (internal) added to family ${familyId}. Status: ${dataToSave.status}`);
  return {memberId, fullMemberData: fullMemberDataForReturn };
};

/**
 * Retrieves all members of a specific family.
 * @param familyId - The ID of the family.
 * @returns A promise that resolves to an array of FamilyMember objects.
 */
export const getFamilyMembers = async (familyId: string): Promise<FamilyMember[]> => {
  if (!familyId) {
    console.warn("getFamilyMembers called without a familyId.");
    return [];
  }

  const q = query(familyMembersCollection, where("familyId", "==", familyId));
  const membersSnapshot = await getDocs(q);

  if (membersSnapshot.empty) {
    return [];
  }

  return membersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FamilyMember));
};

/**
 * Updates the role of a family member.
 * @param memberId - The ID of the family member document to update.
 * @param role - The new role for the member.
 * @returns A promise that resolves when the update is complete.
 */
export const updateFamilyMemberRole = async (
  memberId: string,
  role: FamilyMemberRole
): Promise<void> => {
  if (!memberId) {
    throw new Error("Member ID is required to update a role.");
  }
  const memberDocRef = doc(db, "familyMembers", memberId);
  // Potentially add checks here to ensure the updater has permission,
  // and that roles are not changed in a way that leaves no admin, etc.
  // For now, keeping it simple.
  await updateDoc(memberDocRef, {
    role: role,
    updatedAt: serverTimestamp() // Assuming an 'updatedAt' field in FamilyMember
  });
  console.log(`Role for member ${memberId} updated to ${role}.`);
};


/**
 * Removes a member from a family.
 * @param memberId - The ID of the family member document to delete.
 * @returns A promise that resolves when the deletion is complete.
 */
export const removeFamilyMember = async (memberId: string): Promise<void> => {
  if (!memberId) {
    throw new Error("Member ID is required to remove a member.");
  }
  // Add permission checks: only admin of the family should be able to remove.
  // Also, an admin should not be able to remove themselves if they are the last admin.
  const memberDocRef = doc(db, "familyMembers", memberId);
  await deleteDoc(memberDocRef);
  console.log(`Member ${memberId} removed from family.`);
};


// Functions for managing invitations: accept, decline

/**
 * Allows a user to accept an invitation to join a family.
 * Updates the FamilyMember status to ACTIVE and sets the joinedAt timestamp.
 * @param familyMemberId - The ID of the FamilyMember document representing the invitation.
 * @param userId - The ID of the user accepting the invitation (for verification).
 */
export const acceptFamilyInvitation = async (familyMemberId: string, userId: string): Promise<void> => {
  if (!familyMemberId || !userId) {
    throw new Error("FamilyMember ID and User ID are required to accept an invitation.");
  }

  const memberDocRef = doc(db, "familyMembers", familyMemberId);
  const memberDocSnap = await getDoc(memberDocRef);

  if (!memberDocSnap.exists()) {
    throw new Error(`Invitation (FamilyMember) with ID ${familyMemberId} not found.`);
  }

  const memberData = memberDocSnap.data() as FamilyMember;

  if (memberData.userId !== userId) {
    throw new Error(`This invitation is for a different user.`);
  }
  if (memberData.status !== FamilyMemberStatus.PENDING) {
    throw new Error(`This invitation is not currently pending (status: ${memberData.status}).`);
  }

  await updateDoc(memberDocRef, {
    status: FamilyMemberStatus.ACTIVE,
    joinedAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() // Assuming an 'updatedAt' field
  });
  console.log(`User ${userId} accepted invitation ${familyMemberId}. Status set to ACTIVE.`);
};

/**
 * Allows a user to decline an invitation to join a family.
 * Updates the FamilyMember status to DECLINED.
 * (Alternatively, one could delete the FamilyMember document).
 * @param familyMemberId - The ID of the FamilyMember document representing the invitation.
 * @param userId - The ID of the user declining the invitation (for verification).
 */
export const declineFamilyInvitation = async (familyMemberId: string, userId: string): Promise<void> => {
  if (!familyMemberId || !userId) {
    throw new Error("FamilyMember ID and User ID are required to decline an invitation.");
  }

  const memberDocRef = doc(db, "familyMembers", familyMemberId);
  const memberDocSnap = await getDoc(memberDocRef);

  if (!memberDocSnap.exists()) {
    throw new Error(`Invitation (FamilyMember) with ID ${familyMemberId} not found.`);
  }

  const memberData = memberDocSnap.data() as FamilyMember;
   if (memberData.userId !== userId) {
    throw new Error(`This invitation is for a different user.`);
  }
  if (memberData.status !== FamilyMemberStatus.PENDING) {
    // Allow declining even if not strictly pending, perhaps? For now, strict.
    console.warn(`Attempt to decline an invitation that is not pending (status: ${memberData.status}).`);
    // Or throw: throw new Error(`This invitation is not currently pending.`);
  }

  await updateDoc(memberDocRef, {
    status: FamilyMemberStatus.DECLINED,
    updatedAt: serverTimestamp() // Assuming an 'updatedAt' field
  });
  // Or: await deleteDoc(memberDocRef); if we prefer to remove declined invitations.
  console.log(`User ${userId} declined invitation ${familyMemberId}. Status set to DECLINED.`);
};


// import { generateEmailContent } from "./geminiService"; // Already imported at the top implicitly
import { sendEmail } from "./emailjsService"; // Make sure this path is correct
import { saveEmailToHistory } from "./firebase"; // For logging sent emails
import { generateEmailContent } from "./geminiService";


// Simulated function to get user profile information needed for emails.
// In a real application, this would fetch data from your 'users' collection in Firestore.
interface UserProfileForEmail {
  id: string;
  displayName?: string | null; // Firebase's displayName can be null
  email?: string | null;       // Firebase's email can be null
}

const getUserProfileInfoForEmail = async (userId: string): Promise<UserProfileForEmail | null> => {
  console.log(`Simulating fetch for user profile for email: ${userId}`);
  // Simulate fetching the current user from auth state
  if (auth.currentUser && auth.currentUser.uid === userId) {
    return {
      id: userId,
      displayName: auth.currentUser.displayName,
      email: auth.currentUser.email,
    };
  }
  // Simulate fetching another user (e.g., the one being invited)
  // This is a very basic simulation. You'd query your users collection here.
  // For demonstration, let's assume we can't actually fetch other users this way directly
  // and rely on the email being passed if available, or using a placeholder.
  // In a real scenario, you might have a users collection:
  // const userDocRef = doc(db, "users", userId);
  // const userDocSnap = await getDoc(userDocRef);
  // if (userDocSnap.exists()) {
  //   return { id: userId, ...userDocSnap.data() } as UserProfileForEmail;
  // }
  
  // Fallback for simulation if no specific user mock is set up
  // In a real app, if the user is not found, you might not be able to send an email
  // or would rely on an email address provided directly during the invitation process.
  console.warn(`getUserProfileInfoForEmail: Could not find user ${userId}, returning null. Email sending might rely on explicitly provided email.`);
  return null; 
};


// This is now the main exported function that includes email sending.
export const addFamilyMember = async (
  familyId: string,
  memberData: Omit<FamilyMember, "id" | "familyId" | "status" | "joinedAt" | "invitationSentAt" | "updatedAt" | "invitedEmail"> & { userId?: string; profileInfo: MemberProfileInfo; role: FamilyMemberRole; invitedEmail?: string },
  invitedByUserId: string
): Promise<string> => {
  // Call the internal logic to add member to Firestore
  const { memberId, fullMemberData } = await internalAddFamilyMember(familyId, memberData, invitedByUserId);

  // Trigger email invitation if status is PENDING
  if (fullMemberData.status === FamilyMemberStatus.PENDING && (fullMemberData.userId || fullMemberData.invitedEmail)) {
    const family = await getFamilyDetails(familyId);
    const invitingUser = await getUserProfileInfoForEmail(invitedByUserId);
    
    let targetEmail: string | null | undefined = memberData.invitedEmail;
    let targetName = memberData.profileInfo.firstName;

    if (memberData.userId) {
        const targetUser = await getUserProfileInfoForEmail(memberData.userId);
        if (targetUser?.email) {
            targetEmail = targetUser.email;
        }
        // If targetUser.displayName exists, it could also be used.
    }

    if (family && invitingUser && targetEmail) {
      const inviterName = invitingUser?.displayName || invitingUser?.email || "Someone";
      const familyName = family.name;
      const newMemberFirstName = memberData.profileInfo.firstName;
      const newMemberRole = memberData.role;

      // Construct a more detailed prompt for Gemini
      const prompt = `
        Generate a friendly and welcoming email invitation.
        The sender is ${inviterName}.
        The recipient is ${newMemberFirstName}.
        ${inviterName} is inviting ${newMemberFirstName} to join their family, named "${familyName}", on our application.
        The application helps families organize meals and connect.
        Mention that ${newMemberFirstName} will have the role of "${newMemberRole}" in the family.
        Include a call to action, like "Click here to accept the invitation" (though we won't generate a real link here, just the text).
        Keep the tone warm and personal.
        The email should be in French.
      `;

      try {
        console.log("Attempting to generate email content with Gemini...");
        const emailBody = await generateEmailContent(prompt);
        const emailSubject = `Invitation à rejoindre la famille ${familyName} !`;
        
        console.log(`Generated email body: ${emailBody}`);
        console.log(`Attempting to send email via EmailJS to ${targetEmail}...`);

        await sendEmail({
          to_email: targetEmail,
          subject: emailSubject,
          message: emailBody, // This will be the HTML body if your EmailJS template is set up for HTML
          to_name: newMemberFirstName,
          from_name: inviterName, // Or your app's name
        });
        
        console.log(`Invitation email successfully sent to ${targetEmail}`);
        
        await saveEmailToHistory({
          userId: invitedByUserId, // The user who triggered the invitation
          to: targetEmail,
          subject: emailSubject,
          body: emailBody, 
          // sentAt is handled by saveEmailToHistory
        });
        console.log(`Invitation email to ${targetEmail} saved to history.`);

      } catch (error) {
        console.error("Failed to generate or send invitation email:", error);
        // Potentially update member status to FAILED_INVITATION or similar, or just log
      }
    } else {
      console.warn(`Could not send invitation email for member ${memberId} due to missing information:`, { familyExists: !!family, invitingUserExists: !!invitingUser, targetEmailExists: !!targetEmail });
    }
  }
  return memberId;
};

// Ensure the old export of addFamilyMember is removed or handled if it was different.
// The new addFamilyMember (which calls internalAddFamilyMember and then handles email) is now the primary export.

console.log("Family service initialized with member, invitation, and enhanced email functions.");
