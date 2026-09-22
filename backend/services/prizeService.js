const supabase = require("../config/supabase");


// GET ACTIVE SUBSCRIBER PRIZE CONTRIBUTION
const calculateActiveSubscriberPool = async () => {
  const { data: subscriptions, error } = await supabase
    .from("subscriptions")
    .select("amount, plan_type")
    .eq("status", "active");

  if (error) {
    throw error;
  }

  /*
    For a monthly draw:

    monthly subscription:
    entire monthly amount contributes

    yearly subscription:
    yearly amount is converted to a monthly
    equivalent for the draw pool.
  */

  let totalPool = 0;

  subscriptions.forEach((subscription) => {
    const amount = Number(subscription.amount);

    if (subscription.plan_type === "yearly") {
      totalPool += amount / 12;
    } else {
      totalPool += amount;
    }
  });

  return Number(totalPool.toFixed(2));
};


// CALCULATE PRIZE POOL
const calculatePrizePool = ({
  subscriberPool,
  previousJackpot = 0
}) => {
  const totalPrizePool = Number(
    subscriberPool
  );

  const fiveMatchPool = Number(
    (totalPrizePool * 0.40).toFixed(2)
  );

  const fourMatchPool = Number(
    (totalPrizePool * 0.35).toFixed(2)
  );

  const threeMatchPool = Number(
    (totalPrizePool * 0.25).toFixed(2)
  );

  const jackpotAmount = Number(
    (
      fiveMatchPool +
      Number(previousJackpot)
    ).toFixed(2)
  );

  return {
    totalPrizePool,
    jackpotAmount,
    fiveMatchPool,
    fourMatchPool,
    threeMatchPool
  };
};


// SPLIT PRIZE BETWEEN WINNERS
const splitPrize = (
  totalPrize,
  winnerCount
) => {
  if (!winnerCount || winnerCount <= 0) {
    return 0;
  }

  return Number(
    (Number(totalPrize) / winnerCount).toFixed(2)
  );
};


module.exports = {
  calculateActiveSubscriberPool,
  calculatePrizePool,
  splitPrize
};