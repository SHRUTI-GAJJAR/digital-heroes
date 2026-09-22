const supabase = require("../config/supabase");

const {
  createIndependentDonation
} = require("../services/donationService");


// GET MY DONATIONS
const getMyDonations = async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("donations")
        .select(`
          *,
          charities (
            id,
            name,
            image_url,
            website_url
          )
        `)
        .eq("user_id", req.user.id)
        .order("created_at", {
          ascending: false
        });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      donations: data
    });
  } catch (error) {
    console.error(
      "Get my donations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// GET DONATION BY ID
const getDonationById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: donation, error } =
      await supabase
        .from("donations")
        .select(`
          *,
          charities (
            id,
            name,
            image_url,
            website_url
          )
        `)
        .eq("id", id)
        .eq("user_id", req.user.id)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    return res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error(
      "Get donation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// CREATE INDEPENDENT DONATION
const createDonation = async (req, res) => {
  try {
    const {
      charity_id,
      amount
    } = req.body;

    if (!charity_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Charity and donation amount are required"
      });
    }

    const donation =
      await createIndependentDonation({
        userId: req.user.id,
        charityId: charity_id,
        amount
      });

    return res.status(201).json({
      success: true,
      message:
        "Donation created successfully",
      donation
    });
  } catch (error) {
    console.error(
      "Create donation error:",
      error
    );

    if (
      error.message === "Charity not found" ||
      error.message === "Charity is not active" ||
      error.message ===
        "Donation amount must be greater than 0"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ADMIN - GET ALL DONATIONS
const getAllDonations = async (req, res) => {
  try {
    const { data, error } =
      await supabase
        .from("donations")
        .select(`
          *,
          users (
            id,
            name,
            email
          ),
          charities (
            id,
            name
          ),
          subscriptions (
            id,
            plan_type,
            amount,
            charity_percentage
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
      donations: data
    });
  } catch (error) {
    console.error(
      "Get all donations error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ADMIN - GET DONATION BY ID
const getAdminDonationById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const { data: donation, error } =
      await supabase
        .from("donations")
        .select(`
          *,
          users (
            id,
            name,
            email
          ),
          charities (
            id,
            name
          ),
          subscriptions (
            id,
            plan_type,
            amount,
            charity_percentage
          )
        `)
        .eq("id", id)
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found"
      });
    }

    return res.status(200).json({
      success: true,
      donation
    });
  } catch (error) {
    console.error(
      "Get admin donation error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


module.exports = {
  getMyDonations,
  getDonationById,
  createDonation,
  getAllDonations,
  getAdminDonationById
};