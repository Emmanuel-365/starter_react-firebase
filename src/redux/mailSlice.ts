import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store'; // Import RootState for selector typing

// Define a type for the slice state
interface MailState {
  to: string;
  subject: string;
  body: string;
  isGenerating: boolean; // To manage loading state during AI generation
  error: string | null;    // To store any error messages
}

// Define the initial state using that type
const initialState: MailState = {
  to: '',
  subject: '',
  body: '',
  isGenerating: false,
  error: null,
};

export const mailSlice = createSlice({
  name: 'mail',
  initialState,
  reducers: {
    setTo: (state, action: PayloadAction<string>) => {
      state.to = action.payload;
    },
    setSubject: (state, action: PayloadAction<string>) => {
      state.subject = action.payload;
    },
    setBody: (state, action: PayloadAction<string>) => {
      state.body = action.payload;
    },
    startAIMailGeneration: (state) => {
      state.isGenerating = true;
      state.error = null;
    },
    aiMailGenerationSuccess: (state, action: PayloadAction<string>) => {
      state.body = action.payload; // Assuming AI generates the body
      state.isGenerating = false;
    },
    aiMailGenerationFailure: (state, action: PayloadAction<string>) => {
      state.isGenerating = false;
      state.error = action.payload;
    },
    clearMailForm: (state) => {
      state.to = '';
      state.subject = '';
      state.body = '';
      state.error = null;
      state.isGenerating = false;
    },
  },
});

// Export actions
export const {
  setTo,
  setSubject,
  setBody,
  startAIMailGeneration,
  aiMailGenerationSuccess,
  aiMailGenerationFailure,
  clearMailForm,
} = mailSlice.actions;

// Selectors
export const selectMailTo = (state: RootState) => state.mail.to;
export const selectMailSubject = (state: RootState) => state.mail.subject;
export const selectMailBody = (state: RootState) => state.mail.body;
export const selectMailIsGenerating = (state: RootState) => state.mail.isGenerating;
export const selectMailError = (state: RootState) => state.mail.error;

// Export the reducer
export default mailSlice.reducer;

console.log('Mail slice created.'); // Optional: for development confirmation
