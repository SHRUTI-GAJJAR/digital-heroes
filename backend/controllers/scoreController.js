const supabase = require("../config/supabase");


// GET MY SCORES
const getMyScores = async (req, res) => {
  try {
    const { data: scores, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", req.user.id)
      .order("score_date", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: scores.length,
      scores
    });
  } catch (error) {
    console.error("Get scores error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching scores"
    });
  }
};


// GET SINGLE SCORE
const getScoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: score, error } = await supabase
      .from("scores")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !score) {
      return res.status(404).json({
        success: false,
        message: "Score not found"
      });
    }

    return res.status(200).json({
      success: true,
      score
    });
  } catch (error) {
    console.error("Get score error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching score"
    });
  }
};


// CREATE SCORE
const createScore = async (req, res) => {
  try {
    const {
      score_date,
      stableford_score
    } = req.body;

    if (!score_date || stableford_score === undefined) {
      return res.status(400).json({
        success: false,
        message: "Score date and Stableford score are required"
      });
    }

    const score = Number(stableford_score);

    // Stableford must be between 1 and 45
    if (!Number.isInteger(score) || score < 1 || score > 45) {
      return res.status(400).json({
        success: false,
        message: "Stableford score must be an integer between 1 and 45"
      });
    }

    // Check whether this date already exists
    const { data: existingScore, error: existingError } =
      await supabase
        .from("scores")
        .select("id")
        .eq("user_id", req.user.id)
        .eq("score_date", score_date)
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingScore) {
      return res.status(409).json({
        success: false,
        message:
          "A score already exists for this date. Use update instead."
      });
    }

    // Insert new score
    const { data: newScore, error: insertError } =
      await supabase
        .from("scores")
        .insert({
          user_id: req.user.id,
          score_date,
          stableford_score: score
        })
        .select("*")
        .single();

    if (insertError) {
      throw insertError;
    }

    // Get all user's scores ordered newest first
    const { data: allScores, error: scoresError } =
      await supabase
        .from("scores")
        .select("id, score_date")
        .eq("user_id", req.user.id)
        .order("score_date", { ascending: false });

    if (scoresError) {
      throw scoresError;
    }

    // Keep only latest 5
    if (allScores.length > 5) {
      const scoresToDelete = allScores.slice(5);

      const idsToDelete = scoresToDelete.map(
        (item) => item.id
      );

      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .in("id", idsToDelete)
        .eq("user_id", req.user.id);

      if (deleteError) {
        throw deleteError;
      }
    }

    return res.status(201).json({
      success: true,
      message: "Score added successfully",
      score: newScore
    });
  } catch (error) {
    console.error("Create score error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating score"
    });
  }
};


// UPDATE SCORE
const updateScore = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      score_date,
      stableford_score
    } = req.body;

    if (
      score_date === undefined &&
      stableford_score === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    if (stableford_score !== undefined) {
      const score = Number(stableford_score);

      if (!Number.isInteger(score) || score < 1 || score > 45) {
        return res.status(400).json({
          success: false,
          message:
            "Stableford score must be an integer between 1 and 45"
        });
      }
    }

    // Make sure score belongs to current user
    const { data: existingScore, error: findError } =
      await supabase
        .from("scores")
        .select("*")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (findError || !existingScore) {
      return res.status(404).json({
        success: false,
        message: "Score not found"
      });
    }

    // If date is being changed, make sure another score
    // doesn't already exist for that date.
    if (
      score_date !== undefined &&
      score_date !== existingScore.score_date
    ) {
      const { data: duplicateScore, error: duplicateError } =
        await supabase
          .from("scores")
          .select("id")
          .eq("user_id", req.user.id)
          .eq("score_date", score_date)
          .neq("id", id)
          .maybeSingle();

      if (duplicateError) {
        throw duplicateError;
      }

      if (duplicateScore) {
        return res.status(409).json({
          success: false,
          message:
            "A score already exists for the selected date"
        });
      }
    }

    const updates = {};

    if (score_date !== undefined) {
      updates.score_date = score_date;
    }

    if (stableford_score !== undefined) {
      updates.stableford_score = Number(stableford_score);
    }

    const { data: updatedScore, error: updateError } =
      await supabase
        .from("scores")
        .update(updates)
        .eq("id", id)
        .eq("user_id", req.user.id)
        .select("*")
        .single();

    if (updateError) {
      throw updateError;
    }

    return res.status(200).json({
      success: true,
      message: "Score updated successfully",
      score: updatedScore
    });
  } catch (error) {
    console.error("Update score error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating score"
    });
  }
};


// DELETE SCORE
const deleteScore = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: score, error: findError } =
      await supabase
        .from("scores")
        .select("id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (findError || !score) {
      return res.status(404).json({
        success: false,
        message: "Score not found"
      });
    }

    const { error: deleteError } = await supabase
      .from("scores")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (deleteError) {
      throw deleteError;
    }

    return res.status(200).json({
      success: true,
      message: "Score deleted successfully"
    });
  } catch (error) {
    console.error("Delete score error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting score"
    });
  }
};


module.exports = {
  getMyScores,
  getScoreById,
  createScore,
  updateScore,
  deleteScore
};