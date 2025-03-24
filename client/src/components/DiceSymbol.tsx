import React from 'react';
import { Box, Typography } from '@mui/material';
import { SymbolType } from '../context/GameContext';

// Define symbol names in Nepali
const getSymbolName = (symbol: SymbolType): string => {
  switch (symbol) {
    case 'Spade':
      return 'Hukum';
    case 'Heart':
      return 'Paan';
    case 'Diamond':
      return 'Itta';
    case 'Club':
      return 'Chidi';
    case 'Flag':
      return 'Jhanda';
    case 'Crown':
      return 'Burja';
    default:
      return symbol;
  }
};

// Define symbol colors and background colors
const getSymbolStyle = (symbol: SymbolType) => {
  switch (symbol) {
    case 'Heart': // Paan (Red Heart)
      return {
        color: '#ffffff',
        bgColor: '#e53935',
        borderColor: '#c62828',
        symbol: '♥'
      };
    case 'Diamond': // Itta (Red Diamond)
      return {
        color: '#ffffff',
        bgColor: '#ff9800',
        borderColor: '#ef6c00',
        symbol: '♦'
      };
    case 'Club': // Chidi (Green Club)
      return {
        color: '#ffffff',
        bgColor: '#43a047',
        borderColor: '#2e7d32',
        symbol: '♣'
      };
    case 'Spade': // Hukum (Blue Spade)
      return {
        color: '#ffffff',
        bgColor: '#1e88e5',
        borderColor: '#1565c0',
        symbol: '♠'
      };
    case 'Flag': // Jhanda (Purple Flag)
      return {
        color: '#ffffff',
        bgColor: '#8e24aa',
        borderColor: '#6a1b9a',
        symbol: '⚑'
      };
    case 'Crown': // Burja (Gold Crown)
      return {
        color: '#ffffff',
        bgColor: '#ffc107',
        borderColor: '#ffa000',
        symbol: '♚'
      };
    default:
      return {
        color: '#ffffff',
        bgColor: '#666666',
        borderColor: '#444444',
        symbol: '?'
      };
  }
};

interface DiceSymbolProps {
  symbol: SymbolType;
  size?: number;
  active?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
}

const DiceSymbol: React.FC<DiceSymbolProps> = ({
  symbol,
  size = 40,
  active = false,
  onClick,
  showLabel = false,
}) => {
  const symbolStyle = getSymbolStyle(symbol);
  const symbolName = getSymbolName(symbol);
  
  return (
    <Box
      sx={{
        width: size,
        height: showLabel ? 'auto' : size,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        '&:hover': {
          transform: onClick ? 'scale(1.1)' : 'none',
        },
      }}
      onClick={onClick}
    >
      {/* Symbol container */}
      <Box 
        sx={{
          width: size,
          height: size,
          borderRadius: size / 5,
          background: `radial-gradient(circle, ${symbolStyle.bgColor} 0%, ${symbolStyle.borderColor} 100%)`,
          border: `${active ? 3 : 2}px solid ${symbolStyle.borderColor}`,
          boxShadow: active 
            ? `0 0 10px ${symbolStyle.bgColor}, 0 0 20px rgba(0,0,0,0.4)` 
            : '0 4px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: active ? 'pulse 1.5s infinite' : 'none',
          transform: 'perspective(200px) rotateX(10deg)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
            borderTopLeftRadius: size / 5,
            borderTopRightRadius: size / 5,
          },
        }}
      >
        {/* The actual symbol */}
        <Typography
          variant="h4"
          sx={{
            fontSize: size * 0.6,
            fontWeight: 'bold',
            color: symbolStyle.color,
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {symbolStyle.symbol}
        </Typography>
      </Box>
      
      {/* Optional label */}
      {showLabel && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            fontSize: size * 0.25,
            fontWeight: active ? 'bold' : 'medium',
            color: active ? symbolStyle.bgColor : 'text.secondary',
          }}
        >
          {symbolName}
        </Typography>
      )}
      
      {/* Active glow effect */}
      {active && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${symbolStyle.bgColor}40 30%, transparent 70%)`,
            opacity: 0.8,
            animation: 'pulse 1.5s infinite',
            zIndex: -1,
          }}
        />
      )}
    </Box>
  );
};

export default DiceSymbol; 