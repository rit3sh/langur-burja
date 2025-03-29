import React from 'react';
import { Box, Typography } from '@mui/material';
import { SymbolType, NEPALI_SYMBOLS } from '../context/GameContext';

// Map symbols to their image file names
const getSymbolImage = (symbol: SymbolType): string => {
  switch (symbol) {
    case 'Spade':
      return '/images/surot.png';
    case 'Heart':
      return '/images/paan.png';
    case 'Diamond':
      return '/images/itta.png';
    case 'Club':
      return '/images/chidi.png';
    case 'Flag':
      return '/images/jhanda.png';
    case 'Crown':
      return '/images/burja.png';
    default:
      return '';
  }
};

// Define symbol colors and background colors for traditional wooden dice look
const getSymbolStyle = (symbol: SymbolType) => {
  const woodBgBase = 'linear-gradient(135deg, #d7b889 0%, #c4a472 100%)';
  const woodBgDark = 'linear-gradient(135deg, #b69b74 0%, #9e845f 100%)';
  
  switch (symbol) {
    case 'Heart': // Paan (Red Heart)
      return {
        color: '#c62828',
        bgColor: woodBgBase,
        borderColor: '#9e845f',
        symbol: '♥',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
    case 'Diamond': // Itta (Red Diamond)
      return {
        color: '#ef6c00',
        bgColor: woodBgBase,
        borderColor: '#9e845f',
        symbol: '♦',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
    case 'Club': // Chidi (Green Club)
      return {
        color: '#2e7d32',
        bgColor: woodBgBase,
        borderColor: '#9e845f',
        symbol: '♣',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
    case 'Spade': // Hukum (Blue Spade)
      return {
        color: '#1565c0',
        bgColor: woodBgBase,
        borderColor: '#9e845f',
        symbol: '♠',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
    case 'Flag': // Jhanda (Purple Flag)
      return {
        color: '#6a1b9a',
        bgColor: woodBgBase,
        borderColor: '#9e845f',
        symbol: '⚑',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
    case 'Crown': // Burja (Gold Crown)
      return {
        color: '#ff8f00',
        bgColor: woodBgBase,
        borderColor: '#9e845f',
        symbol: '♚',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
    default:
      return {
        color: '#5d4037',
        bgColor: woodBgDark,
        borderColor: '#9e845f',
        symbol: '?',
        textShadow: '0 1px 0 rgba(255,255,255,0.4)'
      };
  }
};

interface DiceSymbolProps {
  symbol: SymbolType;
  size?: number;
  active?: boolean;
  onClick?: () => void;
  showLabel?: boolean;
  traditional?: boolean;
}

const DiceSymbol: React.FC<DiceSymbolProps> = ({
  symbol,
  size = 40,
  active = false,
  onClick,
  showLabel = false,
  traditional = true,
}) => {
  const symbolStyle = getSymbolStyle(symbol);
  const symbolName = NEPALI_SYMBOLS[symbol];
  const symbolImage = getSymbolImage(symbol);
  
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
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          ...(traditional ? {
            borderRadius: size / 8,
            background: symbolStyle.bgColor,
            border: `${active ? 3 : 2}px solid ${symbolStyle.borderColor}`,
            boxShadow: active 
              ? `0 0 10px ${symbolStyle.color}80, 0 0 20px rgba(0,0,0,0.4)` 
              : '0 4px 8px rgba(0,0,0,0.3)',
            transform: 'perspective(200px) rotateX(10deg)',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '50%',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%)',
              borderTopLeftRadius: size / 8,
              borderTopRightRadius: size / 8,
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%239e845f\' fill-opacity=\'0.1\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
              backgroundSize: `${size * 2}px ${size * 2}px`,
              opacity: 0.5,
              mixBlendMode: 'multiply',
            }
          } : {
            // Non-traditional simple symbol style
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          })
        }}
      >
        {/* Use image instead of Typography for the symbol */}
        {symbolImage ? (
          <Box
            component="img"
            src={symbolImage}
            alt={symbolName}
            sx={{
              width: traditional ? size * 0.6 : size * 0.8,
              height: 'auto',
              objectFit: 'contain',
              filter: traditional ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))' : 'none',
              opacity: traditional ? 0.9 : 1,
            }}
          />
        ) : (
          <Typography
            variant="h4"
            sx={{
              fontSize: traditional ? size * 0.6 : size * 0.9,
              fontWeight: 'bold',
              color: symbolStyle.color,
              ...(traditional ? {
                textShadow: symbolStyle.textShadow,
                WebkitTextStroke: '1px rgba(0, 0, 0, 0.3)',
                background: 'rgba(0, 0, 0, 0.2)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 1px 1px rgba(255,255,255,0.5))',
              } : {
                // Non-traditional simple symbol style
                textShadow: 'none',
              })
            }}
          >
            {symbolStyle.symbol}
          </Typography>
        )}
      </Box>
      
      {/* Optional label */}
      {showLabel && (
        <Typography 
          variant="caption" 
          sx={{ 
            mt: 1, 
            fontSize: size * 0.25,
            fontWeight: active ? 'bold' : 'medium',
            color: active ? symbolStyle.color : 'text.secondary',
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
            background: `radial-gradient(circle, ${symbolStyle.color}40 30%, transparent 70%)`,
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