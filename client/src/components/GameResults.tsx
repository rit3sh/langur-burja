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

// 1. BET AMOUNT INPUT COMPONENT
interface BetAmountInputProps {
	setBetAmount: (amount: string) => void;
	disabled: boolean;
}

const BetAmountInput: React.FC<BetAmountInputProps> = ({
	setBetAmount,
	disabled,
}) => {
	const [localBetAmount, setLocalBetAmount] = useState<string>("10");
	const { playerId, players } = useGame();
	const playerBalance =
		playerId && players[playerId] ? players[playerId].balance : 0;

	const handleBetAmountChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		// Only allow positive numbers
		const value = event.target.value;
		if (/^\d*$/.test(value)) {
			setLocalBetAmount(value);
		}
	};

	const handleSetAmount = () => {
		setBetAmount(localBetAmount);
	};

	return (
		<Box
			sx={{
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				mb: 4,
			}}
		>
			<Box
				sx={{
					display: "flex",
					gap: 1,
				}}
			>
				<Button
					variant="outlined"
					size="small"
					onClick={() => {
						setLocalBetAmount("20");
						setBetAmount("20");
					}}
					disabled={disabled}
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
						color: "#fff",
						"&:hover": {
							borderColor: "rgba(255, 215, 0, 0.5)",
							backgroundColor: "rgba(255, 215, 0, 0.1)",
						},
						"&.Mui-disabled": {
							borderColor: "rgba(255, 255, 255, 0.1)",
							color: "rgba(255, 255, 255, 0.3)",
						},
					}}
				>
					20
				</Button>
				<Button
					variant="outlined"
					size="small"
					onClick={() => {
						setLocalBetAmount("50");
						setBetAmount("50");
					}}
					disabled={disabled}
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
						color: "#fff",
						"&:hover": {
							borderColor: "rgba(255, 215, 0, 0.5)",
							backgroundColor: "rgba(255, 215, 0, 0.1)",
						},
						"&.Mui-disabled": {
							borderColor: "rgba(255, 255, 255, 0.1)",
							color: "rgba(255, 255, 255, 0.3)",
						},
					}}
				>
					50
				</Button>
				<Button
					variant="outlined"
					size="small"
					onClick={() => {
						setLocalBetAmount("100");
						setBetAmount("100");
					}}
					disabled={disabled}
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
						color: "#fff",
						"&:hover": {
							borderColor: "rgba(255, 215, 0, 0.5)",
							backgroundColor: "rgba(255, 215, 0, 0.1)",
						},
						"&.Mui-disabled": {
							borderColor: "rgba(255, 255, 255, 0.1)",
							color: "rgba(255, 255, 255, 0.3)",
						},
					}}
				>
					100
				</Button>
				<Button
					variant="outlined"
					size="small"
					onClick={() => {
						setLocalBetAmount("200");
						setBetAmount("200");
					}}
					disabled={disabled}
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
						color: "#fff",
						"&:hover": {
							borderColor: "rgba(255, 215, 0, 0.5)",
							backgroundColor: "rgba(255, 215, 0, 0.1)",
						},
						"&.Mui-disabled": {
							borderColor: "rgba(255, 255, 255, 0.1)",
							color: "rgba(255, 255, 255, 0.3)",
						},
					}}
				>
					200
				</Button>
				<Button
					variant="outlined"
					size="small"
					onClick={() => {
						setLocalBetAmount(playerBalance.toString());
						setBetAmount(playerBalance.toString());
					}}
					disabled={disabled}
					sx={{
						borderColor: "rgba(255, 255, 255, 0.1)",
						color: "#fff",
						"&:hover": {
							borderColor: "rgba(255, 215, 0, 0.5)",
							backgroundColor: "rgba(255, 215, 0, 0.1)",
						},
						"&.Mui-disabled": {
							borderColor: "rgba(255, 255, 255, 0.1)",
							color: "rgba(255, 255, 255, 0.3)",
						},
					}}
				>
					Max
				</Button>
			</Box>
			<Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}>
				<Typography sx={{ color: "#4CAF50", fontWeight: "medium" }}>
					$
				</Typography>
				<TextField
					variant="outlined"
					size="small"
					value={localBetAmount}
					onChange={handleBetAmountChange}
					disabled={disabled}
					type="number"
					inputProps={{
						step: 10,
						min: 0,
					}}
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
				<Button
					variant="contained"
					onClick={handleSetAmount}
					disabled={disabled}
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
		</Box>
	);
};

// 2. SYMBOL ITEM COMPONENT (Used by GameBoard)
interface SymbolCountProps {
	symbol: SymbolType;
	count: number;
	currentBetAmount: string;
	disabled: boolean;
}

