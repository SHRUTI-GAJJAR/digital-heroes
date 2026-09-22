const supabase = require("../config/supabase");

const {
  createWinnersFromResults
} = require("../services/winnerService");

const {
  generateWinningNumbers,
  calculateMatches
} = require("../services/drawService");

const {
  calculateActiveSubscriberPool,
  calculatePrizePool,
  splitPrize
} = require("../services/prizeService");


// GET ALL DRAWS
const getDraws = async (req, res) => {
  try {
    const { status } = req.query;

    let query = supabase
      .from("draws")
      .select("*")
      .order("draw_month", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data: draws, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: draws.length,
      draws
    });
  } catch (error) {
    console.error("Get draws error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching draws"
    });
  }
};


// GET SINGLE DRAW
const getDrawById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: draw, error } = await supabase
      .from("draws")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    return res.status(200).json({
      success: true,
      draw
    });
  } catch (error) {
    console.error("Get draw error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching draw"
    });
  }
};


// CREATE DRAW
const createDraw = async (req, res) => {
  try {
    const {
      draw_name,
      draw_month,
      draw_type = "random"
    } = req.body;

    if (!draw_name || !draw_month) {
      return res.status(400).json({
        success: false,
        message: "Draw name and draw month are required"
      });
    }

    if (!["random", "algorithmic"].includes(draw_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid draw type"
      });
    }

    // Prevent duplicate month
    const { data: existingDraw, error: existingError } =
      await supabase
        .from("draws")
        .select("id")
        .eq("draw_month", draw_month)
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingDraw) {
      return res.status(409).json({
        success: false,
        message: "A draw already exists for this month"
      });
    }

    const { data: draw, error } = await supabase
      .from("draws")
      .insert({
        draw_name: draw_name.trim(),
        draw_month,
        draw_type,
        status: "draft"
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Draw created successfully",
      draw
    });
  } catch (error) {
    console.error("Create draw error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating draw"
    });
  }
};


// UPDATE DRAW
const updateDraw = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      draw_name,
      draw_month,
      draw_type
    } = req.body;

    const { data: existingDraw, error: findError } =
      await supabase
        .from("draws")
        .select("*")
        .eq("id", id)
        .single();

    if (findError || !existingDraw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    if (
      !["draft", "simulated"].includes(existingDraw.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only draft or simulated draws can be updated"
      });
    }

    const updates = {};

    if (draw_name !== undefined) {
      if (!draw_name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Draw name cannot be empty"
        });
      }

      updates.draw_name = draw_name.trim();
    }

    if (draw_month !== undefined) {
      updates.draw_month = draw_month;
    }

    if (draw_type !== undefined) {
      if (
        !["random", "algorithmic"].includes(draw_type)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid draw type"
        });
      }

      updates.draw_type = draw_type;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    const { data: draw, error } = await supabase
      .from("draws")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Draw updated successfully",
      draw
    });
  } catch (error) {
    console.error("Update draw error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating draw"
    });
  }
};


// DELETE DRAW
const deleteDraw = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: draw, error: findError } =
      await supabase
        .from("draws")
        .select("id, status")
        .eq("id", id)
        .single();

    if (findError || !draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    if (
      !["draft", "simulated"].includes(draw.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only draft or simulated draws can be deleted"
      });
    }

    const { error } = await supabase
      .from("draws")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Draw deleted successfully"
    });
  } catch (error) {
    console.error("Delete draw error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting draw"
    });
  }
};


// GET STABLEFORD SCORES FROM ACTIVE SUBSCRIBERS
const getActiveSubscriberScores = async () => {
  // Get active subscription users
  const { data: subscriptions, error: subscriptionError } =
    await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active");

  if (subscriptionError) {
    throw subscriptionError;
  }

  const activeUserIds = [
    ...new Set(
      subscriptions.map((subscription) => subscription.user_id)
    )
  ];

  if (activeUserIds.length === 0) {
    return [];
  }

  // Get scores belonging to active subscribers
  const { data: scores, error: scoresError } =
    await supabase
      .from("scores")
      .select("stableford_score")
      .in("user_id", activeUserIds);

  if (scoresError) {
    throw scoresError;
  }

  return scores.map(
    (score) => score.stableford_score
  );
};


// SIMULATE DRAW
const simulateDraw = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: draw, error: drawError } =
      await supabase
        .from("draws")
        .select("*")
        .eq("id", id)
        .single();

    if (drawError || !draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    if (
      !["draft", "simulated"].includes(draw.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only draft or simulated draws can be simulated"
      });
    }

    // Get Stableford scores from active subscribers
    const scoreValues =
      await getActiveSubscriberScores();

    // Generate winning numbers
    const winningNumbers =
      generateWinningNumbers(
        draw.draw_type,
        scoreValues
      );

    // Get active subscriber count
    const {
      count: subscriberCount,
      error: countError
    } = await supabase
      .from("subscriptions")
      .select("id", {
        count: "exact",
        head: true
      })
      .eq("status", "active");

    if (countError) {
      throw countError;
    }

    // Calculate actual active subscriber pool
    const subscriberPool =
      await calculateActiveSubscriberPool();

    // Calculate prize pool
    const prizePool = calculatePrizePool({
      subscriberPool,
      previousJackpot:
        Number(draw.jackpot_amount || 0)
    });

    return res.status(200).json({
      success: true,
      message: "Draw simulation generated successfully",

      simulation: {
        winning_numbers: winningNumbers,
        subscriber_count: subscriberCount || 0,
        subscriber_pool: subscriberPool,
        ...prizePool
      }
    });
  } catch (error) {
    console.error("Simulate draw error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while simulating draw"
    });
  }
};


