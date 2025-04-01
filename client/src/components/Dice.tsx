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
	const [displaySymbols, setDisplaySymbols] = useState<SymbolType[]>(() => {
		// Initialize with question marks
		return Array(count).fill(null).map(() => "Question");
	});
	const [completedDice, setCompletedDice] = useState<boolean[]>([]);

	// Force initialization with Question symbol
	useEffect(() => {
		// Set initial display to question marks
		setDisplaySymbols(Array(count).fill(null).map(() => "Question"));
		console.log("Dice component initialized with Question symbols");
	}, [count]);

	// Count occurrences of each symbol in diceResults
	const getSymbolCounts = (results: SymbolType[]) => {
		const counts: Record<string, number> = {};
		SYMBOLS.forEach((symbol) => {
			if (symbol !== "Question") { // Don't count question marks
				counts[symbol] = 0;
			}
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
					const randomIndex = Math.floor(Math.random() * (SYMBOLS.length - 1)); // Exclude Question
					return SYMBOLS[randomIndex];
				});
			setDisplaySymbols(tempSymbols);
		} else if (gameState === "betting") {
			// When a new game starts (betting state), reset to question marks
			setAutoRoll(false);
			setDisplaySymbols(Array(count).fill(null).map(() => "Question"));
		} else {
			// When not rolling, ensure auto-roll is disabled
			setAutoRoll(false);

			// If we have actual dice results, use them
			if (diceResults && diceResults.length > 0) {
				// Simply use the exact dice results from the server - don't modify them
				// This ensures we display the exact same dice that were rolled
				setDisplaySymbols([...diceResults]);
			}
			// Note: If no dice results, we keep the current displaySymbols
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
			<Grid container spacing={1} justifyContent="center" xs={12} sm={12} md={12}>
				{displaySymbols.map((symbol, index) => (
					
						<Box
							sx={{
								transform: "scale(0.50)",
								transformOrigin: "center center",
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
				
				))}
			</Grid>
		</>
	);
};

export default Dice;
