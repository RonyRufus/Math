import { OperationType, MathQuestion } from '../types';

/**
 * Generates a random integer between min and max (inclusive)
 */
function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a level from 1 to 8 based on the ELO rating.
 */
export function ratingToLevel(rating: number): number {
  if (rating < 600) return 1;
  if (rating < 950) return 2;
  if (rating < 1250) return 3;
  if (rating < 1500) return 4;
  if (rating < 1800) return 5;
  if (rating < 2100) return 6;
  if (rating < 2400) return 7;
  return 8;
}

/**
 * Generates a dynamic mental math question based on the operation and rating.
 */
export function generateQuestion(operation: OperationType, rating: number): MathQuestion {
  const level = ratingToLevel(rating);
  let num1 = 0;
  let num2 = 0;
  let operandSymbol = '';
  let correctAnswer = 0;

  switch (operation) {
    case 'addition':
      operandSymbol = '+';
      if (level === 1) {
        // Level 1: 1-digit + 1-digit (e.g. 2 + 3 to 9 + 9)
        num1 = randomBetween(2, 9);
        num2 = randomBetween(2, 9);
      } else if (level === 2) {
        // Level 2: 1-digit + 2-digit (e.g. 5 + 17, 34 + 8)
        if (Math.random() > 0.5) {
          num1 = randomBetween(11, 49);
          num2 = randomBetween(2, 9);
        } else {
          num1 = randomBetween(2, 9);
          num2 = randomBetween(11, 49);
        }
      } else if (level === 3) {
        // Level 3: 2-digit + 2-digit (sums under 100, simple carries)
        num1 = randomBetween(11, 59);
        num2 = randomBetween(11, 39);
      } else if (level === 4) {
        // Level 4: 2-digit + 2-digit (complex carries, sums > 100)
        num1 = randomBetween(40, 99);
        num2 = randomBetween(20, 99);
      } else if (level === 5) {
        // Level 5: 3-digit + 2-digit (e.g. 124 + 43)
        num1 = randomBetween(100, 499);
        num2 = randomBetween(11, 99);
      } else if (level === 6) {
        // Level 6: 3-digit + 3-digit (sums with simple carries)
        num1 = randomBetween(100, 399);
        num2 = randomBetween(100, 399);
      } else if (level === 7) {
        // Level 7: 3-digit + 3-digit (complex carries, e.g. 687 + 459)
        num1 = randomBetween(400, 999);
        num2 = randomBetween(100, 999);
      } else {
        // Level 8: 4-digit + 3-digit or 4-digit + 4-digit
        num1 = randomBetween(1000, 4999);
        num2 = randomBetween(100, 4999);
      }
      correctAnswer = num1 + num2;
      break;

    case 'subtraction':
      operandSymbol = '-';
      if (level === 1) {
        // Level 1: 1-digit minus 1-digit (always positive outcome)
        num1 = randomBetween(3, 9);
        num2 = randomBetween(1, num1 - 1);
      } else if (level === 2) {
        // Level 2: 2-digit minus 1-digit (e.g. 15 - 7, 24 - 5)
        num1 = randomBetween(11, 39);
        num2 = randomBetween(2, 9);
      } else if (level === 3) {
        // Level 3: 2-digit minus 2-digit (no borrow, e.g. 47 - 23, 85 - 41)
        num1 = randomBetween(30, 99);
        // Ensure no borrow
        const d1_1 = Math.floor(num1 / 10);
        const d1_0 = num1 % 10;
        const d2_1 = randomBetween(1, d1_1 - 1);
        const d2_0 = randomBetween(0, d1_0);
        num2 = d2_1 * 10 + d2_0;
        if (num2 <= 0) num2 = 10;
      } else if (level === 4) {
        // Level 4: 2-digit minus 2-digit (with borrowings allowed)
        num1 = randomBetween(31, 99);
        num2 = randomBetween(12, num1 - 1);
      } else if (level === 5) {
        // Level 5: 3-digit minus 2-digit (e.g. 142 - 58)
        num1 = randomBetween(110, 499);
        num2 = randomBetween(15, 99);
      } else if (level === 6) {
        // Level 6: 3-digit minus 3-digit (simple, no double boron)
        num1 = randomBetween(300, 899);
        num2 = randomBetween(100, num1 - 100);
      } else if (level === 7) {
        // Level 7: 3-digit minus 3-digit (complex borrowings)
        num1 = randomBetween(400, 999);
        num2 = randomBetween(199, num1 - 1);
      } else {
        // Level 8: 4-digit minus 3/4-digit
        num1 = randomBetween(1000, 4999);
        num2 = randomBetween(100, num1 - 1);
      }
      correctAnswer = num1 - num2;
      break;

    case 'multiplication':
      operandSymbol = '×';
      if (level === 1) {
        // Level 1: Multiplication table of 2 to 5 (e.g. 4 × 3)
        num1 = randomBetween(2, 5);
        num2 = randomBetween(2, 10);
        if (Math.random() > 0.5) {
          const temp = num1;
          num1 = num2;
          num2 = temp;
        }
      } else if (level === 2) {
        // Level 2: Multiplication table of 6 to 10 (up to 10 × 10)
        num1 = randomBetween(5, 10);
        num2 = randomBetween(5, 10);
      } else if (level === 3) {
        // Level 3: Table up to 12 (including 11 × 11, 12 × 8, etc.)
        num1 = randomBetween(2, 12);
        num2 = randomBetween(2, 12);
      } else if (level === 4) {
        // Level 4: 1-digit × small 2-digit (e.g. 14 × 6, 23 × 4)
        num1 = randomBetween(11, 25);
        num2 = randomBetween(3, 9);
        if (Math.random() > 0.5) {
          const temp = num1;
          num1 = num2;
          num2 = temp;
        }
      } else if (level === 5) {
        // Level 5: 1-digit × complex 2-digit (e.g. 78 × 4, 89 × 7)
        num1 = randomBetween(26, 99);
        num2 = randomBetween(4, 9);
        if (Math.random() > 0.5) {
          const temp = num1;
          num1 = num2;
          num2 = temp;
        }
      } else if (level === 6) {
        // Level 6: Squares/Cubes or double digit multiplied by double digit with simple results (up to 20 × 20)
        num1 = randomBetween(11, 20);
        num2 = randomBetween(11, 20);
      } else if (level === 7) {
        // Level 7: Small double digit × double digit (e.g. 15 × 34, 18 × 45)
        num1 = randomBetween(11, 40);
        num2 = randomBetween(11, 40);
      } else {
        // Level 8: Double digit × double digit up to 99 × 99
        num1 = randomBetween(11, 99);
        num2 = randomBetween(11, 99);
      }
      correctAnswer = num1 * num2;
      break;

    case 'division':
      operandSymbol = '÷';
      if (level === 1) {
        // Level 1: Quotient is 2 to 5, Divisor 2 to 10 (e.g. 12 ÷ 3 = 4)
        correctAnswer = randomBetween(2, 5);
        num2 = randomBetween(2, 10);
      } else if (level === 2) {
        // Level 2: Quotient 6 to 10, Divisor 2 to 10 (e.g. 81 ÷ 9 = 9)
        correctAnswer = randomBetween(6, 10);
        num2 = randomBetween(2, 10);
      } else if (level === 3) {
        // Level 3: Quotient 11 to 15, Divisor 2 to 12 (e.g. 144 ÷ 12 = 12)
        correctAnswer = randomBetween(11, 15);
        num2 = randomBetween(2, 12);
      } else if (level === 4) {
        // Level 4: Divisor is single digit, Quotient is 15 to 40 (e.g. 115 ÷ 5 = 23)
        correctAnswer = randomBetween(15, 40);
        num2 = randomBetween(3, 9);
      } else if (level === 5) {
        // Level 5: Divisor is single digit, Quotient is 41 to 100 (e.g. 455 ÷ 7 = 65)
        correctAnswer = randomBetween(41, 100);
        num2 = randomBetween(3, 9);
      } else if (level === 6) {
        // Level 6: Divisor is double digit (11-20), Quotient is 11 to 20 (e.g. 195 ÷ 13 = 15)
        correctAnswer = randomBetween(11, 20);
        num2 = randomBetween(11, 20);
      } else if (level === 7) {
        // Level 7: Divisor is double digit (11-30), Quotient is 11 to 50
        correctAnswer = randomBetween(11, 50);
        num2 = randomBetween(11, 30);
      } else {
        // Level 8: Divisor double digit (11-99), Quotient double digit (11-99)
        correctAnswer = randomBetween(11, 99);
        num2 = randomBetween(11, 99);
      }

      // In division, num1 = correctAnswer * num2, so we always divide cleanly!
      num1 = correctAnswer * num2;
      break;
  }

  return {
    id: `${operation}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    num1,
    num2,
    operation,
    operandSymbol,
    correctAnswer,
    difficultyLevel: level,
    createdAt: Date.now(),
  };
}

/**
 * Calculates ELO rating change based on performance.
 * @param currentRating The current rating for the operation
 * @param isCorrect Whether the user got it right
 * @param timeTakenMs How long (in ms) the user took to answer
 * @param difficultyLevel The level of the question generated
 */
export function calculateRatingChange(
  currentRating: number,
  isCorrect: boolean,
  timeTakenMs: number,
  difficultyLevel: number
): { ratingChange: number; newRating: number; xpGained: number } {
  // Base calculation with simple ELO logic
  // We expect a target speed based on difficulty level
  // Faster answers give slightly larger gains. Incorrect answers drop rating.
  
  const targetSpeedMs = difficultyLevel * 1500 + 1500; // e.g. Level 1 target speed = 3s, Level 5 target speed = 9s
  const speedRatio = Math.max(0.2, Math.min(2.0, targetSpeedMs / timeTakenMs));

  let K = 32; // base scale
  if (currentRating < 1000) K = 48; // Faster acceleration for beginners
  else if (currentRating > 2000) K = 16; // Stable rating for advanced

  let ratingChange = 0;
  let xpGained = 0;

  if (isCorrect) {
    // Correct answer
    // Base rating gain
    const baseWin = 15;
    // Speed bonus multiplier: answers done in half of target time get up to 2x gain
    const speedBonus = speedRatio >= 1.2 ? Math.min(15, Math.floor((speedRatio - 1) * 15)) : 0;
    
    ratingChange = Math.round(baseWin + speedBonus);
    
    // XP is based on difficulty level and speed
    const baseXP = difficultyLevel * 10;
    const speedXPMultiplier = Math.min(2.5, Math.max(0.8, speedRatio));
    xpGained = Math.round(baseXP * speedXPMultiplier);
  } else {
    // Incorrect answer
    // Standard reduction
    const baseLoss = -12;
    // If they lost but answered extremely fast, maybe they just misclicked, we retain normal drop
    // If they struggled a long time and got it wrong, we drop slightly less as they made effort
    const effortDiscount = timeTakenMs > targetSpeedMs ? Math.min(5, Math.floor((timeTakenMs - targetSpeedMs) / 3000)) : 0;
    
    ratingChange = Math.round(baseLoss + effortDiscount);
    xpGained = 2; // consolation XP
  }

  const newRating = Math.max(200, currentRating + ratingChange);

  return {
    ratingChange,
    newRating,
    xpGained,
  };
}
