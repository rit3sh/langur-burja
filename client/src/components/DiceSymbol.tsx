import React from 'react';
import { Box, SvgIcon } from '@mui/material';
import { SvgIconProps } from '@mui/material/SvgIcon';
import { SymbolType } from '../context/GameContext';

// Custom SVG icons for each symbol
const SpadeIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
  </SvgIcon>
);

const HeartIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </SvgIcon>
);

const DiamondIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2L2 12l10 10 10-10L12 2z" />
  </SvgIcon>
);

const ClubIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 2C9.97 2 8.1 3.27 7.29 5.07 7.12 5.62 7 6.28 7 7c0 1.66 1.34 3 3 3 .35 0 .69-.06 1-.17V15h-3v2h8v-2h-3v-5.17c.31.11.65.17 1 .17 1.66 0 3-1.34 3-3 0-.72-.12-1.39-.29-1.93C15.9 3.27 14.03 2 12 2z" />
  </SvgIcon>
);

const FlagIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z" />
  </SvgIcon>
);

const CrownIcon = (props: SvgIconProps) => (
  <SvgIcon {...props}>
    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
  </SvgIcon>
);

interface DiceSymbolProps {
  symbol: SymbolType;
  size?: number;
  color?: string;
  active?: boolean;
  onClick?: () => void;
}

const getSymbolIcon = (symbol: SymbolType) => {
  switch (symbol) {
    case 'Spade':
      return SpadeIcon;
    case 'Heart':
      return HeartIcon;
    case 'Diamond':
      return DiamondIcon;
    case 'Club':
      return ClubIcon;
    case 'Flag':
      return FlagIcon;
    case 'Crown':
      return CrownIcon;
    default:
      return SpadeIcon;
  }
};

const DiceSymbol: React.FC<DiceSymbolProps> = ({
  symbol,
  size = 40,
  color = 'primary',
  active = false,
  onClick,
}) => {
  const IconComponent = getSymbolIcon(symbol);
  
  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 1,
        backgroundColor: active ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
        transition: 'all 0.2s',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          backgroundColor: onClick ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
        },
      }}
      onClick={onClick}
    >
      <IconComponent
        color={color as any}
        sx={{
          width: size * 0.8,
          height: size * 0.8,
        }}
      />
    </Box>
  );
};

export default DiceSymbol; 