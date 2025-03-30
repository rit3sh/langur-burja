import React from "react";
import { Box, Container, Grid, Paper, Typography, Alert } from "@mui/material";
import { useGame } from "../context/GameContext";
import Dice from "./Dice";
import PlayerList from "./PlayerList";
import GameControls from "./GameControls";
import GameResults from "./GameResults";

const Game: React.FC = () => {
	const { gameState, diceResults, error } = useGame();

	const isRolling = gameState === "rolling";
	const showDice = isRolling || (diceResults && diceResults.length > 0);

	return (
		<Box
			sx={{
				minHeight: "100vh",
				background:
					"radial-gradient(circle at center, rgba(31, 41, 55, 0.7) 0%, rgba(17, 24, 39, 0.9) 100%)",
				pt: 4,
				pb: 6,
				position: "relative",
				overflow: "hidden",
				"&::before": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					backgroundImage:
						"repeating-linear-gradient(45deg, rgba(255, 215, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 215, 0, 0.05) 75%, rgba(255, 215, 0, 0.05)), repeating-linear-gradient(45deg, rgba(255, 215, 0, 0.05) 25%, transparent 25%, transparent 75%, rgba(255, 215, 0, 0.05) 75%, rgba(255, 215, 0, 0.05))",
					backgroundSize: "60px 60px",
					backgroundPosition: "0 0, 30px 30px",
					opacity: 0.3,
					zIndex: -1,
				},
				"&::after": {
					content: '""',
					position: "absolute",
					top: 0,
					left: 0,
					right: 0,
					bottom: 0,
					background:
						"linear-gradient(120deg, rgba(255, 215, 0, 0.1) 0%, transparent 30%), radial-gradient(circle at 70% 20%, rgba(255, 0, 0, 0.08) 0%, transparent 50%), radial-gradient(circle at 30% 80%, rgba(0, 0, 255, 0.08) 0%, transparent 50%)",
					zIndex: -2,
				},
			}}
		>
			<Container maxWidth="lg">
				<Typography
					variant="h3"
					component="h1"
					align="center"
					gutterBottom
					sx={{
						fontWeight: "bold",
						color: "gold",
						textShadow:
							"0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)",
						mb: 4,
						fontFamily: '"Poppins", sans-serif',
					}}
				>
					Langur Burja
				</Typography>

				{error && (
					<Alert
						severity="error"
						sx={{
							mb: 3,
							borderRadius: 2,
							boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
						}}
					>
						{error}
					</Alert>
				)}

				<Grid container spacing={4}>
					<Grid item xs={4} md={4}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<Paper
								elevation={8}
								sx={{
									p: 3,
									borderRadius: 4,
									background: "rgba(23, 33, 43, 0.8)",
									backdropFilter: "blur(8px)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									boxShadow:
										"0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
								}}
							>
								<GameControls />
							</Paper>

              {showDice && (
								<Paper
									elevation={8}
									sx={{
										p: 3,
									borderRadius: 4,
									background: "rgba(23, 33, 43, 0.8)",
									backdropFilter: "blur(8px)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									boxShadow:
										"0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
									}}
								>
									<Dice />
								</Paper>
							)}

							<Paper
								elevation={8}
								sx={{
									p: 3,
									borderRadius: 4,
									background: "rgba(23, 33, 43, 0.8)",
									backdropFilter: "blur(8px)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									boxShadow:
										"0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
								}}
							>
								<PlayerList />
							</Paper>
						</Box>
					</Grid>
					<Grid item xs={8} md={8}>
						<Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
							<Paper
								elevation={8}
								sx={{
									p: 3,
									borderRadius: 4,
									background: "rgba(23, 33, 43, 0.8)",
									backdropFilter: "blur(8px)",
									border: "1px solid rgba(255, 255, 255, 0.1)",
									boxShadow:
										"0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
								}}
							>
								<GameResults />
							</Paper>
							
						</Box>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};

export default Game;
