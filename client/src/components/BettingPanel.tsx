import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
} from '@mui/material';
import { SYMBOLS, SymbolType, useGame } from '../context/GameContext';
import DiceSymbol from './DiceSymbol';

const BettingPanel: React.FC = () => {
  const { placeBet, gameState, players, playerId, bets } = useGame();
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolType | null>(null);
  const [betAmount, setBetAmount] = useState<string>('10');

  // Get current player's balance
  const playerBalance = playerId && players[playerId] ? players[playerId].balance : 0;
  
  // Get current player's bets
  const playerBets = playerId && bets[playerId] ? bets[playerId] : {};

  const handleSymbolSelect = (symbol: SymbolType) => {
    setSelectedSymbol(symbol);
  };

  const handleBetAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow positive numbers
    const value = event.target.value;
    if (/^\d*$/.test(value)) {
      setBetAmount(value);
    }
  };

  const handlePlaceBet = () => {
    if (!selectedSymbol || !betAmount) return;
    
    const amount = parseInt(betAmount, 10);
    if (isNaN(amount) || amount <= 0 || amount > playerBalance) return;
    
    placeBet(selectedSymbol, amount);
    setBetAmount('10'); // Reset to default
  };

  const isBettingDisabled = gameState !== 'betting';

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Place Your Bets
      </Typography>
      
      <Typography variant="body2" gutterBottom>
        Your Balance: ${playerBalance}
      </Typography>

      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Select Symbol:
        </Typography>
        <Grid container spacing={1}>
          {SYMBOLS.map((symbol) => (
            <Grid item key={symbol}>
              <Box 
                sx={{ 
                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                <DiceSymbol
                  symbol={symbol}
                  size={50}
                  active={selectedSymbol === symbol}
                  onClick={() => handleSymbolSelect(symbol)}
                />
                {playerBets[symbol] && playerBets[symbol] > 0 && (
                  <Chip
                    label={`$${playerBets[symbol]}`}
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: -10,
                      right: -10,
                      fontSize: '0.7rem',
                    }}
                  />
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 3, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
        <TextField
          label="Bet Amount"
          variant="outlined"
          size="small"
          value={betAmount}
          onChange={handleBetAmountChange}
          disabled={isBettingDisabled}
          sx={{ width: '120px' }}
          InputProps={{
            startAdornment: <Typography sx={{ mr: 0.5 }}>$</Typography>,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handlePlaceBet}
          disabled={!selectedSymbol || !betAmount || isBettingDisabled}
        >
          Place Bet
        </Button>
      </Box>
    </Paper>
  );
};

export default BettingPanel; 