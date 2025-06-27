import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ListItem, ListItemText, ListItemAvatar, Avatar, Typography, IconButton, Box, Divider } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Family } from '../../types/Family';

interface FamilyListItemProps {
  family: Family;
  divider?: boolean;
}

const FamilyListItem: React.FC<FamilyListItemProps> = ({ family, divider }) => {
  return (
    <>
      <ListItem
        button
        component={RouterLink}
        to={`/families/${family.id}`}
        sx={{
          py: 2,
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <ListItemAvatar>
          <Avatar sx={{ bgcolor: 'secondary.main' }}>
            <GroupIcon />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={<Typography variant="h6">{family.name}</Typography>}
          secondary={
            <Typography variant="body2" color="text.secondary">
              {family.description || "Aucune description"}
            </Typography>
          }
        />
        <Box sx={{ ml: 2 }}>
          <IconButton edge="end" aria-label="view-details">
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </ListItem>
      {divider && <Divider variant="inset" component="li" />}
    </>
  );
};

export default FamilyListItem;
