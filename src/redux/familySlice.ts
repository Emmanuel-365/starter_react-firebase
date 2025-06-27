import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Family } from '../types/Family';
import { FamilyMember, FamilyMemberRole, FamilyMemberWithFamilyDetails } from '../types/FamilyMember'; // Import FamilyMemberWithFamilyDetails
import * as familyService from '../services/familyService';
import { RootState } from './store';
import { auth } from '../services/firebase'; // To get current user for accept/decline

// Define the shape of the family state
export interface FamilyState {
  families: Family[];
  currentFamily: Family | null;
  currentFamilyMembers: FamilyMember[];
  pendingInvitations: FamilyMemberWithFamilyDetails[]; // Updated type
  isLoading: boolean;
  isLoadingInvitations: boolean; // Specific loading state for invitations
  error: string | null | undefined;
}

const initialState: FamilyState = {
  families: [],
  currentFamily: null,
  currentFamilyMembers: [],
  pendingInvitations: [], // Initialize
  isLoading: false,
  isLoadingInvitations: false, // Initialize
  error: null,
};

// Async Thunks
// Thunk to fetch pending invitations for the current user
export const fetchUserPendingInvitations = createAsyncThunk<
  FamilyMemberWithFamilyDetails[],
  string, // userEmail
  { rejectValue: string }
>(
  'family/fetchUserPendingInvitations',
  async (userEmail, { rejectWithValue }) => {
    try {
      return await familyService.getUserPendingInvitations(userEmail);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch pending invitations');
    }
  }
);

// Thunk to accept an invitation
export const acceptInvitationThunk = createAsyncThunk<
  string, // familyMemberId of the accepted invitation
  { familyMemberId: string; }, // Argument: only familyMemberId, userId and email will be from auth state
  { rejectValue: string; state: RootState }
>(
  'family/acceptInvitation',
  async ({ familyMemberId }, { rejectWithValue, dispatch, getState }) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return rejectWithValue("User not authenticated or email not available.");
    }
    try {
      await familyService.acceptFamilyInvitation(familyMemberId, currentUser.uid, currentUser.email);
      // After accepting, refresh user's families and potentially current family details if relevant
      dispatch(fetchUserFamilies(currentUser.uid));
      // Optionally, if the accepted family is the currentFamily, refresh its members
      const currentFamilyId = getState().family.currentFamily?.id;
      if (currentFamilyId && (getState().family.pendingInvitations.find(inv => inv.id === familyMemberId)?.familyId === currentFamilyId)) {
          dispatch(fetchFamilyMembers(currentFamilyId));
      }
      return familyMemberId; // Return ID to remove from pendingInvitations
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to accept invitation');
    }
  }
);

// Thunk to decline an invitation
export const declineInvitationThunk = createAsyncThunk<
  string, // familyMemberId of the declined invitation
  { familyMemberId: string; }, // Argument
  { rejectValue: string }
>(
  'family/declineInvitation',
  async ({ familyMemberId }, { rejectWithValue }) => {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      return rejectWithValue("User not authenticated or email not available.");
    }
    try {
      await familyService.declineFamilyInvitation(familyMemberId, currentUser.uid, currentUser.email);
      return familyMemberId; // Return ID to remove from pendingInvitations
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to decline invitation');
    }
  }
);


export const fetchUserFamilies = createAsyncThunk<Family[], string, { rejectValue: string }>(
  'family/fetchUserFamilies',
  async (userId, { rejectWithValue }) => {
    try {
      return await familyService.getUserFamilies(userId);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch user families');
    }
  }
);

export const createFamilyAndAdmin = createAsyncThunk<
  { familyId: string; family: Family }, // Return type: includes the new family object
  { name: string; createdById: string; description?: string },
  { rejectValue: string }
>(
  'family/createFamilyAndAdmin',
  async (familyData, { rejectWithValue }) => {
    try {
      const familyId = await familyService.createFamily(familyData.name, familyData.createdById, familyData.description);
      const newFamily = await familyService.getFamilyDetails(familyId);
      if (!newFamily) throw new Error("Failed to retrieve created family details.");
      // The creator is added as admin by default in the service, so no need to fetch members yet for that.
      return { familyId, family: newFamily };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create family');
    }
  }
);

