import React from 'react';
import {
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
    <>
      <Typography 
        variant="h5" 
        gutterBottom
        sx={{ 
          color: 'primary.main',
          fontWeight: 600,
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          mb: 3,
          position: 'relative',
          display: 'inline-block',
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            bottom: -8,
            width: '60%',
            height: 3,
            background: 'linear-gradient(90deg, #FFD700, transparent)',
            borderRadius: 3,
          }
        }}
      >
        Players ({playerEntries.length})
      </Typography>
      
      {playerEntries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No players in the game yet.
        </Typography>
      ) : (
        <List 
          sx={{ 
            width: '100%',
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.05)',
            overflow: 'hidden'
          }}
        >
          {playerEntries.map(([id, player], index) => (
            <React.Fragment key={id}>
              <ListItem 
                sx={{ 
                  py: 1.5,
                  px: 2,
                  backgroundColor: id === playerId ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
                  borderLeft: id === playerId ? '3px solid #FFD700' : 'none',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography 
                        variant="body1" 
                        component="span"
                        sx={{ 
                          fontWeight: id === playerId ? 600 : 500,
                          color: id === playerId ? '#FFD700' : '#ffffff'
                        }}
                      >
                        {player.name}
                      </Typography>
                      {id === playerId && (
                        <Chip
                          label="You"
                          size="small"
                          sx={{ 
                            ml: 1, 
                            height: 20, 
                            fontSize: '0.7rem',
                            backgroundColor: 'rgba(255, 215, 0, 0.15)',
                            color: '#FFD700',
                            border: '1px solid rgba(255, 215, 0, 0.3)',
                            fontWeight: 'bold'
                          }}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Balance: <span style={{ color: '#4CAF50', marginLeft: '4px', fontWeight: 500 }}>${player.balance}</span>
                    </Typography>
                  }
                />
              </ListItem>
              {index < playerEntries.length - 1 && <Divider sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }} />}
            </React.Fragment>
          ))}
        </List>
      )}
    </>
  );
};

export default PlayerList; 