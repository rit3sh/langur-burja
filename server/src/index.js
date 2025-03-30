const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());

// Add a simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is running');
});

// Add endpoint to list available rooms (for debugging)
app.get('/rooms', (req, res) => {
  const roomList = Object.keys(gameRooms).map(roomId => ({
    id: roomId,
    playerCount: gameRooms[roomId].playerCount,
    maxPlayers: gameRooms[roomId].maxPlayers,
    gameState: gameRooms[roomId].gameState
  }));
  res.status(200).json({ rooms: roomList });
});

// Add a simple ping route to verify connection
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Game state storage
const gameRooms = {};

// Player session tracking
const playerSessions = {};

// Player name to session mapping for reconnection
const playerNameToSession = {};

// Room timers for cleanup
const roomTimers = {};

// Player disconnect tracking with timestamps
const disconnectedPlayers = {};

// Time to keep empty rooms (in milliseconds) - 5 minutes
const ROOM_PERSISTENCE_TIME = 5 * 60 * 1000;

// Starting balance for new players
const STARTING_BALANCE = 1000;

// Symbols for the dice faces
const SYMBOLS = ['Spade', 'Heart', 'Diamond', 'Club', 'Flag', 'Crown'];

// Create a new game room
function createGameRoom(roomId) {
  return {
    id: roomId,
    players: {},
    bets: {},
    diceResults: [],
    gameState: 'betting', // betting, rolling, results
    playerCount: 0,
    maxPlayers: 15,
    createdAt: new Date().toISOString(),
    lastActive: new Date().toISOString()
  };
}

// Roll the dice and return the results
function rollDice() {
  const results = [];
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
    results.push(SYMBOLS[randomIndex]);
  }
  return results;
}

// Calculate payouts based on bets and dice results
function calculatePayouts(bets, diceResults) {
  const payouts = {};
  const symbolCounts = {};
  
  // Count occurrences of each symbol
  diceResults.forEach(symbol => {
    symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
  });
  
  // Calculate payouts for each player
  Object.entries(bets).forEach(([playerId, playerBets]) => {
    payouts[playerId] = {};
    
    Object.entries(playerBets).forEach(([symbol, amount]) => {
      if (amount > 0) {
        const count = symbolCounts[symbol] || 0;
        if (count > 0) {
          // Payout is proportional to the number of matching dice
          payouts[playerId][symbol] = amount * count;
        } else {
          // Player loses their bet
          payouts[playerId][symbol] = -amount;
        }
      } else {
        payouts[playerId][symbol] = 0;
      }
    });
  });
  
  return payouts;
}

