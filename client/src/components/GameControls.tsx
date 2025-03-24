import React from "react";
import { Box, Button, Typography, CircularProgress, Chip } from "@mui/material";
import {
	Casino as CasinoIcon,
	ContentCopy,
	ExitToApp as ExitIcon,
} from "@mui/icons-material";
import { useGame } from "../context/GameContext";

const GameControls: React.FC = () => {
	const { gameState, rollDice, leaveRoom, roomId } = useGame();

	const isRolling = gameState === "rolling";
	const isBetting = gameState === "betting";
	const isResults = gameState === "results";

	const getStatusColor = () => {
		if (isRolling) return "#FF9800";
		if (isBetting) return "#2196F3";
		return "#4CAF50";
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
								background: "rgba(255, 215, 0, 0.15)",
								borderRadius: "4px",
								color: "#FFD700",
								border: "1px solid rgba(255, 215, 0, 0.3)",
								"& .MuiChip-label": {
									px: 1,
								},
							}}
						/>
					</Box>
				</Box>

				{/* Action buttons */}
				<Box sx={{ display: "flex", gap: 2 }}>
					<Button
						variant="contained"
						color="primary"
						onClick={rollDice}
						disabled={!isBetting}
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
							boxShadow: "0 4px 20px rgba(255, 215, 0, 0.4)",
							fontWeight: 600,
							fontSize: "1rem",
						}}
						className="game-btn"
					>
						{isRolling ? "Rolling..." : "Roll Dice"}
					</Button>

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
			</Box>
		</>
	);
};

export default GameControls;
