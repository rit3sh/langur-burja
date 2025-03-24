import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
} from '@mui/material';
import { useGame } from '../context/GameContext';

const PlayerList: React.FC = () => {
  const { players, playerId } = useGame();
  
  const playerEntries = Object.entries(players);

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Players ({playerEntries.length})
      </Typography>
      
      {playerEntries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No players in the game yet.
        </Typography>
      ) : (
        <List dense sx={{ width: '100%' }}>
          {playerEntries.map(([id, player], index) => (
            <React.Fragment key={id}>
              <ListItem 
                sx={{ 
                  py: 1,
                  backgroundColor: id === playerId ? 'rgba(123, 31, 162, 0.1)' : 'transparent',
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" component="span">
                        {player.name}
                      </Typography>
                      {id === playerId && (
                        <Chip
                          label="You"
                          size="small"
                          color="primary"
                          sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  }
                  secondary={`Balance: $${player.balance}`}
                />
              </ListItem>
              {index < playerEntries.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default PlayerList; 