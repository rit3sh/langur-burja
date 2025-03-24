import React from 'react';
import { Box, Button, Paper, Typography, CircularProgress } from '@mui/material';
import { useGame } from '../context/GameContext';

const GameControls: React.FC = () => {
  const { gameState, rollDice, leaveRoom, roomId } = useGame();

  const isRolling = gameState === 'rolling';
  const isBetting = gameState === 'betting';
  const isResults = gameState === 'results';

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Game Controls
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Game state display */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            Room ID: {roomId}
          </Typography>
          <Typography variant="body2">
            Status:{' '}
            <Typography
              component="span"
              sx={{
                fontWeight: 'bold',
                color: isRolling 
                  ? 'warning.main' 
                  : isBetting 
                    ? 'info.main' 
                    : 'success.main',
              }}
            >
              {isRolling 
                ? 'ROLLING DICE' 
                : isBetting 
                  ? 'PLACE YOUR BETS' 
                  : 'SHOWING RESULTS'}
            </Typography>
          </Typography>
        </Box>
        
        {/* Action buttons */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={rollDice}
            disabled={!isBetting}
            startIcon={isRolling && <CircularProgress size={20} color="inherit" />}
            sx={{ flexGrow: 1 }}
          >
            {isRolling ? 'Rolling...' : 'Roll Dice'}
          </Button>
          
          <Button
            variant="outlined"
            color="error"
            onClick={leaveRoom}
            sx={{ flexGrow: 0 }}
          >
            Leave Game
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default GameControls; 