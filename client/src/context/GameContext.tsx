import React, { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Symbol types
export type SymbolType =
	| "Spade"
	| "Heart"
	| "Diamond"
	| "Club"
	| "Flag"
	| "Crown";
export const SYMBOLS: SymbolType[] = [
	"Spade",
	"Heart",
	"Diamond",
	"Club",
	"Flag",
	"Crown",
];

// Nepali names for symbols - for display purposes
export const NEPALI_SYMBOLS: Record<SymbolType, string> = {
	Club: "चिड़ी",
	Crown: "बुर्जा",
	Spade: "हुकुम",
	Diamond: "ईट्टा",
	Flag: "झंडी",
	Heart: "पान",
};

// Game states
export type GameState = "betting" | "rolling" | "results";

// Player interface
export interface Player {
	id: string;
	name: string;
	balance: number;
}

// Bet interface
export interface Bets {
	[playerId: string]: {
		[symbolKey in SymbolType]?: number;
	};
}

// Payout interface
export interface Payouts {
	[playerId: string]: {
		[symbolKey in SymbolType]?: number;
	};
}

// Game context interface
interface GameContextType {
	roomId: string | null;
	players: Record<string, Player>;
	bets: Bets;
	diceResults: SymbolType[];
	gameState: GameState;
	playerName: string;
	playerId: string | null;
	payouts: Payouts | null;
	error: string | null;
	createRoom: () => void;
	joinRoom: (roomId: string, playerName: string) => void;
	leaveRoom: () => void;
	placeBet: (symbol: SymbolType, amount: number) => void;
	decreaseBet: (symbol: SymbolType, amount: number) => void;
	rollDice: () => void;
	startNewRound: (forceReset?: boolean) => void;
	setPlayerName: (name: string) => void;
	resetBalance: () => void;
}

const GameContext = createContext<GameContextType>({
	roomId: null,
	players: {},
	bets: {},
	diceResults: [],
	gameState: "betting",
	playerName: "",
	playerId: null,
	payouts: null,
	error: null,
	createRoom: () => {},
	joinRoom: () => {},
	leaveRoom: () => {},
	placeBet: () => {},
	decreaseBet: () => {},
	rollDice: () => {},
	startNewRound: () => {},
	setPlayerName: () => {},
	resetBalance: () => {},
});

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { socket, isConnected } = useSocket();

	// Initialize with null/empty values for SSR
	const [roomId, setRoomId] = useState<string | null>(null);
	const [players, setPlayers] = useState<Record<string, Player>>({});
	const [bets, setBets] = useState<Bets>({});
	const [diceResults, setDiceResults] = useState<SymbolType[]>([]);
	const [gameState, setGameState] = useState<GameState>("betting");
	const [playerName, setPlayerName] = useState<string>("");
	const [playerId, setPlayerId] = useState<string | null>(null);
	const [payouts, setPayouts] = useState<Payouts | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [attemptingJoin, setAttemptingJoin] = useState<boolean>(false);
	const [attemptedRoomId, setAttemptedRoomId] = useState<string | null>(null);

	// Initialize from localStorage on client-side only to prevent hydration mismatch
	useEffect(() => {
		if (isBrowser) {
			const storedRoomId = localStorage.getItem('gameRoomId');
			const storedPlayerName = localStorage.getItem('playerName') || "";
			
			if (storedRoomId) {
				setRoomId(storedRoomId);
			}
			
			if (storedPlayerName) {
				setPlayerName(storedPlayerName);
			}
		}
	}, []);

	// Persist roomId to localStorage when it changes
	useEffect(() => {
		if (!isBrowser) return;
		
		if (roomId) {
			localStorage.setItem('gameRoomId', roomId);
		} else {
			localStorage.removeItem('gameRoomId');
		}
	}, [roomId]);

	// Persist playerName to localStorage when it changes
	useEffect(() => {
		if (!isBrowser) return;
		
		if (playerName) {
			localStorage.setItem('playerName', playerName);
		} else {
			localStorage.removeItem('playerName');
		}
	}, [playerName]);

	// Auto-rejoin room on page refresh
	useEffect(() => {
		if (socket && isConnected && roomId && playerName && !attemptingJoin) {
			console.log("Auto-rejoining room:", roomId, "with name:", playerName);
			joinRoom(roomId, playerName);
		}
	}, [socket, isConnected]);

	useEffect(() => {
		if (!socket) return;

		// Set playerId when socket connects
		setPlayerId(socket.id || null);

		// Socket event handlers
		socket.on("roomCreated", ({ roomId }) => {
			console.log("Room created with ID:", roomId);
			setRoomId(roomId);
			setAttemptedRoomId(roomId);

			// The server now automatically joins the room, so we don't need this
			// socket.emit('joinRoom', { roomId, playerName });
		});

		socket.on("error", ({ message, code }) => {
			console.error("Server error:", message);
			setError(message);

			// If room not found, clear the room state
			if (code === "ROOM_NOT_FOUND") {
				setRoomId(null);
				if (isBrowser) {
					localStorage.removeItem('gameRoomId');
				}
			}
		});

		socket.on("playerJoined", ({ player, players, playerCount }) => {
			console.log("Player joined:", player.name, "Total players:", playerCount);
			setPlayers(players);

			// If this was our join, clear the joining state
			if (attemptingJoin && player.id === socket.id) {
				setAttemptingJoin(false);
			}

			// Update players list
			setPlayers(players);

			// Identify the player
			if (player.name === playerName) {
				setPlayerId(player.id);
			}
		});

		socket.on("playerLeft", ({ playerId, players, playerCount }) => {
			console.log("Player left. Total players:", playerCount);
			setPlayers(players);
		});

		socket.on(
			"gameState",
			({ roomId: joinedRoomId, gameState, players, bets, diceResults }) => {
				console.log("Game state received:", gameState, "Room:", joinedRoomId);

				// Always set roomId if it's valid
				if (joinedRoomId) {
					setRoomId(joinedRoomId);
				}

				// If this is from our join attempt, clear the attempt state
				if (attemptingJoin) {
					setAttemptingJoin(false);
					setAttemptedRoomId(null);
				}

				setGameState(gameState);
				setPlayers(players);
				setBets(bets);
				setDiceResults(diceResults);
			}
		);

		socket.on("betPlaced", ({ playerId, symbol, amount, playerBalance }) => {
			// Update bets
			setBets((prevBets) => {
				const newBets = { ...prevBets };
				if (!newBets[playerId]) {
					newBets[playerId] = {};
				}
				newBets[playerId][symbol as SymbolType] = amount;
				return newBets;
			});

			// Update player balance
			setPlayers((prevPlayers) => {
				if (!prevPlayers[playerId]) return prevPlayers;

				return {
					...prevPlayers,
					[playerId]: {
						...prevPlayers[playerId],
						balance: playerBalance,
					},
				};
			});
		});

		socket.on("gameStateChanged", ({ gameState }) => {
			setGameState(gameState);
		});

		socket.on("diceResults", ({ diceResults, payouts, players }) => {
			setDiceResults(diceResults);
			setPayouts(payouts);
			setPlayers(players);
		});

		socket.on("newRound", ({ gameState, bets }) => {
			setGameState(gameState);
			setBets(bets);
			setDiceResults([]);
			setPayouts(null);
		});

		socket.on("balanceReset", ({ playerId, newBalance }) => {
			setPlayers((prevPlayers) => {
				if (!prevPlayers[playerId]) return prevPlayers;

				return {
					...prevPlayers,
					[playerId]: {
						...prevPlayers[playerId],
						balance: newBalance,
					},
				};
			});
		});

		// Cleanup listeners on unmount
		return () => {
			socket.off("roomCreated");
			socket.off("error");
			socket.off("playerJoined");
			socket.off("playerLeft");
			socket.off("gameState");
			socket.off("betPlaced");
			socket.off("gameStateChanged");
			socket.off("diceResults");
			socket.off("newRound");
			socket.off("balanceReset");
		};
	}, [socket, playerName, attemptingJoin, attemptedRoomId]);

	// Game actions
	const createRoom = () => {
		if (!socket || !playerName || !isConnected) {
			setError("Cannot create room: not connected to server or name not set");
			return;
		}

		setAttemptingJoin(true);

		// Send playerName with createRoom to enable auto-join
		console.log(`Creating room with player name: ${playerName}`);
		socket.emit("createRoom", { playerName });

		// Add a timeout to handle cases where the server doesn't respond
		setTimeout(() => {
			if (attemptingJoin) {
				console.log("Room creation timeout - no response from server");
				setAttemptingJoin(false);
				setAttemptedRoomId(null);
				setError("Room creation timed out. Please try again.");
			}
		}, 10000);
	};

	const joinRoom = (roomId: string, name: string) => {
		if (!socket || !isConnected) {
			setError("Cannot join room: not connected to server");
			return;
		}

		if (!name) {
			setError("Please enter your name");
			return;
		}

		console.log("Attempting to join room:", roomId, "with name:", name);
		setPlayerName(name);
		setAttemptingJoin(true);
		setAttemptedRoomId(roomId);
		socket.emit("joinRoom", { roomId, playerName: name });
	};

	const leaveRoom = () => {
		if (!socket || !roomId) return;

		socket.emit("leaveRoom", { roomId });
		setRoomId(null);
		setPlayers({});
		setBets({});
		setDiceResults([]);
		setGameState("betting");
		setPayouts(null);
		
		// Clear stored room data
		if (isBrowser) {
			localStorage.removeItem('gameRoomId');
		}
	};

	const placeBet = (symbol: SymbolType, amount: number) => {
		if (!socket || !roomId) return;

		socket.emit("placeBet", { roomId, symbol, amount });
	};

	// New function to handle decreasing bets
	const decreaseBet = (symbol: SymbolType, amount: number) => {
		if (!socket || !roomId || !playerId) return;

		// Get current bet amount for this symbol
		const currentBet = bets[playerId]?.[symbol] || 0;

		if (currentBet <= 0) return; // No bet to decrease

		// Calculate the new bet amount after decreasing
		const decreaseAmount = Math.min(amount, currentBet);

		// Update local state immediately for responsive UI
		setBets((prev) => {
			const newBets = { ...prev };
			if (!newBets[playerId]) {
				newBets[playerId] = {};
			}
			newBets[playerId][symbol] = currentBet - decreaseAmount;
			return newBets;
		});

		// Update player balance
		setPlayers((prev) => {
			if (!prev[playerId]) return prev;

			return {
				...prev,
				[playerId]: {
					...prev[playerId],
					balance: prev[playerId].balance + decreaseAmount,
				},
			};
		});

		// Send update to server
		socket.emit("decreaseBet", { roomId, symbol, amount: decreaseAmount });
	};

	const rollDice = () => {
		if (!socket || !roomId) return;

		socket.emit("rollDice", { roomId });
	};

	const startNewRound = (forceReset = false) => {
		if (!socket || !roomId) return;

		socket.emit("startNewRound", { roomId, forceReset });
	};

	const resetBalance = () => {
		if (!socket || !roomId || !playerId) return;
		
		socket.emit("resetBalance", { roomId });
	};

	return (
		<GameContext.Provider
			value={{
				roomId,
				players,
				bets,
				diceResults,
				gameState,
				playerName,
				playerId,
				payouts,
				error,
				createRoom,
				joinRoom,
				leaveRoom,
				placeBet,
				decreaseBet,
				rollDice,
				startNewRound,
				setPlayerName,
				resetBalance,
			}}
		>
			{children}
		</GameContext.Provider>
	);
};
