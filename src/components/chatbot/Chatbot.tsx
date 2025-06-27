import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography, Avatar, List, ListItem, ListItemAvatar, ListItemText, IconButton, CircularProgress } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { generateChatResponse } from '../../services/geminiService'; // Importer la fonction
import type { User } from 'firebase/auth'; // Ajout

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatbotProps {
  user?: User | null;
}

const Chatbot: React.FC<ChatbotProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Construire l'historique pour l'API Gemini
      const history = messages.map(msg => ({
        role: msg.sender === 'user' ? "user" as const : "model" as const,
        parts: [{ text: msg.text }],
      }));

      const botResponseText = await generateChatResponse(userMessage.text, history);
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        text: botResponseText,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error("Erreur lors de la génération de la réponse du bot:", error);
      const errorMessage: Message = {
        id: `bot-error-${Date.now()}`,
        text: "Désolé, une erreur s'est produite. Veuillez réessayer.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [isOpen, setIsOpen] = useState(true); // Pour contrôler la visibilité du chatbot

  if (!isOpen) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1300,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsOpen(true)}
          startIcon={<SmartToyIcon />}
          sx={{ borderRadius: '50%', width: 64, height: 64, boxShadow: 6 }}
        >
        </Button>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.9 }}
      transition={{ duration: 0.4, ease: "circOut" }}
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1300,
      }}
    >
      <Paper 
        elevation={8} 
        sx={{ 
          width: '100%', 
          maxWidth: 400, // Ajusté pour une meilleure esthétique
          height: '75vh', 
          maxHeight: 550, // Ajusté
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '20px', // Plus arrondi
          overflow: 'hidden',
          boxShadow: '0 12px 40px -12px rgba(0,0,0,0.35)',
          // backdropFilter: 'blur(8px)', // Optionnel, peut impacter les perfs
          // border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <Box 
          sx={{ 
            p: 1.5, 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', // Gradient pour l'en-tête
            color: 'white',
            borderTopLeftRadius: '20px', // Synchronisé avec Paper
            borderTopRightRadius: '20px', // Synchronisé avec Paper
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 'medium' }}>Assistant Culinaire</Typography>
          <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <List sx={{ flexGrow: 1, overflowY: 'auto', p: 2, backgroundColor: 'rgba(240, 242, 245, 0.8)' }}>
          <AnimatePresence>
            {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ListItem 
                sx={{ 
                  display: 'flex', 
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                  alignItems: 'flex-end', // Aligner les bulles et avatars en bas
                  mb: 1.5, // Augmenter l'espacement
                }}
              >
                <ListItemAvatar sx={{ 
                  minWidth: 'auto', 
                  ml: msg.sender === 'user' ? 1 : 0, 
                  mr: msg.sender === 'bot' ? 1 : 0,
                }}>
                  <Avatar sx={{ 
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'secondary.main', 
                    width: 36, 
                    height: 36 
                  }}>
                    {msg.sender === 'user' ? <AccountCircleIcon /> : <SmartToyIcon />}
                  </Avatar>
                </ListItemAvatar>
                <Paper 
                  elevation={1} 
                  sx={{ 
                    p: '10px 14px', // Ajuster le padding
                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px', 
                    bgcolor: msg.sender === 'user' ? 'primary.main' : 'white',
                    color: msg.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                    maxWidth: '80%', // Limiter la largeur des bulles
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  }}
                >
                  <Typography component="div" variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ 
                    mt: 0.5, 
                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                    color: msg.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary' 
                  }}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </Paper>
              </ListItem>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </AnimatePresence>
      </List>

      <Box 
        component="form" 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} 
        sx={{ 
          p: '12px 16px', // Ajuster le padding
          borderTop: '1px solid', 
          borderColor: 'divider', 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fond légèrement transparent
          display: 'flex',
          alignItems: 'center',
          borderBottomLeftRadius: '20px', // Synchronisé avec Paper
          borderBottomRightRadius: '20px', // Synchronisé avec Paper
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          size="small" // Rendre le champ plus petit
          placeholder="Posez votre question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          sx={{ 
            mr: 1, 
            '& .MuiOutlinedInput-root': { 
              borderRadius: '20px',
              backgroundColor: 'white', // Fond blanc pour le champ
            },
            flexGrow: 1,
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <IconButton type="submit" color="primary" disabled={isLoading || input.trim() === ''}>
          {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Paper>
   </motion.div>
  );
};

export default Chatbot;
