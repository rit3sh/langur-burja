import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Chip, Divider } from '@mui/material';
import { useSocket } from '../context/SocketContext';
import { useGame } from '../context/GameContext';

const ServerStatus: React.FC = () => {
  const { isConnected, connectionError, socket } = useSocket();
  const { roomId, playerName, playerId, error: gameError } = useGame();
  
  const [checking, setChecking] = useState(false);
  const [serverHealth, setServerHealth] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[] | null>(null);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const checkServerHealth = async () => {
    setChecking(true);
    try {
      const response = await fetch('http://localhost:5000/health');
      if (response.ok) {
        setServerHealth('OK');
      } else {
        setServerHealth(`Error: ${response.status}`);
      }
    } catch (err) {
      setServerHealth('Failed to connect');
    } finally {
      setChecking(false);
    }
  };

  const pingServer = async () => {
    setChecking(true);
    try {
      const start = Date.now();
      const response = await fetch('http://localhost:5000/ping');
      const elapsed = Date.now() - start;
      if (response.ok) {
        setPingResult(`OK (${elapsed}ms)`);
      } else {
        setPingResult(`Error: ${response.status}`);
      }
    } catch (err) {
      setPingResult('Failed to connect');
    } finally {
      setChecking(false);
    }
  };

  const checkRooms = async () => {
    setChecking(true);
    try {
      const response = await fetch('http://localhost:5000/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms);
      } else {
        setRooms([]);
      }
    } catch (err) {
      setRooms([]);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    // Check server status on mount
    checkServerHealth();
    pingServer();
  }, []);

  return (
    <Box sx={{ mt: 4, p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Server Connection Debug
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: '120px' }}>
          Socket.IO Connection:
        </Typography>
        <Chip 
          label={isConnected ? 'Connected' : 'Disconnected'} 
          color={isConnected ? 'success' : 'error'} 
          size="small"
        />
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: '120px' }}>
          Socket ID:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {socket?.id || 'Not assigned'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: '120px' }}>
          Player ID:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {playerId || 'Not assigned'}
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: '120px' }}>
          Room ID:
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
          {roomId || 'Not in a room'}
        </Typography>
      </Box>
      
      {connectionError && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          Connection Error: {connectionError}
        </Typography>
      )}
      
      {gameError && (
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>
          Game Error: {gameError}
        </Typography>
      )}
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: '120px' }}>
          Server Health:
        </Typography>
        {checking ? (
          <CircularProgress size={20} />
        ) : (
          <Chip 
            label={serverHealth || 'Unknown'} 
            color={serverHealth === 'OK' ? 'success' : 'error'} 
            size="small"
          />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" sx={{ mr: 1, minWidth: '120px' }}>
          Ping:
        </Typography>
        {checking ? (
          <CircularProgress size={20} />
        ) : (
          <Chip 
            label={pingResult || 'Unknown'} 
            color={pingResult?.startsWith('OK') ? 'success' : 'error'} 
            size="small"
          />
        )}
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          onClick={checkServerHealth}
          disabled={checking}
          sx={{ mr: 1 }}
        >
          Check Server
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={pingServer}
          disabled={checking}
          sx={{ mr: 1 }}
        >
          Ping Server
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={checkRooms}
          disabled={checking}
        >
          List Rooms
        </Button>
      </Box>
      
      {rooms && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Active Rooms: {rooms.length}
          </Typography>
          {rooms.length > 0 ? (
            <Box component="ul" sx={{ pl: 2, m: 0, maxHeight: '200px', overflowY: 'auto' }}>
              {rooms.map((room) => (
                <li key={room.id}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                    ID: {room.id} | Players: {room.playerCount}/{room.maxPlayers} | State: {room.gameState}
                  </Typography>
                </li>
              ))}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No active rooms found
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ServerStatus; 