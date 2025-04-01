import React, { useState, useEffect, useMemo } from "react";
import {
	Box,
	Button,
	Typography,
	CircularProgress,
	Chip,
	Tooltip,
} from "@mui/material";
import {
	Casino as CasinoIcon,
	ContentCopy,
	ExitToApp as ExitIcon,
	Refresh as RefreshIcon,
	Warning as WarningIcon,
} from "@mui/icons-material";
import { useGame } from "../context/GameContext";
import Dice from "./Dice";


interface GameControlsProps {
	onAllDiceRollComplete: () => void;
}

const GameControls: React.FC<GameControlsProps> = ({ onAllDiceRollComplete }) => {
	const { gameState, rollDice, leaveRoom, startNewRound, roomId, bets, playerId } = useGame();
	const [rollingTooLong, setRollingTooLong] = useState(false);

	// Detect when rolling state gets stuck
	useEffect(() => {
		let timer: NodeJS.Timeout;
		if (gameState === "rolling") {
			timer = setTimeout(() => {
				setRollingTooLong(true);
			}, 10000); // 10 seconds
		} else {
			setRollingTooLong(false);
		}
		return () => clearTimeout(timer);
	}, [gameState]);

	// Check if any bets have been placed
	const hasBets = useMemo(() => {
		// Check if any player has placed bets
		for (const playerID in bets) {
			const playerBets = bets[playerID];
			// Check if this player has any bets
			if (playerBets) {
				// Look for any non-zero bet on any symbol
				if (playerBets.Spade && playerBets.Spade > 0) return true;
				if (playerBets.Heart && playerBets.Heart > 0) return true;
				if (playerBets.Diamond && playerBets.Diamond > 0) return true;
				if (playerBets.Club && playerBets.Club > 0) return true;
				if (playerBets.Flag && playerBets.Flag > 0) return true;
				if (playerBets.Crown && playerBets.Crown > 0) return true;
			}
		}
		
		return false;
	}, [bets]);

	const isRolling = gameState === "rolling";
	const isBetting = gameState === "betting";
	const isResults = gameState === "results";
	const canRollDice = isBetting && hasBets;

	const getStatusColor = () => {
		if (isRolling) return "#FF9800";
		if (isBetting) return "#2196F3";
		return "#4CAF50";
	};

	const handleForceReset = () => {
		startNewRound(true);
	};

	return (
		<>
			<Typography
				variant="h5"
				gutterBottom
				sx={{
					color: "primary.main",
					fontWeight: 600,
					textShadow: "0 2px 4px rgba(0,0,0,0.3)",
					mb: 3,
					position: "relative",
					display: "inline-block",
					"&::after": {
						content: '""',
						position: "absolute",
						left: 0,
						bottom: -8,
						width: "60%",
						height: 3,
						background: "linear-gradient(90deg, #FFD700, transparent)",
						borderRadius: 3,
					},
				}}
			>
				Game Controls
			</Typography>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				{/* Game state display */}
				<Box
					sx={{
						mb: 1,
						p: 2,
						borderRadius: 2,
						background: "rgba(0, 0, 0, 0.2)",
						backdropFilter: "blur(5px)",
						border: "1px solid rgba(255, 255, 255, 0.05)",
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 1,
						}}
					>
						<Typography
							variant="body2"
							sx={{ fontWeight: "medium", color: "text.secondary" }}
						>
							Room
						</Typography>
						<Button
							size="small"
							startIcon={<ContentCopy />}
							onClick={() => {
								navigator.clipboard.writeText(roomId!);
							}}
						>
							Copy Room ID
						</Button>
					</Box>

					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<Typography
							variant="body2"
							sx={{ fontWeight: "medium", color: "text.secondary" }}
						>
							Status
						</Typography>
						<Chip
							label={
								isRolling
									? "ROLLING DICE"
									: isBetting
									? "PLACE YOUR BETS"
									: "SHOWING RESULTS"
							}
							size="small"
							sx={{
								fontWeight: "bold",
								background: "rgb(255, 255, 255)",
								borderRadius: "4px",
								color: "#000",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
							}}
						/>
					</Box>
				</Box>

				<Dice onAllDiceRollComplete={onAllDiceRollComplete} />
				
				{/* Action buttons */}
				<Box sx={{ display: "flex", gap: 2, flexDirection: "column" }}>
					<Box sx={{ display: "flex", gap: 2 }}>
						{isResults ? (
							<Button
								variant="contained"
								color="success"
								onClick={() => startNewRound()}
								startIcon={<RefreshIcon />}
								sx={{
									flexGrow: 1,
									py: 1.2,
									boxShadow: "0 4px 20px rgba(76, 175, 80, 0.4)",
									fontWeight: 600,
									fontSize: "1rem",
								}}
								className="game-btn"
							>
								New Game
							</Button>
						) : (
							<Tooltip title={!canRollDice && isBetting ? "Place at least one bet before rolling dice" : ""}>
								<span style={{ width: '100%' }}>
									<Button
										variant="contained"
										color="primary"
										onClick={rollDice}
										disabled={!canRollDice}
										startIcon={
											isRolling ? (
												<CircularProgress size={20} color="inherit" />
											) : (
												<CasinoIcon />
											)
										}
										sx={{
											flexGrow: 1,
											py: 1.2,
											width: '100%',
											boxShadow: "0 4px 20px rgba(255, 215, 0, 0.4)",
											fontWeight: 600,
											fontSize: "1rem",
											"&.Mui-disabled": {
												color: "rgba(0, 0, 0, 0.66)",
											},
										}}
										className="game-btn"
									>
										{isRolling ? "Rolling..." : "Roll Dice"}
									</Button>
								</span>
							</Tooltip>
						)}

						<Button
							variant="outlined"
							color="error"
							onClick={leaveRoom}
							startIcon={<ExitIcon />}
							sx={{
								flexGrow: 0,
								borderWidth: 2,
								"&:hover": {
									borderWidth: 2,
								},
							}}
							className="game-btn"
						>
							Leave
						</Button>
					</Box>

					{rollingTooLong && (
						<Tooltip title="Use this if the game appears to be stuck in the 'Rolling' state">
							<Button
								variant="outlined"
								color="warning"
								onClick={handleForceReset}
								startIcon={<WarningIcon />}
								sx={{
									mt: 1,
									borderWidth: 2,
									"&:hover": {
										borderWidth: 2,
									},
								}}
							>
								Force Reset Game
							</Button>
						</Tooltip>
					)}
				</Box>
			</Box>
		</>
	);
};

export default GameControls;