const SymbolCount: React.FC<SymbolCountProps> = ({
	symbol,
	count,
	currentBetAmount,
	disabled,
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
			onClick={disabled ? undefined : handlePlaceBet}
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				p: 2,
				backgroundColor: "rgb(254, 247, 255)",
				borderRadius: 1,
				position: "relative",
				backdropFilter: "blur(8px)",
				cursor: isBettingDisabled ? "default" : "pointer",
				transition: "all 0.2s ease",
				"&:hover": {
					backgroundColor: "rgb(236, 255, 227)",
					transform: isBettingDisabled ? "none" : "translateY(-5px)",
				},
			}}
		>
			<DiceSymbol
				symbol={symbol}
				size={185}
				traditional={false}
				showLabel={true}
				disabled={disabled}
			/>

			{hasRolled ? (
				<Badge
					badgeContent={"x" + count}
					showZero
					color={count > 0 ? "success" : "secondary"}
					sx={{
						mt: 2,
						mb: 2,
					}}
				/>
			) : null}

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

// 3. GAME BOARD COMPONENT
interface GameBoardProps {
	symbolCounts: Record<SymbolType, number>;
	currentBetAmount: string;
	disabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({
	symbolCounts,
	currentBetAmount,
	disabled,
}) => {
	return (
		<Grid container spacing={2} sx={{ opacity: disabled ? 0.5 : 1 }}>
			{SYMBOLS.map((symbol) => (
				<Grid item xs={6} sm={4} key={symbol}>
					<SymbolCount
						symbol={symbol}
						count={symbolCounts[symbol]}
						currentBetAmount={currentBetAmount}
						disabled={disabled}
					/>
				</Grid>
			))}
		</Grid>
	);
};

// 4. GAME RESULTS DISPLAY COMPONENT
interface GameResultsDisplayProps {
	totalWinnings: number;
}

const GameResultsDisplay: React.FC<GameResultsDisplayProps> = ({
	totalWinnings,
}) => {

	if (totalWinnings === 0) return null;

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

// Zero Balance Alert Component
const ZeroBalanceAlert: React.FC = () => {
	const { resetBalance, startNewRound } = useGame();
	
	return (
		<Box
			sx={{
				mt: 3,
				p: 3,
				backgroundColor: "rgba(244, 67, 54, 0.15)",
				borderRadius: 2,
				border: "1px solid rgba(244, 67, 54, 0.3)",
				backdropFilter: "blur(8px)",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
			}}
		>
			<Typography
				variant="h6"
				sx={{
					fontWeight: "bold",
					color: "#f44336",
					mb: 2,
					textShadow: "0 1px 2px rgba(0,0,0,0.2)",
				}}
			>
				You've run out of money!
			</Typography>
			
			<Typography
				variant="body1"
				sx={{
					color: "#fff",
					mb: 3,
				}}
			>
				Would you like to start a new game with a fresh balance?
			</Typography>
			
			<Button
				variant="contained"
				color="success"
				onClick={()=>{
					resetBalance();
					startNewRound();
				}}
				sx={{
					py: 1,
					px: 3,
					fontWeight: "bold",
					boxShadow: "0 4px 8px rgba(76, 175, 80, 0.4)",
					"&:hover": {
						backgroundColor: "#2e7d32",
						boxShadow: "0 6px 10px rgba(76, 175, 80, 0.6)",
					},
				}}
			>
				Restart Game
			</Button>
		</Box>
	);
};

// 5. MAIN COMPONENT THAT COMBINES ALL THREE
const GameResults: React.FC = () => {
	const { diceResults, payouts, playerId, players, gameState } = useGame();
	const [globalBetAmount, setGlobalBetAmount] = useState<string>("10");

	const playerBalance =
		playerId && players[playerId] ? players[playerId].balance : 0;
	const isBettingDisabled = gameState !== "betting";
	const hasZeroBalance = playerBalance === 0;

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
		<>
			{/* Bet Amount Input */}
			<BetAmountInput
				setBetAmount={setGlobalBetAmount}
				disabled={isBettingDisabled || hasZeroBalance}
			/>

			{/* Game Board */}
			<GameBoard
				symbolCounts={symbolCounts}
				currentBetAmount={globalBetAmount}
				disabled={isBettingDisabled || hasZeroBalance}
			/>

			{/* Winnings Display */}
			<GameResultsDisplay totalWinnings={totalWinnings} />
			
			{/* Zero Balance Alert */}
			{hasZeroBalance && gameState === "results" && <ZeroBalanceAlert />}
		</>
	);
};

export default GameResults;
