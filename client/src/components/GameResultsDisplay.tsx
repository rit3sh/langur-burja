import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";

interface GameResultsDisplayProps {
	totalWinnings: number;
	allDiceRollCompleted: boolean;
	gameState: string;
}

const GameResultsDisplay: React.FC<GameResultsDisplayProps> = ({
	totalWinnings,
	allDiceRollCompleted,
	gameState
}) => {
	// Track whether we've actually displayed the results since the last roll
	const [hasDisplayedResults, setHasDisplayedResults] = useState(false);

	// Reset display state when game state changes or dice completion changes
	useEffect(() => {
		if (gameState === "rolling") {
			setHasDisplayedResults(false);
		} else if (gameState === "results" && allDiceRollCompleted && !hasDisplayedResults) {
			setHasDisplayedResults(true);
			// Log for debugging
			console.log("Displaying final winnings:", totalWinnings);
		}
	}, [gameState, allDiceRollCompleted, totalWinnings, hasDisplayedResults]);

	// Don't display anything if:
	// 1. There are no winnings
	// 2. Dice are still rolling (not completed)
	// 3. Game state is not "results"
	if (totalWinnings === 0 || !allDiceRollCompleted || gameState !== "results") return null;

	return (
		<Box
			sx={{
				mt: 3,
				p: 2,
				backgroundColor:
					totalWinnings > 0
						? "rgba(76, 175, 80, 0.2)"
						: totalWinnings < 0
						? "rgba(244, 67, 54, 0.2)"
						: "rgba(117, 117, 117, 0.2)",
				borderRadius: 2,
				border: "1px solid rgba(255, 255, 255, 0.1)",
				backdropFilter: "blur(8px)",
			}}
		>
			<Typography
				variant="subtitle1"
				sx={{
					fontWeight: "bold",
					color:
						totalWinnings > 0
							? "#4CAF50"
							: totalWinnings < 0
							? "#f44336"
							: "#757575",
					textAlign: "center",
					textShadow: "0 1px 2px rgba(0,0,0,0.3)",
				}}
			>
				Total Winnings: {totalWinnings > 0 ? "+" : ""}
				{totalWinnings}
			</Typography>
		</Box>
	);
};

export default GameResultsDisplay; 