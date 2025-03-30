import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import DiceRoller from "./DiceRoller";
import { useGame, SymbolType, SYMBOLS } from "../context/GameContext";

interface DiceProps {
	count?: number;
}

const Dice: React.FC<DiceProps> = ({ count = 6 }) => {
	const { gameState, diceResults } = useGame();
	const [autoRoll, setAutoRoll] = useState(false);
	const [displaySymbols, setDisplaySymbols] = useState<SymbolType[]>([]);

	// Count occurrences of each symbol in diceResults
	const getSymbolCounts = (results: SymbolType[]) => {
		const counts: Record<string, number> = {};
		SYMBOLS.forEach((symbol) => {
			counts[symbol] = 0;
		});

		results.forEach((symbol) => {
			counts[symbol] = (counts[symbol] || 0) + 1;
		});

		return counts;
	};

	// Handle the dice rolling state and prepare symbols for display
	useEffect(() => {
		if (gameState === "rolling") {
			// When rolling starts, generate random placeholders
			setAutoRoll(true);

			// Create temporary dice with random symbols while waiting for results
			const tempSymbols = Array(count)
				.fill(null)
				.map(() => {
					const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
					return SYMBOLS[randomIndex];
				});
			setDisplaySymbols(tempSymbols);
		} else {
			// When not rolling, ensure auto-roll is disabled
			setAutoRoll(false);

			// If we have actual dice results, use them
			if (diceResults && diceResults.length > 0) {
				// Simply use the exact dice results from the server - don't modify them
				// This ensures we display the exact same dice that were rolled
				setDisplaySymbols([...diceResults]);
			}
		}
	}, [gameState, diceResults, count]);

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
				Game Results
			</Typography>

			<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
				<Grid container spacing={1} justifyContent="center">
					{displaySymbols.map((symbol, index) => (
						<Grid item key={index} xs={4} sm={4} md={4}>
							<Box
								sx={{
									transform: "scale(0.50)",
									transformOrigin: "center center",
									mb: 1,
									mt: 1,
									display: "flex",
									justifyContent: "center",
								}}
							>
								<DiceRoller
									autoRoll={autoRoll}
									finalSymbol={symbol}
									onRollComplete={() => {
										// Optional callback when roll is complete
									}}
								/>
							</Box>
						</Grid>
					))}
				</Grid>
			</Box>
		</>
	);
};

export default Dice;
