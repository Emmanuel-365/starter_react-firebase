import { Timestamp } from "firebase/firestore";

export const FamilyMemberRole = {
  ADMIN: "admin", // Full control, including member management and deleting the family
  SECONDARY_ADMIN: "secondaryAdmin", // Can manage day-to-day aspects (e.g., recipes), but not members or family settings
  MEMBER: "member", // Standard member, can view and participate
} as const;
export type FamilyMemberRole = typeof FamilyMemberRole[keyof typeof FamilyMemberRole];

export const FamilyMemberStatus = {
  PENDING: "pending", // Invitation sent, awaiting acceptance by a registered user
  ACTIVE: "active", // Member has accepted invitation or was added directly (if no user account)
  DECLINED: "declined", // Registered user has declined the invitation
} as const;
export type FamilyMemberStatus = typeof FamilyMemberStatus[keyof typeof FamilyMemberStatus];

export interface MemberProfileInfo {
  firstName: string;
  lastName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  relationship: string; // e.g., "Mère", "Père", "Fils", "Fille", "Bébé", "Autre"
  allergies?: string[];
  preferences?: string[];
}

export interface FamilyMember {
  id: string; // Firestore document ID
  familyId: string; // Reference to the Family document ID in the 'families' collection
  userId?: string; // Reference to the global User document ID (if they have an app account)
  profileInfo: MemberProfileInfo; 
  role: FamilyMemberRole;
  status: FamilyMemberStatus; 
  invitedByUserId?: string; // User ID of the family admin/member who initiated the invitation
  invitedEmail?: string; // Email to which invitation was sent
  invitationSentAt?: Timestamp;
  joinedAt?: Timestamp;
  updatedAt?: Timestamp; // For tracking updates to the member's record
}
