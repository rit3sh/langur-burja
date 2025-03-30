// components/DiceRoller.jsx
"use client"; // Add this directive if using Next.js App Router

import React, { useState, useEffect, useCallback } from "react";
import styles from "./Dice.module.css"; // Import the CSS Module

// Map for converting symbol names to face numbers
const symbolToFace = {
	'Club': 2,   // Top face
	'Crown': 6,  // Back face 
	'Spade': 1,  // Front face
	'Diamond': 5, // Bottom face
	'Flag': 3,   // Right face
	'Heart': 4    // Left face
};

const DiceRoller = ({ autoRoll = false, onRollComplete, finalSymbol }) => {
	// State to track the currently showing face (1-6)
	const [currentFace, setCurrentFace] = useState(1);
	// State to track if the dice is currently rolling
	const [isRolling, setIsRolling] = useState(false);
	// Unique animation duration for this dice instance
	const [animationDuration, setAnimationDuration] = useState(0);
	// Unique animation class for this dice instance
	const [animationClass, setAnimationClass] = useState('');

	// On mount, set a random animation duration for this specific die
	useEffect(() => {
		// Generate a random duration between 3-5 seconds
		const randomDuration = 3000 + Math.floor(Math.random() * 2000);
		setAnimationDuration(randomDuration);
		
		// Create a unique animation class for this die
		const uniqueId = Math.floor(Math.random() * 10000);
		const newAnimationClass = `diceRolling_${uniqueId}`;
		setAnimationClass(newAnimationClass);
		
		// Dynamically create the keyframes for this animation with a random speed
		const styleSheet = document.styleSheets[0];
		const keyframes = `
			@keyframes ${newAnimationClass} {
				0% { transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg); }
				100% { transform: rotateX(${720 + Math.random() * 360}deg) rotateY(${720 + Math.random() * 360}deg) rotateZ(${Math.random() * 360}deg); }
			}
		`;
		styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
	}, []);

	// Calculate the CSS transform based on the face number
	const calculateTransform = (face) => {
		switch (face) {
			case 1:
				return "rotateX(0deg) rotateY(0deg)"; // Front - Spade
			case 6:
				return "rotateX(180deg) rotateY(0deg)"; // Back - Crown
			case 2:
				return "rotateX(-90deg) rotateY(0deg)"; // Top - Club
			case 5:
				return "rotateX(90deg) rotateY(0deg)"; // Bottom - Diamond
			case 3:
				return "rotateX(0deg) rotateY(90deg)"; // Right - Flag
			case 4:
				return "rotateX(0deg) rotateY(-90deg)"; // Left - Heart
			default:
				return "rotateX(0deg) rotateY(0deg)";
		}
	};

	// Function to handle the dice roll
	const handleRoll = useCallback(() => {
		if (isRolling) return; // Don't roll if already rolling

		setIsRolling(true);
		
		// Determine the final face
		let finalFace;
		if (finalSymbol && symbolToFace[finalSymbol]) {
			// Use the provided symbol to determine the final face
			finalFace = symbolToFace[finalSymbol];
		} else {
			// Generate a random face (1-6) if no finalSymbol specified
			finalFace = Math.floor(Math.random() * 6) + 1;
		}

		// Wait for the animation to finish with our custom duration
		setTimeout(() => {
			setCurrentFace(finalFace); // Set the final face
			setIsRolling(false); // Stop rolling state
			if (onRollComplete) {
				// Convert back to symbol for callback
				const faceToSymbol = Object.entries(symbolToFace)
					.reduce((acc, [symbol, face]) => {
						acc[face] = symbol;
						return acc;
					}, {});
				onRollComplete(faceToSymbol[finalFace] || 'Spade');
			}
		}, animationDuration);
	}, [isRolling, onRollComplete, finalSymbol, animationDuration]);

	// Trigger automatic rolling when autoRoll prop changes to true
	useEffect(() => {
		if (autoRoll && !isRolling) {
			handleRoll();
		}
	}, [autoRoll, handleRoll, isRolling]);

	// Update current face when finalSymbol changes (for direct control)
	useEffect(() => {
		if (!isRolling && finalSymbol && symbolToFace[finalSymbol]) {
			setCurrentFace(symbolToFace[finalSymbol]);
		}
	}, [finalSymbol, isRolling]);

	// Style object for the dice element's transform
	// Apply only when *not* rolling, otherwise animation controls transform
	const diceStyle = !isRolling
		? { transform: calculateTransform(currentFace) }
		: {};

	// Add custom animation style when rolling
	const rollingStyle = isRolling && animationClass ? {
		animation: `${animationClass} ${animationDuration}ms linear`
	} : {};

	// Custom styling to make dice faces visible
	const containerStyle = {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		height: "100%",
		perspective: "1000px",
		perspectiveOrigin: "center center",
	};

	const faceStyle = {
		backgroundColor: "#ffffff",
		border: "2px solid #cccccc",
		boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)"
	};

	return (
		<div style={containerStyle}>
			{/* Apply custom animation style instead of class */}
			<div
				className={`${styles.dice}`}
				style={{ ...diceStyle, ...rollingStyle }}
				aria-label={`Dice showing face ${currentFace}${
					isRolling ? " rolling" : ""
				}`} // Accessibility
			>
				{/* Apply face and specific face classes with additional inline styles */}
				<div className={`${styles.face} ${styles.front}`} style={faceStyle}></div>
				<div className={`${styles.face} ${styles.back}`} style={faceStyle}></div>
				<div className={`${styles.face} ${styles.top}`} style={faceStyle}></div>
				<div className={`${styles.face} ${styles.bottom}`} style={faceStyle}></div>
				<div className={`${styles.face} ${styles.right}`} style={faceStyle}></div>
				<div className={`${styles.face} ${styles.left}`} style={faceStyle}></div>
			</div>
		</div>
	);
};

export default DiceRoller;
