import React, { useState } from "react";
import {
	Typography,
	Box,
	Grid,
	Paper,
	TextField,
	Button,
	InputAdornment,
	Badge,
} from "@mui/material";
import { AttachMoney as MoneyIcon } from "@mui/icons-material";
import {
	SymbolType,
	useGame,
	SYMBOLS,
	NEPALI_SYMBOLS,
} from "../context/GameContext";
import DiceSymbol from "./DiceSymbol";

// Define background colors for each symbol
const getSymbolBgColor = (symbol: SymbolType): string => {
	switch (symbol) {
		case "Spade":
			return "#4CAF50"; // Green
		case "Heart":
			return "#90CAF9"; // Light Blue
		case "Diamond":
			return "#FDD835"; // Yellow
		case "Club":
			return "#4CAF50"; // Green
		case "Flag":
			return "#FF8A65"; // Pink/Orange
		case "Crown":
			return "#4CAF50"; // Green
		default:
			return "#757575";
	}
};

// Define symbol colors
const getSymbolColor = (symbol: SymbolType): string => {
	switch (symbol) {
		case "Heart":
			return "#c62828"; // Deep Red
		case "Diamond":
			return "#ef6c00"; // Deep Orange
		case "Club":
			return "#2e7d32"; // Deep Green
		case "Spade":
			return "#1565c0"; // Deep Blue
		case "Flag":
			return "#6a1b9a"; // Deep Purple
		case "Crown":
			return "#ff8f00"; // Deep Gold
		default:
			return "#000000";
	}
};

interface SymbolCountProps {
	symbol: SymbolType;
	count: number;
	currentBetAmount: string;
}

const SymbolCount: React.FC<SymbolCountProps> = ({
	symbol,
	count,
	currentBetAmount,
}) => {
	const {
		placeBet,
		decreaseBet,
		gameState,
		players,
		playerId,
		bets,
		diceResults,
	} = useGame();
	const playerBalance =
		playerId && players[playerId] ? players[playerId].balance : 0;
	const playerBets = playerId && bets[playerId] ? bets[playerId] : {};
	const isBettingDisabled = gameState !== "betting";
	const hasRolled = diceResults && diceResults.length > 0;
	const hasBet = playerBets[symbol] && playerBets[symbol] > 0;

	const handlePlaceBet = () => {
		if (!currentBetAmount) return;

		const amount = parseInt(currentBetAmount, 10);
		if (isNaN(amount) || amount <= 0 || amount > playerBalance) return;

		placeBet(symbol, amount);
	};

	const handleDecreaseBet = (e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent the box click event from firing

		if (isBettingDisabled || !hasBet) return;

		// Get decrease amount from current bet amount input
		let decreaseAmount = 10; // Default
		if (currentBetAmount && /^\d+$/.test(currentBetAmount)) {
			decreaseAmount = parseInt(currentBetAmount, 10);
			if (isNaN(decreaseAmount) || decreaseAmount <= 0) {
				decreaseAmount = 10;
			}
		}

		decreaseBet(symbol, decreaseAmount);
	};

	const bgColor = getSymbolBgColor(symbol);
	const symbolColor = getSymbolColor(symbol);
	const nepaliName = NEPALI_SYMBOLS[symbol];

	return (
		<Box
			onClick={handlePlaceBet}
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				p: 2,
				backgroundColor: "rgb(254, 247, 255)",
				borderRadius: 2,
				position: "relative",
				backdropFilter: "blur(8px)",
				cursor: isBettingDisabled ? "default" : "pointer",
				transition: "all 0.2s ease",
				"&:hover": {
					backgroundColor: "rgb(254, 247, 255)",
					transform: isBettingDisabled ? "none" : "translateY(-5px)",
					boxShadow:
						"0 0 10px rgba(255, 215, 0, 0.7), 0 0 20px rgba(255, 215, 0, 0.5)",
				},
			}}
		>
			<DiceSymbol
				symbol={symbol}
				size={185}
				traditional={false}
				showLabel={false}
			/>

			<Badge
				badgeContent={count}
				color="primary"
				anchorOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
			>
				{count}
			</Badge>

			<Typography
				variant="caption"
				sx={{
					color: "black",
					fontWeight: "bold",
					textTransform: "uppercase",
					fontSize: "1rem",
					mt: hasRolled && count > 0 ? 0 : 1,
				}}
			>
				{nepaliName}
			</Typography>
			{hasBet ? (
				<Box
					onClick={handleDecreaseBet}
					sx={{
						position: "absolute",
						top: -8,
						right: -8,
						fontSize: "1rem",
						backgroundColor: "rgba(76, 175, 79, 0.87)",
						color: "white",
						border: "1px solid rgba(76, 175, 80, 0.5)",
						fontWeight: "bold",
						borderRadius: "10px",
						px: 1,
						py: 0.25,
						minWidth: "24px",
						textAlign: "center",
						cursor: isBettingDisabled ? "default" : "pointer",
						transition: "all 0.2s ease",
						"&:hover": {
							backgroundColor: isBettingDisabled
								? "rgba(76, 175, 80, 0.2)"
								: "rgba(76, 175, 80, 0.3)",
							transform: isBettingDisabled ? "none" : "scale(1.1)",
						},
					}}
				>
					${playerBets[symbol]}
				</Box>
			) : null}
		</Box>
	);
};

