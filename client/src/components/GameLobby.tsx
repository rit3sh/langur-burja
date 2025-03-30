import React, { useState, useEffect } from "react";
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
	Card,
	Icon,
	Grid,
} from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import RefreshIcon from "@mui/icons-material/Refresh";
import { NEPALI_SYMBOLS, SYMBOLS, useGame } from "../context/GameContext";
import { useSocket } from "../context/SocketContext";
import ServerStatus from "./ServerStatus";
import DiceSymbol from "./DiceSymbol";
import DiceRoller from "./DiceRoller";
// Check if we're running in a browser environment
const isBrowser = typeof window !== "undefined";

const GameLobby: React.FC = () => {
	const {
		createRoom,
		joinRoom,
		error: gameError,
		setPlayerName,
		roomId: gameRoomId,
	} = useGame();
	const { isConnected, connectionError, socket } = useSocket();

	// Initialize with empty values for SSR
	const [name, setName] = useState<string>("");
	const [roomId, setRoomId] = useState<string>("");
	const [isJoining, setIsJoining] = useState(false);
	const [joinError, setJoinError] = useState<string | null>(null);
	const [showDebug, setShowDebug] = useState(false);
	const [joinTimeout, setJoinTimeout] = useState<NodeJS.Timeout | null>(null);
	const [socketId, setSocketId] = useState<string | null>(null);
	const [savedRoomId, setSavedRoomId] = useState<string | null>(null);

	// Initialize from localStorage after component mounts on client-side
	useEffect(() => {
		if (isBrowser) {
			const storedName = localStorage.getItem("playerName") || "";
			const storedRoomId = localStorage.getItem("gameRoomId");

			setName(storedName);
			setSavedRoomId(storedRoomId);

			// Also set the name in the context
			if (storedName) {
				setPlayerName(storedName);
			}
		}
	}, []);

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
			setJoinError(
				"Room creation timed out. The server might be offline or busy. Please try again."
			);
		}, 10000);

		setJoinTimeout(timeoutId);
	};

	const handleJoinRoom = () => {
		if (!name || !roomId) return;

		// Validate room ID format (UUID format validation)
		const uuidRegex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		if (!uuidRegex.test(roomId)) {
			setJoinError("Invalid room ID format. Please enter a valid room ID.");
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
			setJoinError(
				"Joining room timed out. The room ID might be invalid or the server is busy."
			);
		}, 10000);

		setJoinTimeout(timeoutId);
	};

	const handleRejoinSavedRoom = () => {
		if (!name || !savedRoomId) return;

		setIsJoining(true);
		setJoinError(null);
		joinRoom(savedRoomId, name);

		// Set a timeout to detect if joining fails
		const timeoutId = setTimeout(() => {
			setIsJoining(false);
			setJoinError("Rejoining room timed out. The room might no longer exist.");
			// Clear saved room if it no longer exists
			if (isBrowser) {
				localStorage.removeItem("gameRoomId");
			}
			setSavedRoomId(null);
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

	const clearSavedRoom = () => {
		if (isBrowser) {
			localStorage.removeItem("gameRoomId");
		}
		setSavedRoomId(null);
	};

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				minHeight: "100vh",
				p: 2,
			}}
		>
			<Paper
				elevation={8}
				sx={{
					maxWidth: 500,
					p: 3,
					borderRadius: 4,
					background: "rgba(23, 33, 43, 0.8)",
					backdropFilter: "blur(8px)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					boxShadow:
						"0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
				}}
			>
				<Box
					sx={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						mb: 2,
					}}
				>
					<Typography variant="h4" component="h1" gutterBottom>
						Langur Burja (लङ्गुर बुर्जा)
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

				<Collapse in={showDebug}>
					<ServerStatus />
				</Collapse>

				{!isConnected && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{connectionError || "Connecting to server..."}
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
					<Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
						<CircularProgress size={30} />
						<Typography variant="body1" sx={{ ml: 2 }}>
							{roomId
								? `Joining room ${roomId}...`
								: savedRoomId
								? `Rejoining previous game...`
								: "Creating new room..."}
						</Typography>
					</Box>
				)}

				{/* Previously saved room card */}
				{savedRoomId && !isJoining && !gameRoomId && (
					<Card
						sx={{
							mb: 3,
							p: 2,
							border: "1px solid rgba(255, 215, 0, 0.5)",
							background: "rgba(255, 215, 0, 0.05)",
						}}
					>
						<Typography variant="body1" sx={{ mb: 2 }}>
							You have a saved game session. Would you like to rejoin?
						</Typography>
						<Typography
							variant="caption"
							sx={{ mb: 2, display: "block", color: "text.secondary" }}
						>
							Room ID: {savedRoomId}
						</Typography>
						<Box sx={{ display: "flex", gap: 2 }}>
							<Button
								variant="contained"
								color="primary"
								onClick={handleRejoinSavedRoom}
								disabled={!isConnected || !name}
								sx={{ flexGrow: 1 }}
							>
								Rejoin Game
							</Button>
							<Button
								variant="outlined"
								color="error"
								onClick={clearSavedRoom}
								sx={{ flexGrow: 0 }}
							>
								Clear
							</Button>
						</Box>
					</Card>
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
						disabled={!isConnected || !name || isJoining}
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

			<Grid container spacing={2} sx={{ mt: 3, maxWidth: 400 }}>
				{SYMBOLS.map((symbol, index) => (
					<Grid item xs={2} key={symbol}>
						<Box
							width={50}
							sx={{
								backgroundColor: "#fff",
								borderRadius: "6px",
								boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
								p: 1,
								display: "flex",
								justifyContent: "center",
								alignItems: "center",
								height: 50
							}}
						>
							<DiceSymbol
								symbol={symbol}
								size={50}
								traditional={false}
								disabled={true}
							/>
						</Box>
					</Grid>
				))}
			</Grid>
		</Box>
	);
};

export default GameLobby;
