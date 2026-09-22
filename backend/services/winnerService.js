const supabase = require("../config/supabase");

const createWinnersFromResults = async ({
  drawId,
  entries,
  fivePrize,
  fourPrize,
  threePrize,
  fiveWinnerCount,
  fourWinnerCount,
  threeWinnerCount
}) => {
  const winners = [];

  const fiveWinnerPrize =
    fiveWinnerCount > 0 ? fivePrize / fiveWinnerCount : 0;

  const fourWinnerPrize =
    fourWinnerCount > 0 ? fourPrize / fourWinnerCount : 0;

  const threeWinnerPrize =
    threeWinnerCount > 0 ? threePrize / threeWinnerCount : 0;

  for (const entry of entries) {
    let matchType = null;
    let prizeAmount = 0;

    if (entry.matched_five === 1) {
      matchType = "5-number";
      prizeAmount = fiveWinnerPrize;
    } else if (entry.matched_four === 1) {
      matchType = "4-number";
      prizeAmount = fourWinnerPrize;
    } else if (entry.matched_three === 1) {
      matchType = "3-number";
      prizeAmount = threeWinnerPrize;
    }

    if (!matchType) continue;

    winners.push({
      draw_id: drawId,
      user_id: entry.user_id,
      draw_entry_id: entry.id,
      match_type: matchType,
      prize_amount: Number(prizeAmount.toFixed(2)),
      verification_status: "pending",
      payout_status: "pending"
    });
  }

  if (winners.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("winners")
    .insert(winners)
    .select("*");

  if (error) throw error;

  return data;
};

module.exports = {
  createWinnersFromResults
};