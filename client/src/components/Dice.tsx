import React from 'react';
import { Box, Paper } from '@mui/material';
import { SymbolType, SYMBOLS } from '../context/GameContext';
import DiceSymbol from './DiceSymbol';

// Custom cylindrical dice styles for Langur Burja
const TraditionalDie: React.FC<{ 
  symbol: SymbolType; 
  rolling?: boolean;
  animationDelay?: number;
}> = ({ symbol, rolling = false, animationDelay = 0 }) => {
  return (
    <Box
      sx={{
        width: 70,
        height: 70,
        position: 'relative',
        perspective: '800px',
        transformStyle: 'preserve-3d',
        animation: rolling 
          ? `dice-tumble 2s ${animationDelay}s infinite cubic-bezier(0.4, 0.0, 0.2, 1)` 
          : 'none',
        '@keyframes dice-tumble': {
          '0%': {
            transform: 'rotateX(0deg) rotateY(0deg) rotateZ(0deg) translateZ(0px)',
          },
          '25%': {
            transform: 'rotateX(90deg) rotateY(45deg) rotateZ(90deg) translateZ(10px)',
          },
          '50%': {
            transform: 'rotateX(180deg) rotateY(90deg) rotateZ(180deg) translateZ(20px)',
          },
          '75%': {
            transform: 'rotateX(270deg) rotateY(45deg) rotateZ(270deg) translateZ(10px)',
          },
          '100%': {
            transform: 'rotateX(360deg) rotateY(0deg) rotateZ(360deg) translateZ(0px)',
          },
        },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 3,
          backgroundColor: 'white',
          position: 'relative',
          boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
          transform: 'perspective(500px) rotateX(10deg)',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          '&:hover': {
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
    </Box>
  );
};

// Traditional wooden dice tumbling animation
const RollingDice: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2.5, justifyContent: 'center' }}>
      {Array(6).fill(null).map((_, index) => {
        // Use a different symbol for each die to make it look more realistic
        const randomSymbol = SYMBOLS[index % SYMBOLS.length];
        return (
          <TraditionalDie 
            key={index} 
            symbol={randomSymbol} 
            rolling={true} 
            animationDelay={index * 0.15} 
          />
        );
      })}
    </Box>
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        my: 3,
        perspective: '1000px',
        maxWidth: '360px',
        mx: 'auto'
      }}
    >
      {rolling ? (
        // Show animated rolling dice
        <RollingDice />
      ) : (
        // Show actual dice results
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2.5,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {diceResults.map((symbol, index) => (
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
              <TraditionalDie symbol={symbol} />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Dice; 