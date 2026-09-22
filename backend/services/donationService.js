const supabase = require("../config/supabase");

// Calculate donation amount from subscription
const calculateSubscriptionDonation = (
  amount,
  percentage
) => {
  const donationAmount =
    Number(amount) * (Number(percentage) / 100);

  return Number(donationAmount.toFixed(2));
};


// Create donation automatically for a subscription
const createSubscriptionDonation = async (
  subscription
) => {
  if (
    !subscription ||
    !subscription.charity_id
  ) {
    return null;
  }

  const donationAmount =
    calculateSubscriptionDonation(
      subscription.amount,
      subscription.charity_percentage
    );

  const { data: donation, error } =
    await supabase
      .from("donations")
      .insert({
        user_id: subscription.user_id,
        charity_id: subscription.charity_id,
        subscription_id: subscription.id,
        amount: donationAmount,
        percentage:
          subscription.charity_percentage,
        donation_type: "subscription"
      })
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return donation;
};


// Create independent donation
const createIndependentDonation = async ({
  userId,
  charityId,
  amount
}) => {
  const donationAmount = Number(amount);

  if (
    !Number.isFinite(donationAmount) ||
    donationAmount <= 0
  ) {
    throw new Error(
      "Donation amount must be greater than 0"
    );
  }

  // Verify charity exists and is active
  const { data: charity, error: charityError } =
    await supabase
      .from("charities")
      .select("id, name, is_active")
      .eq("id", charityId)
      .maybeSingle();

  if (charityError) {
    throw charityError;
  }

  if (!charity) {
    throw new Error("Charity not found");
  }

  if (!charity.is_active) {
    throw new Error("Charity is not active");
  }

  const { data: donation, error } =
    await supabase
      .from("donations")
      .insert({
        user_id: userId,
        charity_id: charityId,
        subscription_id: null,
        amount: Number(
          donationAmount.toFixed(2)
        ),
        percentage: 100,
        donation_type: "independent"
      })
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return donation;
};


module.exports = {
  calculateSubscriptionDonation,
  createSubscriptionDonation,
  createIndependentDonation
};