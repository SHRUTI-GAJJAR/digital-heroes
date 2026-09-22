const supabase = require("../config/supabase");

const {
  calculateMatches
} = require("./drawService");


// CREATE DRAW ENTRY
const createDrawEntry = async ({
  drawId,
  userId,
  numbers
}) => {
  if (!Array.isArray(numbers) || numbers.length !== 5) {
    throw new Error("Entry must contain exactly 5 numbers");
  }

  const uniqueNumbers = [...new Set(numbers)];

  if (uniqueNumbers.length !== 5) {
    throw new Error("Entry numbers must be unique");
  }

  const validNumbers = uniqueNumbers.every(
    (number) =>
      Number.isInteger(number) &&
      number >= 1 &&
      number <= 45
  );

  if (!validNumbers) {
    throw new Error(
      "Entry numbers must be integers between 1 and 45"
    );
  }

  const sortedNumbers = [...uniqueNumbers].sort(
    (a, b) => a - b
  );

  const { data: entry, error } = await supabase
    .from("draw_entries")
    .insert({
      draw_id: drawId,
      user_id: userId,
      numbers: sortedNumbers
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return entry;
};


// CALCULATE ENTRY MATCH
const calculateEntryMatch = (
  entryNumbers,
  winningNumbers
) => {
  return calculateMatches(
    entryNumbers,
    winningNumbers
  );
};


module.exports = {
  createDrawEntry,
  calculateEntryMatch
};