// PUBLISH DRAW
const publishDraw = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: draw, error: findError } =
      await supabase
        .from("draws")
        .select("*")
        .eq("id", id)
        .single();

    if (findError || !draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    if (
      !["draft", "simulated"].includes(draw.status)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only draft or simulated draws can be published"
      });
    }

    // Get Stableford scores from active subscribers
    const scoreValues =
      await getActiveSubscriberScores();

    // Generate final winning numbers
    const winningNumbers =
      generateWinningNumbers(
        draw.draw_type,
        scoreValues
      );

    // Calculate current prize pool
    const subscriberPool =
      await calculateActiveSubscriberPool();

    const prizePool = calculatePrizePool({
      subscriberPool,
      previousJackpot:
        Number(draw.jackpot_amount || 0)
    });

    const { data: updatedDraw, error } =
      await supabase
        .from("draws")
        .update({
          winning_numbers: winningNumbers,
          status: "published",
          published_at: new Date().toISOString(),
          total_prize_pool:
            prizePool.totalPrizePool,
          jackpot_amount:
            prizePool.jackpotAmount,
          four_match_pool:
            prizePool.fourMatchPool,
          three_match_pool:
            prizePool.threeMatchPool,
          jackpot_rollover: false
        })
        .eq("id", id)
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Draw published successfully",
      draw: updatedDraw
    });
  } catch (error) {
    console.error("Publish draw error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while publishing draw"
    });
  }
};


// COMPLETE DRAW
const completeDraw = async (req, res) => {
  try {
    const { id } = req.params;

    // Get draw
    const { data: draw, error: findError } =
      await supabase
        .from("draws")
        .select("*")
        .eq("id", id)
        .single();

    if (findError || !draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    // Only published draws can be completed
    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message:
          "Only published draws can be completed"
      });
    }

    // Winning numbers are required
    if (
      !Array.isArray(draw.winning_numbers) ||
      draw.winning_numbers.length !== 5
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid winning numbers are required"
      });
    }

    // Get all draw entries
    const {
      data: entries,
      error: entriesError
    } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", id);

    if (entriesError) {
      throw entriesError;
    }

    let fiveMatchCount = 0;
    let fourMatchCount = 0;
    let threeMatchCount = 0;

    // Calculate matches for every entry
    for (const entry of entries) {
      const matches = calculateMatches(
        entry.numbers,
        draw.winning_numbers
      );

      if (matches.matched_five) {
        fiveMatchCount++;
      } else if (matches.matched_four) {
        fourMatchCount++;
      } else if (matches.matched_three) {
        threeMatchCount++;
      }

      // Save match results
      const { error: updateError } =
        await supabase
          .from("draw_entries")
          .update({
            matched_five:
              matches.matched_five,
            matched_four:
              matches.matched_four,
            matched_three:
              matches.matched_three
          })
          .eq("id", entry.id);

      if (updateError) {
        throw updateError;
      }

      // Keep updated values for winner creation
      entry.matched_five =
        matches.matched_five;

      entry.matched_four =
        matches.matched_four;

      entry.matched_three =
        matches.matched_three;
    }

    // Calculate active subscriber pool
    const subscriberPool =
      await calculateActiveSubscriberPool();

    const prizePool = calculatePrizePool({
      subscriberPool,
      previousJackpot:
        Number(draw.jackpot_amount || 0)
    });

    // Calculate prize per winner
    const fivePrize =
      fiveMatchCount > 0
        ? splitPrize(
            prizePool.jackpotAmount,
            fiveMatchCount
          )
        : 0;

    const fourPrize =
      fourMatchCount > 0
        ? splitPrize(
            prizePool.fourMatchPool,
            fourMatchCount
          )
        : 0;

    const threePrize =
      threeMatchCount > 0
        ? splitPrize(
            prizePool.threeMatchPool,
            threeMatchCount
          )
        : 0;

    // Jackpot rollover
    const jackpotRollover =
      fiveMatchCount === 0;

    const nextJackpot =
      jackpotRollover
        ? prizePool.jackpotAmount
        : 0;

    // Create winner records
    const winners =
      await createWinnersFromResults({
        drawId: id,
        entries,

        fivePrize:
          prizePool.jackpotAmount,

        fourPrize:
          prizePool.fourMatchPool,

        threePrize:
          prizePool.threeMatchPool,

        fiveWinnerCount:
          fiveMatchCount,

        fourWinnerCount:
          fourMatchCount,

        threeWinnerCount:
          threeMatchCount
      });

    // Update draw
    const {
      data: updatedDraw,
      error: updateDrawError
    } = await supabase
      .from("draws")
      .update({
        status: "completed",

        total_prize_pool:
          prizePool.totalPrizePool,

        jackpot_amount:
          nextJackpot,

        four_match_pool:
          prizePool.fourMatchPool,

        three_match_pool:
          prizePool.threeMatchPool,

        jackpot_rollover:
          jackpotRollover
      })
      .eq("id", id)
      .select("*")
      .single();

    if (updateDrawError) {
      throw updateDrawError;
    }

    return res.status(200).json({
      success: true,
      message:
        "Draw completed successfully",

      draw: updatedDraw,

      results: {
        five_match_winners:
          fiveMatchCount,

        four_match_winners:
          fourMatchCount,

        three_match_winners:
          threeMatchCount,

        winners_created:
          winners.length,

        five_match_prize:
          fivePrize,

        four_match_prize:
          fourPrize,

        three_match_prize:
          threePrize,

        jackpot_rollover:
          jackpotRollover,

        next_jackpot:
          nextJackpot
      }
    });

  } catch (error) {
    console.error(
      "Complete draw error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while completing draw"
    });
  }
};


module.exports = {
  getDraws,
  getDrawById,
  createDraw,
  updateDraw,
  deleteDraw,
  simulateDraw,
  publishDraw,
  completeDraw
};