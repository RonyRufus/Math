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
  let formula: string | undefined = undefined;

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

    case 'squares':
      operandSymbol = '²';
      if (level === 1) {
        // Level 1: 1 to 10
        num1 = randomBetween(2, 10);
      } else if (level === 2) {
        // Level 2: 11 to 15
        num1 = randomBetween(11, 15);
      } else if (level === 3) {
        // Level 3: 16 to 20
        num1 = randomBetween(16, 20);
      } else if (level === 4) {
        // Level 4: multiples of 10 and 5
        const base = randomBetween(5, 19) * 5; // 25 to 95
        num1 = base;
      } else if (level === 5) {
        // Level 5: close to 10s (ends in 1 or 9, 21 to 99)
        const tens = randomBetween(2, 9) * 10;
        num1 = tens + (Math.random() > 0.5 ? 1 : -1);
      } else if (level === 6) {
        // Level 6: 21 to 30 (excluding 25/30)
        const candidates = [21, 22, 23, 24, 26, 27, 28, 29];
        num1 = candidates[Math.floor(Math.random() * candidates.length)];
      } else if (level === 7) {
        // Level 7: 31 to 50 (non-multiples of 5 or 10)
        let val;
        do {
          val = randomBetween(31, 50);
        } while (val % 5 === 0 || val % 10 === 0);
        num1 = val;
      } else {
        // Level 8: 51 to 100
        let val;
        do {
          val = randomBetween(51, 100);
        } while (val % 5 === 0 || val % 10 === 0 || val % 10 === 1 || val % 10 === 9);
        num1 = val;
      }
      correctAnswer = num1 * num1;
      num2 = 2; // Exponent representation
      break;

    case 'roots':
      operandSymbol = '√';
      if (level === 1) {
        // Level 1: result is 2 to 10
        correctAnswer = randomBetween(2, 10);
      } else if (level === 2) {
        // Level 2: result is 11 to 15
        correctAnswer = randomBetween(11, 15);
      } else if (level === 3) {
        // Level 3: result is 16 to 20
        correctAnswer = randomBetween(16, 20);
      } else if (level === 4) {
        // Level 4: result is multiples of 10 (20 to 90)
        correctAnswer = randomBetween(2, 9) * 10;
      } else if (level === 5) {
        // Level 5: result ends in 5 (15 to 95)
        correctAnswer = randomBetween(1, 9) * 10 + 5;
      } else if (level === 6) {
        // Level 6: result 21 to 30
        correctAnswer = randomBetween(21, 30);
      } else if (level === 7) {
        // Level 7: result 31 to 50
        correctAnswer = randomBetween(31, 50);
      } else {
        // Level 8: result 51 to 100
        correctAnswer = randomBetween(51, 100);
      }
      num1 = correctAnswer * correctAnswer; // Square under the radical (e.g. √144 = 12)
      num2 = 0;
      break;

    case 'algebra':
      operandSymbol = 'alg';
      if (level === 1) {
        // Level 1: x + a = b or x - a = b (positive answers, within 20)
        const x = randomBetween(2, 15);
        const a = randomBetween(1, 15);
        if (Math.random() > 0.5) {
          const b = x + a;
          formula = `x + ${a} = ${b}`;
        } else {
          const b = x - a;
          formula = `x - ${a} = ${b}`;
        }
        correctAnswer = x;
        num1 = a;
      } else if (level === 2) {
        // Level 2: a - x = b or a + x = b (might have clean negative answers)
        const x = randomBetween(-8, 12);
        const ans = x === 0 ? 5 : x;
        const a = randomBetween(5, 20);
        if (Math.random() > 0.5) {
          const b = a - ans;
          formula = `${a} - x = ${b}`;
        } else {
          const b = a + ans;
          formula = `${a} + x = ${b}`;
        }
        correctAnswer = ans;
        num1 = a;
      } else if (level === 3) {
        // Level 3: ax = b or x / a = b (simple divisions)
        if (Math.random() > 0.5) {
          const a = randomBetween(2, 9);
          const x = randomBetween(2, 12);
          const b = a * x;
          formula = `${a}x = ${b}`;
          correctAnswer = x;
          num1 = a;
        } else {
          const a = randomBetween(2, 5);
          const x = randomBetween(12, 40);
          const b = Math.floor(x / a) || 5;
          const cleanX = b * a;
          formula = `x / ${a} = ${b}`;
          correctAnswer = cleanX;
          num1 = a;
        }
      } else if (level === 4) {
        // Level 4: ax + b = c (positive coefficients and results)
        const a = randomBetween(2, 7);
        const x = randomBetween(2, 10);
        const b = randomBetween(1, 15);
        const c = a * x + b;
        formula = `${a}x + ${b} = ${c}`;
        correctAnswer = x;
        num1 = a;
      } else if (level === 5) {
        // Level 5: ax - b = c (negative results possible)
        const a = randomBetween(2, 8);
        const x = randomBetween(-5, 9);
        const ans = x === 0 ? 3 : x;
        const b = randomBetween(2, 15);
        const c = a * ans - b;
        formula = `${a}x - ${b} = ${c}`;
        correctAnswer = ans;
        num1 = a;
      } else if (level === 6) {
        // Level 6: ax + b = cx + d (two x terms, clean results)
        const x = randomBetween(-5, 9);
        const ans = x === 0 ? 4 : x;
        const c = randomBetween(2, 5);
        const a = c + randomBetween(1, 4);
        const b = randomBetween(1, 15);
        const d = (a - c) * ans + b;
        formula = `${a}x + ${b} = ${c}x + ${d}`;
        correctAnswer = ans;
        num1 = a;
        num2 = c;
      } else if (level === 7) {
        // Level 7: parenthesis format a(x + b) = c
        const a = randomBetween(2, 5);
        const x = randomBetween(-5, 12);
        const ans = x === 0 ? 5 : x;
        const b = randomBetween(1, 8);
        const c = a * (ans + b);
        formula = `${a}(x + ${b}) = ${c}`;
        correctAnswer = ans;
        num1 = a;
        num2 = b;
      } else {
        // Level 8: ax - b = cx + d (and negative outcomes)
        const x = randomBetween(-10, 15);
        const ans = x === 0 ? 7 : x;
        const c = randomBetween(2, 6);
        const a = c + randomBetween(1, 5);
        const b = randomBetween(3, 20);
        const d = (a - c) * ans - b;
        if (d >= 0) {
          formula = `${a}x - ${b} = ${c}x + ${d}`;
        } else {
          formula = `${a}x - ${b} = ${c}x - ${Math.abs(d)}`;
        }
        correctAnswer = ans;
        num1 = a;
        num2 = c;
      }
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
    formula,
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
