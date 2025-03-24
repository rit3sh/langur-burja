import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Chip,
  InputAdornment,
} from '@mui/material';
import { AttachMoney as MoneyIcon } from '@mui/icons-material';
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
        Place Your Bets
      </Typography>
      
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: 3, 
          p: 2,
          borderRadius: 2,
          background: 'rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'medium', color: 'text.secondary' }}>
          Your Balance
        </Typography>
        <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
          ${playerBalance}
        </Typography>
      </Box>

      <Box sx={{ my: 3 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            mb: 2, 
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            '&::before': {
              content: '""',
              width: 4,
              height: 16,
              backgroundColor: 'primary.main',
              display: 'inline-block',
              marginRight: 1,
              borderRadius: 1
            }
          }}
        >
          Select Symbol
        </Typography>
        <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
          {SYMBOLS.map((symbol) => (
            <Grid item key={symbol}>
              <Box 
                sx={{ 
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1,
                  backgroundColor: selectedSymbol === symbol ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  border: playerBets[symbol] && playerBets[symbol] > 0 
                    ? '1px dashed rgba(255, 215, 0, 0.5)' 
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)'
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <DiceSymbol
                    symbol={symbol}
                    size={45}
                    active={selectedSymbol === symbol}
                    onClick={() => handleSymbolSelect(symbol)}
                    showLabel={true}
                  />
                  {playerBets[symbol] && playerBets[symbol] > 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        fontSize: '0.7rem',
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        color: '#4CAF50',
                        border: '1px solid rgba(76, 175, 80, 0.5)',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        px: 1,
                        py: 0.25,
                        minWidth: '24px',
                        textAlign: 'center'
                      }}
                    >
                      ${playerBets[symbol]}
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box 
        sx={{ 
          mt: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'flex-end' }, 
          gap: 2,
        }}
      >
        <TextField
          label="Bet Amount"
          variant="outlined"
          size="small"
          value={betAmount}
          onChange={handleBetAmountChange}
          disabled={isBettingDisabled}
          sx={{ 
            width: { xs: '100%', sm: '150px' },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
              },
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MoneyIcon sx={{ color: '#4CAF50' }} fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handlePlaceBet}
          disabled={!selectedSymbol || !betAmount || isBettingDisabled}
          sx={{
            py: 1.2,
            width: { xs: '100%', sm: 'auto' },
            minWidth: { sm: '120px' }
          }}
          className="game-btn"
        >
          Place Bet
        </Button>
      </Box>
    </>
  );
};

export default BettingPanel; 