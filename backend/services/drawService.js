const generateRandomNumbers = () => {
  const numbers = [];

  while (numbers.length < 5) {
    const number = Math.floor(Math.random() * 45) + 1;

    if (!numbers.includes(number)) {
      numbers.push(number);
    }
  }

  return numbers.sort((a, b) => a - b);
};


// Weighted selection based on score frequency
const generateAlgorithmicNumbers = (scores = []) => {
  const frequency = {};

  scores.forEach((score) => {
    frequency[score] = (frequency[score] || 0) + 1;
  });

  const weightedNumbers = [];

  Object.entries(frequency).forEach(
    ([number, count]) => {
      for (let i = 0; i < count; i++) {
        weightedNumbers.push(Number(number));
      }
    }
  );

  const result = [];

  while (result.length < 5) {
    let number;

    if (weightedNumbers.length > 0) {
      number =
        weightedNumbers[
          Math.floor(
            Math.random() * weightedNumbers.length
          )
        ];
    } else {
      number = Math.floor(Math.random() * 45) + 1;
    }

    if (!result.includes(number)) {
      result.push(number);
    }
  }

  return result.sort((a, b) => a - b);
};


// Generate numbers according to draw type
const generateWinningNumbers = (
  drawType,
  scores = []
) => {
  if (drawType === "algorithmic") {
    return generateAlgorithmicNumbers(scores);
  }

  return generateRandomNumbers();
};


// Count matching numbers
const calculateMatches = (
  entryNumbers,
  winningNumbers
) => {
  const matches = entryNumbers.filter((number) =>
    winningNumbers.includes(number)
  );

  return {
    matched_five: matches.length === 5 ? 1 : 0,
    matched_four: matches.length === 4 ? 1 : 0,
    matched_three: matches.length === 3 ? 1 : 0,
    total_matches: matches.length
  };
};


module.exports = {
  generateRandomNumbers,
  generateAlgorithmicNumbers,
  generateWinningNumbers,
  calculateMatches
};