import React from "react";
import { Typography, Box, Grid, Paper } from "@mui/material";
import { SymbolType, useGame, SYMBOLS } from "../context/GameContext";
import DiceSymbol from "./DiceSymbol";

// Define symbol names in Nepali
const getSymbolName = (symbol: SymbolType): string => {
	switch (symbol) {
		case 'Spade':
			return 'Hukum';
		case 'Heart':
			return 'Paan';
		case 'Diamond':
			return 'Itta';
		case 'Club':
			return 'Chidi';
		case 'Flag':
			return 'Jhanda';
		case 'Crown':
			return 'Burja';
		default:
			return symbol;
	}
};

// Define background colors for each symbol
const getSymbolBgColor = (symbol: SymbolType): string => {
	switch (symbol) {
		case 'Spade':
			return '#4CAF50'; // Green
		case 'Heart':
			return '#90CAF9'; // Light Blue
		case 'Diamond':
			return '#FDD835'; // Yellow
		case 'Club':
			return '#4CAF50'; // Green
		case 'Flag':
			return '#FF8A65'; // Pink/Orange
		case 'Crown':
			return '#4CAF50'; // Green
		default:
			return '#757575';
	}
};

// Define symbol colors
const getSymbolColor = (symbol: SymbolType): string => {
	switch (symbol) {
		case 'Heart':
			return '#c62828'; // Deep Red
		case 'Diamond':
			return '#ef6c00'; // Deep Orange
		case 'Club':
			return '#2e7d32'; // Deep Green
		case 'Spade':
			return '#1565c0'; // Deep Blue
		case 'Flag':
			return '#6a1b9a'; // Deep Purple
		case 'Crown':
			return '#ff8f00'; // Deep Gold
		default:
			return '#000000';
	}
};

interface SymbolCountProps {
	symbol: SymbolType;
	count: number;
}

const SymbolCount: React.FC<SymbolCountProps> = ({ symbol, count }) => {
	const bgColor = getSymbolBgColor(symbol);
	const symbolColor = getSymbolColor(symbol);
	const nepaliName = getSymbolName(symbol);
	
	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				p: 2,
				backgroundColor: 'rgba(0, 0, 0, 0.2)',
				border: "1px solid rgba(255, 255, 255, 0.1)",
				borderRadius: 2,
				position: "relative",
				backdropFilter: "blur(8px)",
				"&:hover": {
					backgroundColor: 'rgba(255, 255, 255, 0.05)',
				},
			}}
		>
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					height: 60,
					width: 60,
				}}
			>
				<DiceSymbol 
					symbol={symbol} 
					size={60} 
					traditional={false}
					showLabel={false}
				/>
			</Box>
			<Typography
				variant="h6"
				sx={{
					mt: 1,
					fontWeight: "bold",
					color: symbolColor,
					textShadow: '0 2px 4px rgba(0,0,0,0.3)',
				}}
			>
				{count}
			</Typography>
			<Typography
				variant="caption"
				sx={{
					color: 'text.secondary',
					fontWeight: "medium",
					textTransform: "uppercase",
					fontSize: "0.7rem",
				}}
			>
				{nepaliName}
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
	
	// Initialize all symbols with 0 count
	SYMBOLS.forEach(symbol => {
		symbolCounts[symbol] = 0;
	});
	
	// Update counts from actual results
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

	return (
		<Paper
			elevation={8}
			sx={{
				p: 3,
				borderRadius: 4,
				background: "rgba(23, 33, 43, 0.8)",
				backdropFilter: "blur(8px)",
				border: "1px solid rgba(255, 255, 255, 0.1)",
				boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
			}}
		>
			<Typography
				variant="h5"
				gutterBottom
				sx={{
					color: 'primary.main',
					fontWeight: 600,
					textShadow: '0 2px 4px rgba(0,0,0,0.3)',
					mb: 3,
					position: 'relative',
					display: 'inline-block',
					'&::after': {
						content: '""',
						position: 'absolute',
						left: 0,
						bottom: -8,
						width: '60%',
						height: 3,
						background: 'linear-gradient(90deg, #FFD700, transparent)',
						borderRadius: 3,
					}
				}}
			>
				Roll Results
			</Typography>

			<Grid container spacing={2}>
				{SYMBOLS.map((symbol) => (
					<Grid item xs={6} sm={4} key={symbol}>
						<SymbolCount
							symbol={symbol}
							count={symbolCounts[symbol]}
						/>
					</Grid>
				))}
			</Grid>

			<Box
				sx={{
					mt: 3,
					p: 2,
					backgroundColor: totalWinnings > 0 
						? 'rgba(76, 175, 80, 0.2)' 
						: totalWinnings < 0 
						? 'rgba(244, 67, 54, 0.2)' 
						: 'rgba(117, 117, 117, 0.2)',
					borderRadius: 2,
					border: '1px solid rgba(255, 255, 255, 0.1)',
					backdropFilter: 'blur(8px)',
				}}
			>
				<Typography
					variant="subtitle1"
					sx={{
						fontWeight: "bold",
						color: totalWinnings > 0 
							? '#4CAF50' 
							: totalWinnings < 0 
							? '#f44336' 
							: '#757575',
						textAlign: "center",
						textShadow: '0 1px 2px rgba(0,0,0,0.3)',
					}}
				>
					Total Winnings: {totalWinnings > 0 ? "+" : ""}{totalWinnings}
				</Typography>
			</Box>
		</Paper>
	);
};

export default GameResults;
