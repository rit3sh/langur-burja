# Langur Burja Multiplayer Game

A real-time multiplayer implementation of the traditional Langur Burja (Jhandi Munda) dice game using React, Next.js, Node.js, and Socket.IO.

## Game Rules

- **Dice**: The game uses six standard six-sided dice. Each face has a unique symbol: Spade, Heart, Diamond, Club, Flag, and Crown.
- **Betting**: Players place bets on which symbols they believe will appear when the dice are rolled.
- **Rolling**: A designated "banker" or the game server rolls all six dice simultaneously.
- **Payouts**: If a player's chosen symbol appears on one or more dice, they win. The payout is proportional to the number of dice showing the chosen symbol.

## Features

- Real-time multiplayer gameplay with up to 15 players per game room
- Room system for hosting multiple concurrent games
- Visual representations of the six dice symbols
- Betting interface for placing bets on different symbols
- Live updates of other players' actions
- Real-time dice rolling animations
- Game state management across all connected clients

## Tech Stack

- **Frontend**: React, Next.js, Material UI
- **Backend**: Node.js, Express
- **Real-time Communication**: Socket.IO
- **Styling**: Material UI components

## Project Structure

```
/
├── client/               # Frontend Next.js application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── context/      # React context providers
│   │   ├── pages/        # Next.js pages
│   ├── styles/           # Global styles
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
└── server/               # Backend Node.js application
    ├── src/              # Server source code
    │   └── index.js      # Main server entry point
    └── package.json      # Backend dependencies
```

## Getting Started

### Prerequisites

- Node.js (version 18.18.0 or higher)
- npm or yarn

### Installation and Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd langur-burja
   ```

2. Install server dependencies:
   ```
   cd server
   npm install
   ```

3. Install client dependencies:
   ```
   cd ../client
   npm install
   ```

### Running the Application

1. Start the server:
   ```
   cd server
   npm run dev
   ```

2. Start the client:
   ```
   cd ../client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## How to Play

1. Enter your name and either create a new game or join an existing one using a room ID
2. Place bets on the symbols you think will appear when the dice are rolled
3. Roll the dice (or wait for someone else to roll)
4. See the results and collect winnings if your chosen symbols appear
5. Continue betting in the next round

## Troubleshooting

### Node.js Version

This project requires Node.js version 18.18.0 or higher. If you encounter errors related to Node.js versions, please upgrade your Node.js installation. You can check your current Node.js version with:

```
node -v
```

### Next.js Compatibility

The client uses Next.js which requires Node.js 18.18.0 or higher. If you encounter compatibility issues, make sure you're using a supported Node.js version.

## License

This project is licensed under the MIT License. 