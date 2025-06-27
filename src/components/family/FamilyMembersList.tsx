import React from 'react';
import { List, Typography, Box, Paper } from '@mui/material';
import { FamilyMember, FamilyMemberRole } from '../../types/FamilyMember';
import FamilyMemberListItem from './FamilyMemberListItem'; // Will create this next

interface FamilyMembersListProps {
  members: FamilyMember[];
  currentUserId: string;
  currentUserRole: FamilyMemberRole | null;
  familyId: string; // Needed for actions like removing a member
  onMemberUpdate: () => void; // Callback to refresh list after an update (e.g., role change, removal)
}

const FamilyMembersList: React.FC<FamilyMembersListProps> = ({
  members,
  currentUserId,
  currentUserRole,
  familyId,
  onMemberUpdate
}) => {
  if (members.length === 0) {
    return (
      <Typography variant="subtitle1" sx={{ mt: 2, p:2, textAlign: 'center' }}>
        Aucun membre dans cette famille pour le moment.
      </Typography>
    );
  }

  const sortedMembers = [...members].sort((a, b) => {
    // Optional: Sort by role (admin first) then by name or join date
    if (a.role === FamilyMemberRole.ADMIN && b.role !== FamilyMemberRole.ADMIN) return -1;
    if (a.role !== FamilyMemberRole.ADMIN && b.role === FamilyMemberRole.ADMIN) return 1;
    return (a.profileInfo.firstName || '').localeCompare(b.profileInfo.firstName || '');
  });

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ p: 2, pt:0 }}>Membres de la Famille</Typography>
      <List disablePadding>
        {sortedMembers.map((member, index) => (
          <FamilyMemberListItem
            key={member.id}
            member={member}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
            familyId={familyId}
            onMemberUpdate={onMemberUpdate}
            divider={index < sortedMembers.length - 1}
          />
        ))}
      </List>
    </Box>
  );
};

export default FamilyMembersList;
