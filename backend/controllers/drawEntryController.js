const supabase = require("../config/supabase");

const {
  createDrawEntry
} = require("../services/entryService");


// GET MY ENTRY FOR A DRAW
const getMyDrawEntry = async (req, res) => {
  try {
    const { drawId } = req.params;

    const { data: entry, error } = await supabase
      .from("draw_entries")
      .select("*")
      .eq("draw_id", drawId)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "No entry found for this draw"
      });
    }

    return res.status(200).json({
      success: true,
      entry
    });
  } catch (error) {
    console.error("Get draw entry error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching draw entry"
    });
  }
};


// GET ALL ENTRIES FOR A DRAW - ADMIN
const getDrawEntries = async (req, res) => {
  try {
    const { drawId } = req.params;

    const { data: entries, error } = await supabase
      .from("draw_entries")
      .select(`
        *,
        users (
          id,
          name,
          email
        )
      `)
      .eq("draw_id", drawId)
      .order("created_at", {
        ascending: false
      });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: entries.length,
      entries
    });
  } catch (error) {
    console.error("Get draw entries error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching draw entries"
    });
  }
};


// CREATE MY ENTRY
const createEntry = async (req, res) => {
  try {
    const { drawId } = req.params;
    const { numbers } = req.body;

    // Check draw
    const { data: draw, error: drawError } =
      await supabase
        .from("draws")
        .select("id, status")
        .eq("id", drawId)
        .single();

    if (drawError || !draw) {
      return res.status(404).json({
        success: false,
        message: "Draw not found"
      });
    }

    if (draw.status !== "published") {
      return res.status(400).json({
        success: false,
        message:
          "Entries can only be created for a published draw"
      });
    }

    // Check active subscription
    const { data: subscription, error: subscriptionError } =
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", req.user.id)
        .eq("status", "active")
        .maybeSingle();

    if (subscriptionError) {
      throw subscriptionError;
    }

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message:
          "An active subscription is required to enter a draw"
      });
    }

    // Check existing entry
    const { data: existingEntry, error: existingError } =
      await supabase
        .from("draw_entries")
        .select("id")
        .eq("draw_id", drawId)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingEntry) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an entry for this draw"
      });
    }

    const entry = await createDrawEntry({
      drawId,
      userId: req.user.id,
      numbers
    });

    return res.status(201).json({
      success: true,
      message: "Draw entry created successfully",
      entry
    });
  } catch (error) {
    console.error("Create draw entry error:", error);

    return res.status(400).json({
      success: false,
      message: error.message ||
        "Unable to create draw entry"
    });
  }
};


// DELETE MY ENTRY
const deleteEntry = async (req, res) => {
  try {
    const { drawId } = req.params;

    const { data: entry, error: findError } =
      await supabase
        .from("draw_entries")
        .select("id")
        .eq("draw_id", drawId)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (findError) {
      throw findError;
    }

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Draw entry not found"
      });
    }

    const { error } = await supabase
      .from("draw_entries")
      .delete()
      .eq("id", entry.id)
      .eq("user_id", req.user.id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Draw entry deleted successfully"
    });
  } catch (error) {
    console.error("Delete draw entry error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting draw entry"
    });
  }
};


module.exports = {
  getMyDrawEntry,
  getDrawEntries,
  createEntry,
  deleteEntry
};