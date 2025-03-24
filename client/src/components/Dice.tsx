import React from 'react';
import { Box, Paper } from '@mui/material';
import { SymbolType } from '../context/GameContext';
import DiceSymbol from './DiceSymbol';

interface DieProps {
  symbol: SymbolType;
  rolling?: boolean;
}

const Die: React.FC<DieProps> = ({ symbol, rolling = false }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: 60,
        height: 60,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        backgroundColor: 'white',
        animation: rolling ? 'rotate 0.5s infinite' : 'none',
        '@keyframes rotate': {
          '0%': {
            transform: 'rotate(0deg)',
          },
          '100%': {
            transform: 'rotate(360deg)',
          },
        },
      }}
    >
      <DiceSymbol symbol={symbol} size={40} />
    </Paper>
  );
};

interface DiceProps {
  diceResults: SymbolType[];
  rolling?: boolean;
}

const Dice: React.FC<DiceProps> = ({ diceResults, rolling = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
        my: 4,
      }}
    >
      {rolling ? (
        // Show placeholder dice when rolling
        Array(6)
          .fill(null)
          .map((_, index) => (
            <Die key={index} symbol="Spade" rolling={true} />
          ))
      ) : (
        // Show actual dice results
        diceResults.map((symbol, index) => (
          <Die key={index} symbol={symbol} />
        ))
      )}
    </Box>
  );
};

export default Dice; 