// Implement connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Set up heartbeat
  let heartbeatInterval = setInterval(() => {
    socket.emit('heartbeat', { timestamp: new Date().toISOString() });
  }, 30000); // every 30 seconds
  
  socket.on('heartbeat-response', () => {
    // Client responded to heartbeat
    console.log(`Received heartbeat response from ${socket.id}`);
  });

  // Create a new game room
  socket.on('createRoom', (data) => {
    try {
      console.log(`User ${socket.id} is creating a new room`);
      const roomId = uuidv4();
      gameRooms[roomId] = createGameRoom(roomId);
      
      console.log(`Room created with ID: ${roomId}`);
      
      // Directly emit the roomCreated event without delay
      socket.emit('roomCreated', { roomId });
      console.log(`Room created event sent to socket ${socket.id} for room ${roomId}`);
      
      // If playerName was provided, immediately join the room
      if (data && data.playerName) {
        // Simulate the joinRoom event
        console.log(`Auto-joining player ${data.playerName} to room ${roomId}`);
        
        // Add player to the room
        socket.join(roomId);
        
        // Add player to the room data
        gameRooms[roomId].players[socket.id] = {
          id: socket.id,
          name: data.playerName,
          balance: 1000, // Starting balance
        };
        
        // Initialize empty bets for this player
        gameRooms[roomId].bets[socket.id] = {};
        SYMBOLS.forEach(symbol => {
          gameRooms[roomId].bets[socket.id][symbol] = 0;
        });
        
        gameRooms[roomId].playerCount++;
        
        // Send the gameState immediately
        socket.emit('gameState', {
          roomId,
          gameState: gameRooms[roomId].gameState,
          players: gameRooms[roomId].players,
          bets: gameRooms[roomId].bets,
          diceResults: gameRooms[roomId].diceResults
        });
        
        console.log(`Player auto-joined room ${roomId} successfully`);
      }
      
      // Log active rooms for debugging
      const roomCount = Object.keys(gameRooms).length;
      console.log(`Total active rooms: ${roomCount}`);
    } catch (error) {
      console.error('Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room. Please try again.' });
    }
  });
  
  // Join an existing game room
  socket.on('joinRoom', ({ roomId, playerName }) => {
    // Validate input
    if (!roomId || !playerName) {
      socket.emit("error", { message: "Room ID and player name are required" });
      return;
    }
    
    // Check if room exists
    if (!gameRooms[roomId]) {
      socket.emit("error", { 
        message: "Room does not exist or has expired. Please create a new room.",
        code: "ROOM_NOT_FOUND"
      });
      return;
    }
    
    const room = gameRooms[roomId];
    room.lastActive = new Date().toISOString();
    
    // Clear any room deletion timer since we're joining it
    if (roomTimers[roomId]) {
      clearTimeout(roomTimers[roomId]);
      delete roomTimers[roomId];
      console.log(`Cleared deletion timer for room ${roomId} as player is joining`);
    }
    
    // Check for reconnection by player name and room ID first
    let sessionData = null;
    let isNameReconnection = false;
    
    // Check if this player name was recently in this room
    if (playerNameToSession[roomId] && playerNameToSession[roomId][playerName]) {
      sessionData = playerNameToSession[roomId][playerName];
      isNameReconnection = true;
      console.log(`Found session by player name ${playerName} in room ${roomId}`);
    }
    
    // If not found by name, check by socket ID
    if (!sessionData) {
      sessionData = playerSessions[socket.id];
      if (sessionData && sessionData.roomId === roomId) {
        console.log(`Found session by socket ID for ${playerName} in room ${roomId}`);
      } else {
        sessionData = null;
      }
    }
    
    // Have the player join the socket.io room
    socket.join(roomId);
    
    if (sessionData) {
      console.log(`Player ${playerName} is reconnecting to room ${roomId}, previous balance: ${sessionData.balance}`);
      
      // Restore player data from saved session
      room.players[socket.id] = {
        id: socket.id,
        name: playerName,
        balance: sessionData.balance  // Keep previous balance
      };
      
      // Check if the game is in results state and should be reset for the reconnected player
      // This ensures that after refreshing in results state, the game resets to betting state
      const shouldResetGame = room.gameState === 'results';
      
      if (shouldResetGame) {
        console.log(`Game is in results state. Resetting to betting state for player ${playerName}`);
        
        // Reset the game state to betting
        room.gameState = 'betting';
        
        // Clear dice results
        room.diceResults = [];
        
        // Clear all bets while preserving player balances
        Object.keys(room.bets).forEach(playerId => {
          SYMBOLS.forEach(symbol => {
            room.bets[playerId][symbol] = 0;
          });
        });
        
        // Initialize empty bets for this reconnected player (just to be sure)
        room.bets[socket.id] = {};
        SYMBOLS.forEach(symbol => {
          room.bets[socket.id][symbol] = 0;
        });
        
        // Notify all players in the room about the game state change and reset bets
        io.to(roomId).emit('newRound', {
          gameState: 'betting',
          bets: room.bets
        });
      } else {
        // Just restore bets if we're not resetting the game
        room.bets[socket.id] = { ...sessionData.bets };
      }
      
      // If reconnecting by name, clean up the old socket ID entry
      if (isNameReconnection && sessionData.socketId !== socket.id) {
        delete playerSessions[sessionData.socketId];
        // Update the socketId reference
        sessionData.socketId = socket.id;
        playerSessions[socket.id] = sessionData;
        playerNameToSession[roomId][playerName] = sessionData;
      } else {
        // Clean up the session
        delete playerSessions[socket.id];
        
        if (playerNameToSession[roomId]) {
          delete playerNameToSession[roomId][playerName];
          if (Object.keys(playerNameToSession[roomId]).length === 0) {
            delete playerNameToSession[roomId];
          }
        }
      }
      
      console.log(`Restored session for ${playerName} in room ${roomId} with balance ${room.players[socket.id].balance}`);
    } 
    else if (room.players[socket.id]) {
      // Player is already in room - this is a reconnect
      console.log(`Player ${playerName} (${socket.id}) reconnected to room ${roomId}`);
      
      // Update the player name if it changed
      room.players[socket.id].name = playerName;
    } 
    else {
      // Add new player to the room
      room.players[socket.id] = {
        id: socket.id,
        name: playerName,
        balance: STARTING_BALANCE,
      };
      
      // Initialize player's bets
      room.bets[socket.id] = {};
      SYMBOLS.forEach(symbol => {
        room.bets[socket.id][symbol] = 0;
      });
      
      console.log(`New player ${playerName} joined room ${roomId} with starting balance ${STARTING_BALANCE}`);
    }
    
    // Update player count
    room.playerCount = Object.keys(room.players).length;
    
    // Send updated player list to all clients in the room
    io.to(roomId).emit("playerJoined", {
      player: room.players[socket.id],
      players: room.players,
      playerCount: room.playerCount
    });
    
    // Send current game state to the player
    socket.emit("gameState", {
      roomId,
      gameState: room.gameState,
      players: room.players,
      bets: room.bets,
      diceResults: room.diceResults
    });
  });

  // Clean up heartbeat and handle other cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    clearInterval(heartbeatInterval);
    
    // Find rooms where this player is
    Object.keys(gameRooms).forEach(roomId => {
      if (gameRooms[roomId].players[socket.id]) {
        const room = gameRooms[roomId];
        const player = room.players[socket.id];
        
        if (player) {
          const playerName = player.name;
          // Save the player's session data for potential reconnection
          const sessionData = {
            roomId,
            playerName: playerName,
            balance: player.balance,
            bets: { ...room.bets[socket.id] },
            disconnectedAt: new Date().toISOString(),
            socketId: socket.id
          };
          
          playerSessions[socket.id] = sessionData;
          
          // Store by player name and room ID for easier reconnection
          if (!playerNameToSession[roomId]) {
            playerNameToSession[roomId] = {};
          }
          playerNameToSession[roomId][playerName] = sessionData;
          
          // Track this player as disconnected with timestamp
          disconnectedPlayers[`${roomId}:${playerName}`] = new Date().getTime();
          
          // Keep session data for 30 minutes
          setTimeout(() => {
            delete playerSessions[socket.id];
            
            // Only delete name mapping if it still points to this session
            if (playerNameToSession[roomId] && 
                playerNameToSession[roomId][playerName] &&
                playerNameToSession[roomId][playerName].socketId === socket.id) {
              delete playerNameToSession[roomId][playerName];
              
              // Clean up room key if empty
              if (Object.keys(playerNameToSession[roomId]).length === 0) {
                delete playerNameToSession[roomId];
              }
            }
            
            delete disconnectedPlayers[`${roomId}:${playerName}`];
          }, 30 * 60 * 1000);
          
          console.log(`Saved session for ${playerName} (${socket.id}) in room ${roomId}`);
        }
        
        // Remove player from room
        delete room.players[socket.id];
        delete room.bets[socket.id];
        room.playerCount--;
        room.lastActive = new Date().toISOString();
        
        // Notify remaining players
        io.to(roomId).emit('playerLeft', {
          playerId: socket.id,
          players: room.players,
          playerCount: room.playerCount
        });
        
        console.log(`Player disconnected from room ${roomId}, remaining players: ${room.playerCount}`);
        
        // If the room is now empty, set a timer to delete it later
        if (room.playerCount === 0) {
          console.log(`Room ${roomId} is now empty, starting cleanup timer`);
          
          // Clear any existing timer for this room
          if (roomTimers[roomId]) {
            clearTimeout(roomTimers[roomId]);
          }
          
          // Set timer to delete the room after persistence time
          roomTimers[roomId] = setTimeout(() => {
            if (gameRooms[roomId] && gameRooms[roomId].playerCount === 0) {
              delete gameRooms[roomId];
              delete roomTimers[roomId];
              console.log(`Room ${roomId} deleted after inactivity`);
            }
          }, ROOM_PERSISTENCE_TIME);
        }
      }
    });
  });
  
  // Handle other socket events...
  socket.on('placeBet', ({ roomId, symbol, amount }) => {
    if (!gameRooms[roomId] || gameRooms[roomId].gameState !== 'betting') {
      socket.emit('error', { message: 'Cannot place bet at this time' });
      return;
    }
    
    const room = gameRooms[roomId];
    const player = room.players[socket.id];
    
    if (!player) {
      socket.emit('error', { message: 'Player not found in this room' });
      return;
    }
    
    // Validate bet amount
    if (amount <= 0 || amount > player.balance) {
      socket.emit('error', { message: 'Invalid bet amount' });
      return;
    }
    
    // Update player balance and bet
    player.balance -= amount;
    room.bets[socket.id][symbol] = (room.bets[socket.id][symbol] || 0) + amount;
    
    // Notify all players about the new bet
    io.to(roomId).emit('betPlaced', {
      playerId: socket.id,
      symbol,
      amount: room.bets[socket.id][symbol],
      playerBalance: player.balance
    });
    
    console.log(`Player ${player.name} bet ${amount} on ${symbol}`);
  });
  
  socket.on('rollDice', ({ roomId }) => {
    if (!gameRooms[roomId] || gameRooms[roomId].gameState !== 'betting') {
      socket.emit('error', { message: 'Cannot roll dice at this time' });
      return;
    }
    
    const room = gameRooms[roomId];
    
    // Update game state
    room.gameState = 'rolling';
    io.to(roomId).emit('gameStateChanged', { gameState: 'rolling' });
    
    // Roll the dice
    setTimeout(() => {
      room.diceResults = rollDice();
      room.gameState = 'results';
      
      // Notify clients about the state change to results
      io.to(roomId).emit('gameStateChanged', { gameState: 'results' });
      
      // Calculate payouts
      const payouts = calculatePayouts(room.bets, room.diceResults);
      
      // Update player balances based on payouts
      Object.entries(payouts).forEach(([playerId, symbolPayouts]) => {
        const player = room.players[playerId];
        if (player) {
          Object.values(symbolPayouts).forEach(amount => {
            // Ensure we don't go below zero when losing (negative payout)
            if (amount < 0 && Math.abs(amount) > player.balance) {
              // If the loss would make balance negative, adjust the payout to match remaining balance
              const adjustedAmount = -player.balance; // Negative amount that will make balance exactly 0
              player.balance = 0;
              // Update the payout to reflect this adjustment
              payouts[playerId][Object.keys(symbolPayouts).find(key => symbolPayouts[key] === amount)] = adjustedAmount;
            } else {
              player.balance += amount;
            }
          });
        }
      });
      
      // Send results to all players
      io.to(roomId).emit('diceResults', {
        diceResults: room.diceResults,
        payouts,
        players: room.players
      });
      
      // No longer automatically reset for next round
      // Keep the game in the "results" state until player clicks "New Game"
    }, 3000);
  });
  
  socket.on('leaveRoom', ({ roomId }) => {
    if (gameRooms[roomId] && gameRooms[roomId].players[socket.id]) {
      const room = gameRooms[roomId];
      const playerName = room.players[socket.id].name;
      
      // Remove player from room
      delete room.players[socket.id];
      delete room.bets[socket.id];
      room.playerCount--;
      room.lastActive = new Date().toISOString();
      
      socket.leave(roomId);
      
      // Notify remaining players
      io.to(roomId).emit('playerLeft', {
        playerId: socket.id,
        players: room.players,
        playerCount: room.playerCount
      });
      
      console.log(`Player ${playerName} left room ${roomId}`);
      
      // If room is now empty, set a timer to delete it after the persistence time
      if (room.playerCount === 0) {
        console.log(`Room ${roomId} is now empty after player left, starting cleanup timer`);
        
        // Clear any existing timer for this room
        if (roomTimers[roomId]) {
          clearTimeout(roomTimers[roomId]);
        }
        
        // Set timer to delete the room after persistence time
        roomTimers[roomId] = setTimeout(() => {
          if (gameRooms[roomId] && gameRooms[roomId].playerCount === 0) {
            delete gameRooms[roomId];
            delete roomTimers[roomId];
            console.log(`Room ${roomId} deleted after inactivity`);
          }
        }, ROOM_PERSISTENCE_TIME);
      }
    }
  });

  // Handle decreasing bets
  socket.on('decreaseBet', ({ roomId, symbol, amount }) => {
    if (!gameRooms[roomId] || gameRooms[roomId].gameState !== 'betting') {
      socket.emit('error', { message: 'Cannot modify bet at this time' });
      return;
    }
    
    const room = gameRooms[roomId];
    const player = room.players[socket.id];
    
    if (!player) {
      socket.emit('error', { message: 'Player not found in this room' });
      return;
    }
    
    // Validate decrease amount
    if (amount <= 0) {
      socket.emit('error', { message: 'Invalid decrease amount' });
      return;
    }
    
    // Check if player has a bet on this symbol
    const currentBet = room.bets[socket.id][symbol] || 0;
    if (currentBet <= 0) {
      socket.emit('error', { message: 'No bet to decrease' });
      return;
    }
    
    // Calculate how much to decrease
    const decreaseAmount = Math.min(amount, currentBet);
    
    // Update player balance and bet
    player.balance += decreaseAmount;
    room.bets[socket.id][symbol] -= decreaseAmount;
    
    // Notify all players about the updated bet
    io.to(roomId).emit('betPlaced', {
      playerId: socket.id,
      symbol,
      amount: room.bets[socket.id][symbol],
      playerBalance: player.balance
    });
    
    console.log(`Player ${player.name} decreased bet by ${decreaseAmount} on ${symbol}`);
  });

  // Handle starting a new round
  socket.on('startNewRound', ({ roomId, forceReset }) => {
    if (!gameRooms[roomId]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const room = gameRooms[roomId];
    
    // Check if game state allows starting a new round
    if (room.gameState !== 'results' && !forceReset) {
      socket.emit('error', { message: 'Cannot start a new round at this time. Use force reset if the game is stuck.' });
      return;
    }
    
    // Clear previous bets
    Object.keys(room.bets).forEach(playerId => {
      SYMBOLS.forEach(symbol => {
        room.bets[playerId][symbol] = 0;
      });
    });
    
    room.diceResults = [];
    room.gameState = 'betting';
    
    io.to(roomId).emit('newRound', {
      gameState: 'betting',
      bets: room.bets
    });
    
    console.log(`New round started in room ${roomId}${forceReset ? ' (force reset)' : ''}`);
  });
  
  // Handle resetting player balance
  socket.on('resetBalance', ({ roomId }) => {
    if (!gameRooms[roomId]) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }
    
    const room = gameRooms[roomId];
    const player = room.players[socket.id];
    
    if (!player) {
      socket.emit('error', { message: 'Player not found in this room' });
      return;
    }
    
    // Reset player balance to starting amount
    player.balance = STARTING_BALANCE;
    
    // Notify all players about the balance update
    io.to(roomId).emit('balanceReset', {
      playerId: socket.id,
      newBalance: STARTING_BALANCE
    });
    
    console.log(`Player ${player.name} reset their balance to ${STARTING_BALANCE}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 