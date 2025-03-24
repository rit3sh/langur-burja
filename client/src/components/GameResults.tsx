import React from "react";
import { Typography, Box, Grid, Divider, Paper } from "@mui/material";
import { SymbolType, useGame } from "../context/GameContext";
import DiceSymbol from "./DiceSymbol";

interface SymbolCountProps {
	symbol: SymbolType;
	count: number;
}

const SymbolCount: React.FC<SymbolCountProps> = ({ symbol, count }) => {
	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				mr: 2,
				py: 0.5,
				px: 1,
				borderRadius: 1,
				backgroundColor: "rgba(255, 255, 255, 0.05)",
			}}
		>
			<DiceSymbol symbol={symbol} size={30} />
			<Typography variant="body2" sx={{ ml: 1, fontWeight: 500 }}>
				× {count}
			</Typography>
		</Box>
	);
};

const GameResults: React.FC = () => {
	const { diceResults, payouts, playerId } = useGame();

	// Count occurrences of each symbol
	const symbolCounts: Record<SymbolType, number> = {} as Record<
		SymbolType,
		number
	>;
	diceResults.forEach((symbol) => {
		symbolCounts[symbol] = (symbolCounts[symbol] || 0) + 1;
	});

	// Calculate player's winnings if available
	let totalWinnings = 0;
	if (payouts && playerId && payouts[playerId]) {
		Object.values(payouts[playerId]).forEach((amount) => {
			totalWinnings += amount;
		});
	}

	const hasResults = diceResults.length > 0;

	if (!hasResults) {
		return null;
	}

	return (
		<>
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
					Roll Results
				</Typography>

				<Box
					sx={{
						mb: 3,
						p: 2,
						borderRadius: 2,
						background: "rgba(0, 0, 0, 0.2)",
						backdropFilter: "blur(5px)",
						border: "1px solid rgba(255, 255, 255, 0.05)",
					}}
				>
					<Typography
						variant="subtitle1"
						sx={{
							mb: 2,
							fontWeight: 500,
							display: "flex",
							alignItems: "center",
							"&::before": {
								content: '""',
								width: 4,
								height: 16,
								backgroundColor: "primary.main",
								display: "inline-block",
								marginRight: 1,
								borderRadius: 1,
							},
						}}
					>
						Symbol Counts
					</Typography>
					<Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
						{Object.entries(symbolCounts)
							.sort(([, countA], [, countB]) => countB - countA)
							.map(([symbol, count]) => (
								<SymbolCount
									key={symbol}
									symbol={symbol as SymbolType}
									count={count}
								/>
							))}
					</Box>
				</Box>

				{playerId && payouts && payouts[playerId] && (
					<Box
						sx={{
							p: 2,
							borderRadius: 2,
							background: "rgba(0, 0, 0, 0.2)",
							backdropFilter: "blur(5px)",
							border: "1px solid rgba(255, 255, 255, 0.05)",
						}}
					>
						<Typography
							variant="subtitle1"
							sx={{
								mb: 2,
								fontWeight: 500,
								display: "flex",
								alignItems: "center",
								"&::before": {
									content: '""',
									width: 4,
									height: 16,
									backgroundColor:
										totalWinnings > 0
											? "#4CAF50"
											: totalWinnings < 0
											? "#FF3D00"
											: "primary.main",
									display: "inline-block",
									marginRight: 1,
									borderRadius: 1,
								},
							}}
						>
							Your Results
						</Typography>
						<Grid container spacing={2} sx={{ mb: 2 }}>
							{Object.entries(payouts[playerId])
								.filter(([, amount]) => amount !== 0)
								.map(([symbol, amount]) => (
									<Grid item key={symbol} xs={6} sm={4}>
										<Box
											sx={{
												display: "flex",
												alignItems: "center",
												py: 0.5,
												px: 1,
												borderRadius: 1,
												backgroundColor:
													amount > 0
														? "rgba(76, 175, 80, 0.1)"
														: "rgba(244, 67, 54, 0.1)",
												border:
													amount > 0
														? "1px solid rgba(76, 175, 80, 0.2)"
														: "1px solid rgba(244, 67, 54, 0.2)",
											}}
										>
											<DiceSymbol symbol={symbol as SymbolType} size={24} />
											<Typography
												variant="body2"
												sx={{
													ml: 1,
													fontWeight: 600,
													color: amount > 0 ? "#4CAF50" : "#FF3D00",
												}}
											>
												{amount > 0 ? `+$${amount}` : `-$${Math.abs(amount)}`}
											</Typography>
										</Box>
									</Grid>
								))}
						</Grid>

						<Divider
							sx={{ my: 2, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
						/>

						<Box
							sx={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "center",
								py: 1,
							}}
						>
							<Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
								Total Result:
							</Typography>
							<Typography
								variant="h6"
								sx={{
									fontWeight: "bold",
									color:
										totalWinnings > 0
											? "#4CAF50"
											: totalWinnings < 0
											? "#FF3D00"
											: "text.primary",
								}}
							>
								{totalWinnings > 0
									? `+$${totalWinnings}`
									: totalWinnings < 0
									? `-$${Math.abs(totalWinnings)}`
									: `$0`}
							</Typography>
						</Box>
					</Box>
				)}
			</Paper>
		</>
	);
};

export default GameResults;
