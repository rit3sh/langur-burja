import React, { useEffect, useState } from "react";
import { Box, Grid, Typography } from "@mui/material";
import DiceRoller from "./DiceRoller";
import { useGame, SymbolType, SYMBOLS } from "../context/GameContext";

interface DiceProps {
	count?: number;
	onAllDiceRollComplete?: () => void;
}

const Dice: React.FC<DiceProps> = ({ count = 6, onAllDiceRollComplete }) => {
	const { gameState, diceResults } = useGame();
	const [autoRoll, setAutoRoll] = useState(false);
	const [displaySymbols, setDisplaySymbols] = useState<SymbolType[]>([]);
	const [completedDice, setCompletedDice] = useState<boolean[]>([]);

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

	// Reset completed dice when starting a new roll or when display symbols change
	useEffect(() => {
		if (gameState === "rolling" || displaySymbols.length === 0) {
			setCompletedDice(Array(count).fill(false));
		} else if (displaySymbols.length !== completedDice.length) {
			// Adjust completedDice array if number of dice changes
			setCompletedDice(Array(displaySymbols.length).fill(false));
		}
	}, [gameState, displaySymbols.length, count]);

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
				console.log("diceResults", diceResults);
				setDisplaySymbols([...diceResults]);
			}
		}
	}, [gameState, diceResults, count]);

	// Handle all dice completing their animation
	useEffect(() => {
		// Check if all dice have completed rolling
		if (completedDice.length > 0 && 
			completedDice.every(isDone => isDone) && 
			gameState === "results") {
			// Make sure to only notify once when all dice are done
			if (onAllDiceRollComplete) {
				onAllDiceRollComplete();
			}
		}
	}, [completedDice, gameState, onAllDiceRollComplete]);

	// Track each individual die completing its animation
	const handleDiceRollComplete = (index: number) => {
		setCompletedDice(prev => {
			const updated = [...prev];
			updated[index] = true;
			return updated;
		});
	};

	return (
		<>
			<Grid container spacing={1} justifyContent="center">
				{displaySymbols.map((symbol, index) => (
					<Grid item key={index} xs={2} sm={2} md={2}>
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
									handleDiceRollComplete(index);
								}}
							/>
						</Box>
					</Grid>
				))}
			</Grid>
		</>
	);
};

export default Dice;
