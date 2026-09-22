const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

router.get("/supabase", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("charities")
      .select("id")
      .limit(1);

    if (error) {
      throw error;
    }

    res.status(200).json({
      success: true,
      message: "Supabase connection successful",
      data
    });
  } catch (error) {
    console.error("Supabase connection error:", error);

    res.status(500).json({
      success: false,
      message: "Supabase connection failed"
    });
  }
});

module.exports = router;