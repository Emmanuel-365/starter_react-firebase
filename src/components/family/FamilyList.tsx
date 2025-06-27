import React from 'react';
import { List, Paper, Typography, Box } from '@mui/material';
import FamilyListItem from './FamilyListItem';
import { Family } from '../../types/Family';

interface FamilyListProps {
  families: Family[];
}

const FamilyList: React.FC<FamilyListProps> = ({ families }) => {
  if (families.length === 0) {
    return (
      <Typography variant="subtitle1" sx={{ mt: 2, textAlign: 'center' }}>
        Aucune famille à afficher pour le moment.
      </Typography>
    );
  }

  return (
    <Paper elevation={2} sx={{ mt: 2 }}>
      <Box sx={{ p: 2, backgroundColor: 'primary.main', color: 'primary.contrastText', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit' }}>
        <Typography variant="h6">Vos Familles</Typography>
      </Box>
      <List disablePadding>
        {families.map((family, index) => (
          <FamilyListItem 
            key={family.id} 
            family={family} 
            divider={index < families.length - 1}
          />
        ))}
      </List>
    </Paper>
  );
};

export default FamilyList;
