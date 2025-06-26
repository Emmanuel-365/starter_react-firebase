import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Container,
  Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { AppDispatch, RootState } from '../redux/store';
import {
  setTo,
  setSubject,
  setBody,
  selectMailTo,
  selectMailSubject,
  selectMailBody,
  clearMailForm,
  // Add selectors for loading/error states from mailSlice if you implement them for sending
} from '../redux/mailSlice';
import { sendEmail } from '../services/emailjsService';
import { saveEmailToHistory } from '../services/firebase'; // Import the new service function

// Interface for form data, can be extended
interface EmailFormData {
  to: string;
  subject: string;
  body: string;
}

const EmailForm: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const to = useSelector(selectMailTo);
  const subject = useSelector(selectMailSubject);
  const body = useSelector(selectMailBody);

  // Local state for submission status
  const [isSending, setIsSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    if (name === 'to') {
      dispatch(setTo(value));
    } else if (name === 'subject') {
      dispatch(setSubject(value));
    } else if (name === 'body') {
      dispatch(setBody(value));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);
    setError(null);
    setSuccessMessage(null);

    const emailData: EmailFormData = { to, subject, body };

    try {
      // Assuming the user's email for reply_to, or a default
      // The `to_name` and `from_name` can be customized further or passed from user profile
      await sendEmail({
        to_email: emailData.to,
        subject: emailData.subject,
        message: emailData.body,
        reply_to: 'user_actual_email@example.com', // Placeholder: This should be dynamic if user is logged in
        // from_name: "Your App Name" // Can be set in emailjsService or here
        // to_name: emailData.to // Can be set in emailjsService or here
      });
      setSuccessMessage('Email sent successfully! It will also be saved to your history.');
      
      // Save to Firestore history
      try {
        // Placeholder for userId - replace with actual user ID from auth state
        const userId = "dummyUserId123"; // auth.currentUser?.uid || "anonymous"; 
        await saveEmailToHistory({
          userId,
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
        });
        console.log("Email successfully saved to history.");
        // No separate success message for history save to keep UI cleaner, main success is for sending.
      } catch (historyError: any) {
        console.error("Failed to save email to history:", historyError);
        // Optionally, set a secondary error state or log this more visibly
        // For now, the main error state `setError` is for the primary action (sending email)
        // We could add a specific error message like:
        // setError(`Email sent, but failed to save to history: ${historyError.message}`);
        // However, this might overwrite a more critical send error if that also occurred.
        // A more robust solution might involve a notification system for multiple messages.
      }

      dispatch(clearMailForm()); // Clear form fields in Redux state after all operations
    } catch (err: any) {
      console.error('Failed to send email:', err);
      setError(err.message || 'Failed to send email. Please try again.');
      // If sending fails, we generally wouldn't try to save to history.
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Compose Email
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="To"
              variant="outlined"
              fullWidth
              name="to"
              value={to}
              onChange={handleInputChange}
              required
              disabled={isSending}
            />
            <TextField
              label="Subject"
              variant="outlined"
              fullWidth
              name="subject"
              value={subject}
              onChange={handleInputChange}
              required
              disabled={isSending}
            />
            <TextField
              label="Body"
              variant="outlined"
              fullWidth
              multiline
              rows={10}
              name="body"
              value={body}
              onChange={handleInputChange}
              required
              disabled={isSending}
            />
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {successMessage && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {successMessage}
              </Alert>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSending}
                startIcon={isSending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              >
                {isSending ? 'Sending...' : 'Send Email'}
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default EmailForm;
console.log('EmailForm component created.');
