import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import BugReportIcon from '@mui/icons-material/BugReport';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import ServerStatus from './ServerStatus';

const GameLobby: React.FC = () => {
  const { createRoom, joinRoom, error: gameError, setPlayerName, roomId: gameRoomId } = useGame();
  const { isConnected, connectionError, socket } = useSocket();
  
  const [name, setName] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [joinTimeout, setJoinTimeout] = useState<NodeJS.Timeout | null>(null);
  const [socketId, setSocketId] = useState<string | null>(null);
  
  // Update socket ID for debugging
  useEffect(() => {
    if (socket) {
      setSocketId(socket.id || null);
    }
  }, [socket]);
  
  // Monitor game room ID changes
  useEffect(() => {
    if (gameRoomId) {
      console.log("Game room ID set in context:", gameRoomId);
      // Clear joining state if we have a room ID set
      setIsJoining(false);
      if (joinTimeout) {
        clearTimeout(joinTimeout);
        setJoinTimeout(null);
      }
    }
  }, [gameRoomId, joinTimeout]);

  useEffect(() => {
    // Reset joining state if there's a game error
    if (gameError) {
      setIsJoining(false);
      setJoinError(gameError);
      
      // Clear any existing timeout
      if (joinTimeout) {
        clearTimeout(joinTimeout);
        setJoinTimeout(null);
      }
    }
  }, [gameError, joinTimeout]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    setPlayerName(value);
  };
  
  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
    // Clear previous join errors when changing room ID
    setJoinError(null);
  };
  
  const handleCreateRoom = () => {
    if (!name) return;
    
    // Clear any existing timeout
    if (joinTimeout) {
      clearTimeout(joinTimeout);
    }
    
    setIsJoining(true);
    setJoinError(null);
    createRoom();
    
    // Set a timeout to detect if joining fails (no response from server)
    const timeoutId = setTimeout(() => {
      setIsJoining(false);
      setJoinError('Room creation timed out. The server might be offline or busy. Please try again.');
    }, 10000);
    
    setJoinTimeout(timeoutId);
  };
  
  const handleJoinRoom = () => {
    if (!name || !roomId) return;
    
    // Validate room ID format (UUID format validation)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roomId)) {
      setJoinError('Invalid room ID format. Please enter a valid room ID.');
      return;
    }
    
    // Clear any existing timeout
    if (joinTimeout) {
      clearTimeout(joinTimeout);
    }
    
    setIsJoining(true);
    setJoinError(null);
    joinRoom(roomId, name);
    
    // Set a timeout to detect if joining fails (no response from server)
    const timeoutId = setTimeout(() => {
      setIsJoining(false);
      setJoinError('Joining room timed out. The room ID might be invalid or the server is busy.');
    }, 10000);
    
    setJoinTimeout(timeoutId);
  };
  
  const resetAndRetry = () => {
    // Clear any errors and joining state
    setJoinError(null);
    setIsJoining(false);
    
    if (joinTimeout) {
      clearTimeout(joinTimeout);
      setJoinTimeout(null);
    }
  };
  
  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Langur Burja Game
          </Typography>
          <IconButton 
            onClick={() => setShowDebug(!showDebug)}
            color={showDebug ? "primary" : "default"}
            size="small"
            title="Toggle debug panel"
          >
            <BugReportIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
          A traditional dice game with Spade, Heart, Diamond, Club, Flag, and Crown
        </Typography>
        
        <Collapse in={showDebug}>
          <ServerStatus />
        </Collapse>
        
        {!isConnected && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {connectionError || 'Connecting to server...'}
          </Alert>
        )}
        
        {joinError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="retry"
                color="inherit"
                size="small"
                onClick={resetAndRetry}
              >
                <RefreshIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {joinError}
          </Alert>
        )}
        
        {isJoining && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
            <CircularProgress size={30} />
            <Typography variant="body1" sx={{ ml: 2 }}>
              {roomId ? `Joining room ${roomId}...` : 'Creating new room...'}
            </Typography>
          </Box>
        )}
        
        <TextField
          label="Your Name"
          variant="outlined"
          fullWidth
          value={name}
          onChange={handleNameChange}
          margin="normal"
          required
          disabled={!isConnected || isJoining}
        />
        
        <Box sx={{ mt: 2, mb: 3 }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            onClick={handleCreateRoom}
            disabled={!name || !isConnected || isJoining}
          >
            Create New Game
          </Button>
        </Box>
        
        <Divider sx={{ my: 3 }}>OR</Divider>
        
        <TextField
          label="Room ID"
          variant="outlined"
          fullWidth
          value={roomId}
          onChange={handleRoomIdChange}
          margin="normal"
          required
          disabled={!isConnected || isJoining}
          placeholder="e.g., 123e4567-e89b-12d3-a456-426614174000"
          helperText="Enter the room ID provided by the game creator"
        />
        
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            size="large"
            onClick={handleJoinRoom}
            disabled={!name || !roomId || !isConnected || isJoining}
          >
            Join Existing Game
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default GameLobby; 