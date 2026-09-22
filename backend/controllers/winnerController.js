const supabase = require("../config/supabase");

// Get logged-in user's winners
const getMyWinners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        draws (
          id,
          draw_name,
          draw_month,
          winning_numbers
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      winners: data
    });
  } catch (error) {
    console.error("Get my winners error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch winners"
    });
  }
};


// Get one winner
const getWinnerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        draws (
          id,
          draw_name,
          draw_month,
          winning_numbers
        )
      `)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (error) throw error;

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found"
      });
    }

    res.status(200).json({
      success: true,
      winner: data
    });
  } catch (error) {
    console.error("Get winner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch winner"
    });
  }
};


// Admin: get all winners
const getAllWinners = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("winners")
      .select(`
        *,
        draws (
          id,
          draw_name,
          draw_month,
          winning_numbers
        ),
        users (
          id,
          name,
          email
        )
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      winners: data
    });
  } catch (error) {
    console.error("Get all winners error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch winners"
    });
  }
};


// Upload winner proof
const uploadWinnerProof = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Proof file is required"
      });
    }

    // Check winner belongs to logged-in user
    const { data: winner, error: winnerError } = await supabase
      .from("winners")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (winnerError) throw winnerError;

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found"
      });
    }

    const fileExtension =
      req.file.originalname.split(".").pop().toLowerCase();

    const filePath = `${req.user.id}/${id}-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("winner-proofs")
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: proof, error: proofError } = await supabase
      .from("winner_proofs")
      .insert({
        winner_id: id,
        file_url: filePath,
        file_name: req.file.originalname
      })
      .select("*")
      .single();

    if (proofError) throw proofError;

    res.status(201).json({
      success: true,
      message: "Winner proof uploaded successfully",
      proof
    });
  } catch (error) {
    console.error("Upload winner proof error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to upload winner proof"
    });
  }
};


// Get winner proof
const getWinnerProof = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: winner, error: winnerError } = await supabase
      .from("winners")
      .select("id, user_id")
      .eq("id", id)
      .maybeSingle();

    if (winnerError) throw winnerError;

    if (!winner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found"
      });
    }

    // User can access own proof, admin can access any proof
    if (
      winner.user_id !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this proof"
      });
    }

    const { data: proof, error: proofError } = await supabase
      .from("winner_proofs")
      .select("*")
      .eq("winner_id", id)
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (proofError) throw proofError;

    if (!proof) {
      return res.status(404).json({
        success: false,
        message: "Winner proof not found"
      });
    }

    const { data: signedUrlData, error: signedUrlError } =
      await supabase.storage
        .from("winner-proofs")
        .createSignedUrl(proof.file_url, 60 * 60);

    if (signedUrlError) throw signedUrlError;

    res.status(200).json({
      success: true,
      proof: {
        ...proof,
        signed_url: signedUrlData.signedUrl
      }
    });
  } catch (error) {
    console.error("Get winner proof error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch winner proof"
    });
  }
};


// Admin: verify winner
const verifyWinner = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be approved or rejected"
      });
    }

    const { data, error } = await supabase
      .from("winners")
      .update({
        verification_status: status,
        verified_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    // Update proof review information if notes were provided
    if (review_notes) {
      await supabase
        .from("winner_proofs")
        .update({
          reviewed_at: new Date().toISOString(),
          review_notes
        })
        .eq("winner_id", id);
    }

    res.status(200).json({
      success: true,
      message: `Winner ${status} successfully`,
      winner: data
    });
  } catch (error) {
    console.error("Verify winner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify winner"
    });
  }
};


// Admin: mark winner as paid
const markWinnerPaid = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existingWinner, error: existingError } =
      await supabase
        .from("winners")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (existingError) throw existingError;

    if (!existingWinner) {
      return res.status(404).json({
        success: false,
        message: "Winner record not found"
      });
    }

    if (existingWinner.verification_status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Winner must be approved before payment"
      });
    }

    const { data, error } = await supabase
      .from("winners")
      .update({
        payout_status: "paid",
        paid_at: new Date().toISOString()
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Winner marked as paid",
      winner: data
    });
  } catch (error) {
    console.error("Mark winner paid error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to mark winner as paid"
    });
  }
};


// Admin: delete winner
const deleteWinner = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("winners")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({
      success: true,
      message: "Winner deleted successfully"
    });
  } catch (error) {
    console.error("Delete winner error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete winner"
    });
  }
};


module.exports = {
  getMyWinners,
  getWinnerById,
  getAllWinners,
  uploadWinnerProof,
  getWinnerProof,
  verifyWinner,
  markWinnerPaid,
  deleteWinner
};