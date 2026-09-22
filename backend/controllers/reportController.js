const supabase = require("../config/supabase");

// GET ADMIN DASHBOARD SUMMARY
const getDashboardSummary = async (req, res) => {
  try {
    // USERS
    const { count: totalUsers, error: usersError } =
      await supabase
        .from("users")
        .select("*", {
          count: "exact",
          head: true
        });

    if (usersError) {
      throw usersError;
    }

    // ACTIVE SUBSCRIPTIONS
    const {
      count: activeSubscriptions,
      error: subscriptionsError
    } = await supabase
      .from("subscriptions")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("status", "active");

    if (subscriptionsError) {
      throw subscriptionsError;
    }

    // TOTAL SUBSCRIPTIONS
    const {
      count: totalSubscriptions,
      error: totalSubscriptionsError
    } = await supabase
      .from("subscriptions")
      .select("*", {
        count: "exact",
        head: true
      });

    if (totalSubscriptionsError) {
      throw totalSubscriptionsError;
    }

    // CHARITIES
    const {
      count: totalCharities,
      error: charitiesError
    } = await supabase
      .from("charities")
      .select("*", {
        count: "exact",
        head: true
      });

    if (charitiesError) {
      throw charitiesError;
    }

    // DRAWS
    const {
      count: totalDraws,
      error: drawsError
    } = await supabase
      .from("draws")
      .select("*", {
        count: "exact",
        head: true
      });

    if (drawsError) {
      throw drawsError;
    }

    // COMPLETED DRAWS
    const {
      count: completedDraws,
      error: completedDrawsError
    } = await supabase
      .from("draws")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("status", "completed");

    if (completedDrawsError) {
      throw completedDrawsError;
    }

    // WINNERS
    const {
      count: totalWinners,
      error: winnersError
    } = await supabase
      .from("winners")
      .select("*", {
        count: "exact",
        head: true
      });

    if (winnersError) {
      throw winnersError;
    }

    // PENDING WINNERS
    const {
      count: pendingWinners,
      error: pendingWinnersError
    } = await supabase
      .from("winners")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("verification_status", "pending");

    if (pendingWinnersError) {
      throw pendingWinnersError;
    }

    // PAID WINNERS
    const {
      count: paidWinners,
      error: paidWinnersError
    } = await supabase
      .from("winners")
      .select("*", {
        count: "exact",
        head: true
      })
      .eq("payout_status", "paid");

    if (paidWinnersError) {
      throw paidWinnersError;
    }

    // DONATIONS
    const {
      data: donations,
      error: donationsError
    } = await supabase
      .from("donations")
      .select("amount");

    if (donationsError) {
      throw donationsError;
    }

    const totalDonations = donations.reduce(
      (total, donation) =>
        total + Number(donation.amount),
      0
    );

    // TOTAL PRIZE POOL
    const {
      data: draws,
      error: prizeError
    } = await supabase
      .from("draws")
      .select("total_prize_pool");

    if (prizeError) {
      throw prizeError;
    }

    const totalPrizePool = draws.reduce(
      (total, draw) =>
        total + Number(
          draw.total_prize_pool || 0
        ),
      0
    );

    return res.status(200).json({
      success: true,
      dashboard: {
        users: {
          total: totalUsers || 0
        },

        subscriptions: {
          total: totalSubscriptions || 0,
          active: activeSubscriptions || 0
        },

        charities: {
          total: totalCharities || 0
        },

        draws: {
          total: totalDraws || 0,
          completed: completedDraws || 0
        },

        winners: {
          total: totalWinners || 0,
          pending: pendingWinners || 0,
          paid: paidWinners || 0
        },

        donations: {
          total_amount:
            Number(totalDonations.toFixed(2))
        },

        prize_pool: {
          total_amount:
            Number(totalPrizePool.toFixed(2))
        }
      }
    });
  } catch (error) {
    console.error(
      "Dashboard summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET SUBSCRIPTION REPORT
const getSubscriptionReport = async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("subscriptions")
        .select(`
          id,
          user_id,
          plan_type,
          amount,
          currency,
          status,
          charity_id,
          charity_percentage,
          start_date,
          renewal_date,
          cancelled_at,
          created_at,
          users (
            name,
            email
          ),
          charities (
            name
          )
        `)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      subscriptions: data
    });
  } catch (error) {
    console.error(
      "Subscription report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET WINNER REPORT
const getWinnerReport = async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("winners")
        .select(`
          *,
          users (
            name,
            email
          ),
          draws (
            draw_name,
            draw_month
          )
        `)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      winners: data
    });
  } catch (error) {
    console.error(
      "Winner report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET CHARITY REPORT
const getCharityReport = async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("donations")
        .select(`
          amount,
          percentage,
          donation_type,
          created_at,
          charities (
            id,
            name
          )
        `);

    if (error) {
      throw error;
    }

    const charitySummary = {};

    data.forEach((donation) => {
      const charity = donation.charities;

      if (!charity) {
        return;
      }

      if (!charitySummary[charity.id]) {
        charitySummary[charity.id] = {
          charity_id: charity.id,
          charity_name: charity.name,
          total_donations: 0,
          donation_count: 0
        };
      }

      charitySummary[charity.id]
        .total_donations += Number(
          donation.amount
        );

      charitySummary[charity.id]
        .donation_count += 1;
    });

    const charities =
      Object.values(charitySummary).map(
        (charity) => ({
          ...charity,
          total_donations:
            Number(
              charity.total_donations.toFixed(2)
            )
        })
      );

    return res.status(200).json({
      success: true,
      charities
    });
  } catch (error) {
    console.error(
      "Charity report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET DRAW REPORT
const getDrawReport = async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("draws")
        .select(`
          id,
          draw_name,
          draw_month,
          draw_type,
          status,
          winning_numbers,
          total_prize_pool,
          jackpot_amount,
          four_match_pool,
          three_match_pool,
          jackpot_rollover,
          published_at,
          created_at
        `)
        .order("draw_month", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      draws: data
    });
  } catch (error) {
    console.error(
      "Draw report error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  getDashboardSummary,
  getSubscriptionReport,
  getWinnerReport,
  getCharityReport,
  getDrawReport
};