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
      elevation={6}
      sx={{
        width: 70,
        height: 70,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        backgroundColor: 'white',
        position: 'relative',
        boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
        transform: 'perspective(500px) rotateX(10deg)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: rolling 
          ? 'roll 0.8s infinite cubic-bezier(0.4, 0.0, 0.2, 1)' 
          : 'none',
        '&:hover': {
          transform: 'perspective(500px) rotateX(10deg) scale(1.05)',
          boxShadow: '0 15px 30px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.1) 100%)',
          pointerEvents: 'none',
        },
      }}
    >
      <DiceSymbol symbol={symbol} size={55} active={rolling} />
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
        gap: 2.5,
        justifyContent: 'center',
        alignItems: 'center',
        my: 3,
        perspective: '1000px',
        maxWidth: '360px',
        mx: 'auto'
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
          <Box
            key={index}
            sx={{
              transform: `translateZ(${index * 5}px)`,
              transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              animation: `fadeIn 0.5s ${index * 0.1}s both`,
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'scale(0.8) translateY(20px)' },
                '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
              },
            }}
          >
            <Die key={index} symbol={symbol} />
          </Box>
        ))
      )}
    </Box>
  );
};

export default Dice; 