export const fetchFamilyDetails = createAsyncThunk<
  { family: Family | null; members: FamilyMember[] },
  string, // familyId
  { rejectValue: string }
>(
  'family/fetchFamilyDetails',
  async (familyId, { rejectWithValue }) => {
    try {
      const family = await familyService.getFamilyDetails(familyId);
      // Also fetch members when fetching family details for convenience
      const members = family ? await familyService.getFamilyMembers(familyId) : [];
      return { family, members };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch family details');
    }
  }
);

export const fetchFamilyMembers = createAsyncThunk<FamilyMember[], string, { rejectValue: string }>(
    'family/fetchFamilyMembers',
    async (familyId, {rejectWithValue}) => {
        try {
            return await familyService.getFamilyMembers(familyId);
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch family members');
        }
    }
);

export const addNewFamilyMember = createAsyncThunk<
  FamilyMember, // Return the newly added member
  { familyId: string; memberData: Omit<FamilyMember, "id" | "familyId" | "status" | "joinedAt" | "invitationSentAt" | "updatedAt" | "invitedEmail"> & { userId?: string; profileInfo: any; role: FamilyMemberRole; invitedEmail?: string }; invitedByUserId: string },
  { rejectValue: string }
>(
  'family/addNewFamilyMember',
  async ({ familyId, memberData, invitedByUserId }, { rejectWithValue }) => {
    try {
      const newMemberId = await familyService.addFamilyMember(familyId, memberData, invitedByUserId);
      // Fetch the full member data after creation as service might only return ID
      // This part needs the service to be able to fetch a member by its ID, or adjust addFamilyMember to return the full object.
      // For now, let's assume we might need to refetch or the service provides enough.
      // Let's modify addFamilyMember in service to return the new member object if possible, or fetch here.
      // Simulating fetching the member - ideally, service returns it or provides a getMemberById
      const members = await familyService.getFamilyMembers(familyId);
      const newMember = members.find(m => m.id === newMemberId);
      if (!newMember) throw new Error("Failed to retrieve the newly added member.");
      return newMember;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to add family member');
    }
  }
);

export const updateMemberRole = createAsyncThunk<
  { memberId: string; role: FamilyMemberRole },
  { memberId: string; role: FamilyMemberRole },
  { rejectValue: string }
>(
  'family/updateMemberRole',
  async ({ memberId, role }, { rejectWithValue }) => {
    try {
      await familyService.updateFamilyMemberRole(memberId, role);
      return { memberId, role };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update member role');
    }
  }
);

export const removeMember = createAsyncThunk<
  string, // memberId of removed member
  string, // memberId to remove
  { rejectValue: string }
>(
  'family/removeMember',
  async (memberId, { rejectWithValue }) => {
    try {
      await familyService.removeFamilyMember(memberId);
      return memberId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to remove member');
    }
  }
);

export const updateFamilyDetails = createAsyncThunk<
  Family, // Return updated family
  { familyId: string; data: Partial<Pick<Family, "name" | "description">> },
  { rejectValue: string }
>(
  'family/updateFamilyDetails',
  async ({ familyId, data }, { rejectWithValue }) => {
    try {
      await familyService.updateFamily(familyId, data);
      const updatedFamily = await familyService.getFamilyDetails(familyId);
      if (!updatedFamily) throw new Error("Failed to retrieve updated family details.");
      return updatedFamily;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update family details');
    }
  }
);

export const deleteFamilyAndMembers = createAsyncThunk<
  string, // familyId of deleted family
  string, // familyId to delete
  { rejectValue: string }
>(
  'family/deleteFamilyAndMembers',
  async (familyId, { rejectWithValue }) => {
    try {
      await familyService.deleteFamily(familyId);
      return familyId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete family');
    }
  }
);

