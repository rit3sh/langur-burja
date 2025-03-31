// components/DiceRoller.jsx
"use client"; // Add this directive if using Next.js App Router

import React, { useState, useEffect, useCallback, useRef } from "react";
import styles from "./Dice.module.css"; // Import the CSS Module

// Map for converting symbol names to face numbers
const symbolToFace = {
	Spade: 1, // Front - surot.png
	Club: 2, // Top - chidi.png
	Heart: 3, // Right - paan.png	
	Crown: 4, // Left - burja.png
	Diamond: 5, // Bottom - itta.png
	Flag: 6, // Back - jhanda.png
};

const DiceRoller = ({ autoRoll = false, onRollComplete, finalSymbol }) => {
	// State to track the currently showing face (1-6)
	const [currentFace, setCurrentFace] = useState(1);
	// State to track if the dice is currently rolling
	const [isRolling, setIsRolling] = useState(false);
	// Unique animation duration for this dice instance
	const [animationDuration, setAnimationDuration] = useState(0);
	// Unique animation class for this dice instance
	const [animationClass, setAnimationClass] = useState("");
	// Ref to prevent multiple callbacks for the same roll
	const callbackFiredRef = useRef(false);
	// Ref to track the latest roll ID to avoid stale callbacks
	const rollIdRef = useRef(0);

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
				100% { transform: rotateX(${720 + Math.random() * 360}deg) rotateY(${
			720 + Math.random() * 360
		}deg) rotateZ(${Math.random() * 360}deg); }
			}
		`;
		styleSheet.insertRule(keyframes, styleSheet.cssRules.length);
	}, []);

	// Calculate the CSS transform based on the face number
	const calculateTransform = (face) => {
		switch (face) {
			case 1: // Front - Spade (surot)
				return "rotateX(0deg) rotateY(0deg)";
			case 2: // Top - Club (chidi)
				return "rotateX(-90deg) rotateY(0deg)";
			case 3: // Right - Crown (burja)
				return "rotateX(0deg) rotateY(90deg)";
			case 4: // Left - Heart (paan)
				return "rotateX(0deg) rotateY(-90deg)";
			case 5: // Bottom - Diamond (itta)
				return "rotateX(90deg) rotateY(0deg)";
			case 6: // Back - Flag (jhanda)
				return "rotateX(180deg) rotateY(0deg)";
			default:
				return "rotateX(0deg) rotateY(0deg)";
		}
	};

	// Function to handle the dice roll
	const handleRoll = useCallback(() => {
		if (isRolling) return; // Don't roll if already rolling

		setIsRolling(true);
		callbackFiredRef.current = false; // Reset the callback fired state
		const currentRollId = ++rollIdRef.current; // Increment roll ID to track this specific roll

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
			// Only process if this callback is for the most recent roll
			if (currentRollId === rollIdRef.current) {
				setCurrentFace(finalFace); // Set the final face
				setIsRolling(false); // Stop rolling state

				// Ensure callback is only called once per roll
				if (onRollComplete && !callbackFiredRef.current) {
					callbackFiredRef.current = true;
					// Convert back to symbol for callback
					const faceToSymbol = Object.entries(symbolToFace).reduce(
						(acc, [symbol, face]) => {
							acc[face] = symbol;
							return acc;
						},
						{}
					);
					onRollComplete(faceToSymbol[finalFace] || "Spade");
				}
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

	// Reset callback fired ref when dice stops rolling
	useEffect(() => {
		if (!isRolling) {
			// Set a small delay to ensure any pending callbacks have fired
			const timer = setTimeout(() => {
				callbackFiredRef.current = false;
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isRolling]);

	// Style object for the dice element's transform
	// Apply only when *not* rolling, otherwise animation controls transform
	const diceStyle = !isRolling
		? { transform: calculateTransform(currentFace) }
		: {};

	// Add custom animation style when rolling
	const rollingStyle =
		isRolling && animationClass
			? {
					animation: `${animationClass} ${animationDuration}ms linear`,
			  }
			: {};

	const faceStyle = {
		backgroundColor: "#ffffff",
		border: "2px solid #cccccc",
		boxShadow: "inset 0 0 10px rgba(0, 0, 0, 0.1)",
	};

	return (
		<div>
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
