import React from 'react';
import { Box, Container, Grid, Paper, Typography, Alert } from '@mui/material';
import { useGame } from '../context/GameContext';
import BettingPanel from './BettingPanel';
import Dice from './Dice';
import PlayerList from './PlayerList';
import GameControls from './GameControls';
import GameResults from './GameResults';

const Game: React.FC = () => {
  const { gameState, diceResults, error } = useGame();
  
  const isRolling = gameState === 'rolling';
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left Column - Game Controls & Player List */}
        <Grid item xs={12} md={4}>
          <GameControls />
          <PlayerList />
        </Grid>
        
        {/* Middle Column - Dice & Results */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 3, 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 300,
              justifyContent: 'center',
            }}
          >
            <Typography variant="h6" gutterBottom align="center">
              Dice
            </Typography>
            
            <Dice diceResults={diceResults} rolling={isRolling} />
            
            {isRolling && (
              <Typography variant="body1" align="center" sx={{ mt: 2 }}>
                Rolling dice...
              </Typography>
            )}
            
            {diceResults.length === 0 && !isRolling && (
              <Typography variant="body2" color="text.secondary" align="center">
                Place your bets and roll the dice to start the game.
              </Typography>
            )}
          </Paper>
          
          <GameResults />
        </Grid>
        
        {/* Right Column - Betting Panel */}
        <Grid item xs={12} md={4}>
          <BettingPanel />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Game; 