const GameResults: React.FC = () => {
	const { diceResults, payouts, playerId, players, gameState } = useGame();
	const [betAmount, setBetAmount] = useState<string>("10");
	const [globalBetAmount, setGlobalBetAmount] = useState<string>("10");

	const playerBalance =
		playerId && players[playerId] ? players[playerId].balance : 0;
	const isBettingDisabled = gameState !== "betting";

	const handleBetAmountChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		// Only allow positive numbers
		const value = event.target.value;
		if (/^\d*$/.test(value)) {
			setBetAmount(value);
		}
	};

	const handleSetAmount = () => {
		setGlobalBetAmount(betAmount);
	};

	// Count occurrences of each symbol
	const symbolCounts: Record<SymbolType, number> = {} as Record<
		SymbolType,
		number
	>;

	// Initialize all symbols with 0 count
	SYMBOLS.forEach((symbol) => {
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
				boxShadow:
					"0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)",
			}}
		>
			{/* Bet Amount Input */}
			<Box
				sx={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: 2,
					mb: 4,
					px: 4,
				}}
			>
				<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
					<Typography sx={{ color: "#4CAF50", fontWeight: "medium" }}>
						$
					</Typography>
					<TextField
						variant="outlined"
						size="small"
						value={betAmount}
						onChange={handleBetAmountChange}
						disabled={isBettingDisabled}
						sx={{
							width: "120px",
							"& .MuiOutlinedInput-root": {
								backgroundColor: "rgba(0, 0, 0, 0.2)",
								borderRadius: 1,
								"& fieldset": {
									borderColor: "rgba(255, 255, 255, 0.1)",
								},
								"&:hover fieldset": {
									borderColor: "rgba(255, 215, 0, 0.5)",
								},
								"& input": {
									color: "#fff",
									textAlign: "center",
									fontWeight: "bold",
									padding: "8px 12px",
								},
							},
						}}
					/>
				</Box>
				<Button
					variant="contained"
					onClick={handleSetAmount}
					disabled={isBettingDisabled}
					sx={{
						backgroundColor: "#4CAF50",
						color: "#000",
						"&:hover": {
							backgroundColor: "#45a049",
						},
						"&.Mui-disabled": {
							backgroundColor: "rgba(255, 255, 255, 0.1)",
							color: "#000 !important",
						},
						minWidth: "100px",
						fontWeight: "bold",
					}}
				>
					Set Amount
				</Button>
			</Box>

			{/* Symbols Grid */}
			<Grid container spacing={2}>
				{SYMBOLS.map((symbol) => (
					<Grid item xs={6} sm={4} key={symbol}>
						<SymbolCount
							symbol={symbol}
							count={symbolCounts[symbol]}
							currentBetAmount={globalBetAmount}
						/>
					</Grid>
				))}
			</Grid>

			{/* Winnings Display */}
			{totalWinnings !== 0 && (
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
			)}
		</Paper>
	);
};

export default GameResults;
