import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
// TODO: Import Firestore and implement logic to fetch and display email history

// Placeholder data
const placeholderHistory = [
  { id: '1', to: 'test1@example.com', subject: 'Hello World', timestamp: new Date().toLocaleString() },
  { id: '2', to: 'test2@example.com', subject: 'Meeting Reminder', timestamp: new Date().toLocaleString() },
  { id: '3', to: 'test3@example.com', subject: 'Project Update', timestamp: new Date().toLocaleString() },
];

const HistoryPage: React.FC = () => {
  // TODO: Fetch actual history from Firestore
  const emailHistory = placeholderHistory;

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Email History
        </Typography>
        {emailHistory.length === 0 ? (
          <Typography variant="body1">No emails sent yet.</Typography>
        ) : (
          <List>
            {emailHistory.map((email, index) => (
              <React.Fragment key={email.id}>
                <ListItem alignItems="flex-start">
                  <ListItemText
                    primary={email.subject}
                    secondary={
                      <>
                        <Typography
                          sx={{ display: 'inline' }}
                          component="span"
                          variant="body2"
                          color="text.primary"
                        >
                          To: {email.to}
                        </Typography>
                        {` — Sent: ${email.timestamp}`}
                      </>
                    }
                  />
                  {/* TODO: Add option to view full email or resend? */}
                </ListItem>
                {index < emailHistory.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default HistoryPage;