// Slice
const familySlice = createSlice({
  name: 'family',
  initialState,
  reducers: {
    clearFamilyError: (state) => {
      state.error = null;
    },
    setCurrentFamily: (state, action: PayloadAction<Family | null>) => {
        state.currentFamily = action.payload;
        if(!action.payload) state.currentFamilyMembers = []; // Clear members if family is cleared
    },
    resetFamilyState: () => initialState, // For logout or cleanup
  },
  extraReducers: (builder) => {
    builder
      // fetchUserFamilies
      .addCase(fetchUserFamilies.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchUserFamilies.fulfilled, (state, action) => {
        state.isLoading = false; state.families = action.payload;
      })
      .addCase(fetchUserFamilies.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // createFamilyAndAdmin
      .addCase(createFamilyAndAdmin.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(createFamilyAndAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.families.push(action.payload.family);
        state.currentFamily = action.payload.family; // Optionally set as current
        // Members list for the new family will be empty or contain just the admin initially
        // Depending on service, might need a separate fetch or ensure service returns members
        state.currentFamilyMembers = []; // Reset, to be fetched if navigated
      })
      .addCase(createFamilyAndAdmin.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // fetchFamilyDetails
      .addCase(fetchFamilyDetails.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchFamilyDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamily = action.payload.family;
        state.currentFamilyMembers = action.payload.members;
      })
      .addCase(fetchFamilyDetails.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
        state.currentFamily = null; state.currentFamilyMembers = [];
      })
       // fetchFamilyMembers
      .addCase(fetchFamilyMembers.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(fetchFamilyMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamilyMembers = action.payload;
      })
      .addCase(fetchFamilyMembers.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // addNewFamilyMember
      .addCase(addNewFamilyMember.pending, (state) => {
        state.isLoading = true; state.error = null; // Or a specific loading state for member addition
      })
      .addCase(addNewFamilyMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamilyMembers.push(action.payload);
      })
      .addCase(addNewFamilyMember.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // updateMemberRole
      .addCase(updateMemberRole.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(updateMemberRole.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.currentFamilyMembers.findIndex(m => m.id === action.payload.memberId);
        if (index !== -1) {
          state.currentFamilyMembers[index].role = action.payload.role;
        }
      })
      .addCase(updateMemberRole.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // removeMember
      .addCase(removeMember.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamilyMembers = state.currentFamilyMembers.filter(m => m.id !== action.payload);
      })
      .addCase(removeMember.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // updateFamilyDetails
      .addCase(updateFamilyDetails.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(updateFamilyDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFamily = action.payload;
        const index = state.families.findIndex(f => f.id === action.payload.id);
        if (index !== -1) {
          state.families[index] = action.payload;
        }
      })
      .addCase(updateFamilyDetails.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      })
      // deleteFamilyAndMembers
      .addCase(deleteFamilyAndMembers.pending, (state) => {
        state.isLoading = true; state.error = null;
      })
      .addCase(deleteFamilyAndMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.families = state.families.filter(f => f.id !== action.payload);
        if (state.currentFamily?.id === action.payload) {
          state.currentFamily = null;
          state.currentFamilyMembers = [];
        }
      })
      .addCase(deleteFamilyAndMembers.rejected, (state, action) => {
        state.isLoading = false; state.error = action.rejectWithValue ? action.payload : 'Unknown error';
      });
  },
});

// Actions
export const { clearFamilyError, setCurrentFamily, resetFamilyState } = familySlice.actions;

// Selectors
export const selectUserFamilies = (state: RootState) => state.family.families;
export const selectCurrentFamily = (state: RootState) => state.family.currentFamily;
export const selectCurrentFamilyMembers = (state: RootState) => state.family.currentFamilyMembers;
export const selectFamilyById = (familyId: string) => (state: RootState) =>
  state.family.families.find(f => f.id === familyId);
export const selectFamilyLoading = (state: RootState) => state.family.isLoading;
export const selectFamilyError = (state: RootState) => state.family.error;

export default familySlice.reducer;
