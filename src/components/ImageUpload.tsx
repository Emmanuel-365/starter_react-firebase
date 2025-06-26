import React, { useState, type ChangeEvent } from 'react';
import { Button, TextField, CircularProgress, Typography, Box, Paper, Alert } from '@mui/material';
import { uploadImageToCloudinary } from '../services/cloudinaryService'; // Adjust the import path as necessary

const ImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setUploadedImageUrl(null); // Reset previous image URL
      setError(null); // Reset previous error
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Veuillez d'abord sélectionner un fichier.");
      return;
    }

    setUploading(true);
    setError(null);
    setUploadedImageUrl(null);

    try {
      const imageUrl = await uploadImageToCloudinary(selectedFile);
      setUploadedImageUrl(imageUrl);
      setSelectedFile(null); // Clear selection after successful upload
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Une erreur inconnue est survenue lors du téléchargement.";
      setError(errorMessage);
      console.error("Upload error in component:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Télécharger une Image
      </Typography>
      <Box sx={{ mb: 2 }}>
        <TextField
          type="file"
          onChange={handleFileChange}
          inputProps={{ accept: "image/*" }}
          fullWidth
          variant="outlined"
          size="small"
          helperText={selectedFile ? selectedFile.name : "Aucun fichier sélectionné"}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {uploading ? "Téléchargement..." : "Télécharger"}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {uploadedImageUrl && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Image Téléchargée:
          </Typography>
          <img src={uploadedImageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '300px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }} />
          <Typography variant="caption" display="block" sx={{ mt: 1, wordBreak: 'break-all' }}>
            URL: <a href={uploadedImageUrl} target="_blank" rel="noopener noreferrer">{uploadedImageUrl}</a>
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default ImageUpload;
