import React from 'react';
import { Paper, Typography, Box, Grid, Divider } from '@mui/material';
import { SymbolType, useGame } from '../context/GameContext';
import DiceSymbol from './DiceSymbol';

interface SymbolCountProps {
  symbol: SymbolType;
  count: number;
}

const SymbolCount: React.FC<SymbolCountProps> = ({ symbol, count }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
      <DiceSymbol symbol={symbol} size={30} />
      <Typography variant="body2" sx={{ ml: 1 }}>
        × {count}
      </Typography>
    </Box>
  );
};

const GameResults: React.FC = () => {
  const { diceResults, payouts, playerId } = useGame();
  
  // Count occurrences of each symbol
  const symbolCounts: Record<SymbolType, number> = {} as Record<SymbolType, number>;
  diceResults.forEach((symbol) => {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });

  // Calculate player's winnings if available
  let totalWinnings = 0;
  if (payouts && playerId && payouts[playerId]) {
    Object.values(payouts[playerId]).forEach((amount) => {
      totalWinnings += amount;
    });
  }

  const hasResults = diceResults.length > 0;

  if (!hasResults) {
    return null;
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Roll Results
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Symbol Counts:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
          {Object.entries(symbolCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([symbol, count]) => (
              <SymbolCount 
                key={symbol} 
                symbol={symbol as SymbolType} 
                count={count} 
              />
            ))}
        </Box>
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      {playerId && payouts && payouts[playerId] && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Your Results:
          </Typography>
          <Grid container spacing={1}>
            {Object.entries(payouts[playerId]).map(([symbol, amount]) => (
              amount !== 0 && (
                <Grid item key={symbol} xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DiceSymbol symbol={symbol as SymbolType} size={24} />
                    <Typography
                      variant="body2"
                      sx={{
                        ml: 1,
                        color: amount > 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {amount > 0 ? `+$${amount}` : `-$${Math.abs(amount)}`}
                    </Typography>
                  </Box>
                </Grid>
              )
            ))}
          </Grid>
          
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: totalWinnings > 0 ? 'success.main' : totalWinnings < 0 ? 'error.main' : 'text.primary',
              }}
            >
              {totalWinnings > 0
                ? `You won $${totalWinnings}!`
                : totalWinnings < 0
                ? `You lost $${Math.abs(totalWinnings)}`
                : 'No change in balance'}
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default GameResults; 