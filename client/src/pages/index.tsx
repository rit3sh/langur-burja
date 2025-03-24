import React from 'react';
import { NextPage } from 'next';
import { Box, Typography } from '@mui/material';
import { SocketProvider } from '../context/SocketContext';
import { GameProvider, useGame } from '../context/GameContext';
import GameLobby from '../components/GameLobby';
import Game from '../components/Game';

const GameWrapper: React.FC = () => {
  const { roomId } = useGame();
  
  // Show lobby if not in a room, otherwise show the game
  return roomId ? <Game /> : <GameLobby />;
};

const Home: NextPage = () => {
  return (
    <SocketProvider>
      <GameProvider>
        <Box sx={{ minHeight: '100vh' }}>
          <GameWrapper />
        </Box>
      </GameProvider>
    </SocketProvider>
  );
};

export default Home; 