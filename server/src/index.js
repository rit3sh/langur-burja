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
    createdAt: new Date().toISOString()
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
    console.log(`Player ${playerName} attempting to join room ${roomId}`);
    
    try {
      // Validate room exists
      if (!gameRooms[roomId]) {
        console.log(`Room ${roomId} does not exist`);
        socket.emit('error', { message: 'Room does not exist or has expired' });
        return;
      }
      
      const room = gameRooms[roomId];
      
      // Check if room is full
      if (room.playerCount >= room.maxPlayers) {
        console.log(`Room ${roomId} is full (${room.playerCount}/${room.maxPlayers})`);
        socket.emit('error', { message: 'Room is full' });
        return;
      }
      
      // Check if player is already in the room
      if (room.players[socket.id]) {
        console.log(`Player ${playerName} (${socket.id}) is already in room ${roomId}`);
        // Just update the game state for the player
        socket.emit('gameState', {
          roomId,
          gameState: room.gameState,
          players: room.players,
          bets: room.bets,
          diceResults: room.diceResults
        });
        return;
      }
      
      // Join the room
      socket.join(roomId);
      
      // Add player to the room
      room.players[socket.id] = {
        id: socket.id,
        name: playerName,
        balance: 1000, // Starting balance
      };
      
      // Initialize empty bets for this player
      room.bets[socket.id] = {};
      SYMBOLS.forEach(symbol => {
        room.bets[socket.id][symbol] = 0;
      });
      
      room.playerCount++;
      
      // Notify all players in the room
      io.to(roomId).emit('playerJoined', {
        player: room.players[socket.id],
        players: room.players,
        playerCount: room.playerCount
      });
      
      // Send the current game state to the new player
      socket.emit('gameState', {
        roomId,
        gameState: room.gameState,
        players: room.players,
        bets: room.bets,
        diceResults: room.diceResults
      });
      
      console.log(`Player ${playerName} (${socket.id}) joined room ${roomId} successfully. Total players: ${room.playerCount}`);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room. Please try again.' });
    }
  });

  // Clean up heartbeat and handle other cleanup on disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    clearInterval(heartbeatInterval);
    
    // Find rooms where this player is and remove them
    Object.keys(gameRooms).forEach(roomId => {
      if (gameRooms[roomId].players[socket.id]) {
        const room = gameRooms[roomId];
        const playerName = room.players[socket.id].name;
        
        // Remove player from room
        delete room.players[socket.id];
        delete room.bets[socket.id];
        room.playerCount--;
        
        // Notify remaining players
        io.to(roomId).emit('playerLeft', {
          playerId: socket.id,
          players: room.players,
          playerCount: room.playerCount
        });
        
        console.log(`Player ${playerName} disconnected from room ${roomId}`);
        
        // Clean up empty rooms
        if (room.playerCount === 0) {
          delete gameRooms[roomId];
          console.log(`Room ${roomId} deleted (empty)`);
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
      
      // Calculate payouts
      const payouts = calculatePayouts(room.bets, room.diceResults);
      
      // Update player balances based on payouts
      Object.entries(payouts).forEach(([playerId, symbolPayouts]) => {
        const player = room.players[playerId];
        if (player) {
          Object.values(symbolPayouts).forEach(amount => {
            player.balance += amount;
          });
        }
      });
      
      // Send results to all players
      io.to(roomId).emit('diceResults', {
        diceResults: room.diceResults,
        payouts,
        players: room.players
      });
      
      // Reset for next round after delay
      setTimeout(() => {
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
      }, 5000);
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
      
      socket.leave(roomId);
      
      // Notify remaining players
      io.to(roomId).emit('playerLeft', {
        playerId: socket.id,
        players: room.players,
        playerCount: room.playerCount
      });
      
      console.log(`Player ${playerName} left room ${roomId}`);
      
      // Clean up empty rooms
      if (room.playerCount === 0) {
        delete gameRooms[roomId];
        console.log(`Room ${roomId} deleted (empty)`);
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
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 