const supabase = require("../config/supabase");

const {
  createSubscriptionDonation
} = require("../services/donationService");

// GET MY SUBSCRIPTIONS
const getMySubscriptions = async (req, res) => {
  try {
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        charities (
          id,
          name,
          description,
          image_url,
          website_url
        )
      `)
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching subscriptions"
    });
  }
};


// GET SINGLE SUBSCRIPTION
const getSubscriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select(`
        *,
        charities (
          id,
          name,
          description,
          image_url,
          website_url
        )
      `)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .single();

    if (error || !subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    return res.status(200).json({
      success: true,
      subscription
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching subscription"
    });
  }
};


// GET ALL SUBSCRIPTIONS - ADMIN
const getAllSubscriptions = async (req, res) => {
  try {
    const { status, plan_type } = req.query;

    let query = supabase
      .from("subscriptions")
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
        )
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (plan_type) {
      query = query.eq("plan_type", plan_type);
    }

    const { data: subscriptions, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: subscriptions.length,
      subscriptions
    });
  } catch (error) {
    console.error("Get all subscriptions error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching subscriptions"
    });
  }
};


// CREATE SUBSCRIPTION
const createSubscription = async (req, res) => {
  try {
    const {
      plan_type,
      amount,
      currency = "GBP",
      charity_id,
      charity_percentage = 10,
      renewal_date
    } = req.body;

    // Validate plan
    if (!["monthly", "yearly"].includes(plan_type)) {
      return res.status(400).json({
        success: false,
        message: "Plan type must be monthly or yearly"
      });
    }

    // Validate amount
    const subscriptionAmount = Number(amount);

    if (
      !Number.isFinite(subscriptionAmount) ||
      subscriptionAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Subscription amount must be greater than 0"
      });
    }

    // Validate charity percentage
    const percentage = Number(charity_percentage);

    if (
      !Number.isFinite(percentage) ||
      percentage < 10 ||
      percentage > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Charity contribution must be between 10% and 100%"
      });
    }

    // Charity is required for subscription
    if (!charity_id) {
      return res.status(400).json({
        success: false,
        message: "Charity selection is required"
      });
    }

    // Verify charity exists and is active
    const { data: charity, error: charityError } = await supabase
      .from("charities")
      .select("id, name, is_active")
      .eq("id", charity_id)
      .single();

    if (charityError || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found"
      });
    }

    if (!charity.is_active) {
      return res.status(400).json({
        success: false,
        message: "Selected charity is not active"
      });
    }

    // Check for existing active subscription
    const { data: existingSubscription, error: existingError } =
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", req.user.id)
        .eq("status", "active")
        .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existingSubscription) {
      return res.status(409).json({
        success: false,
        message: "User already has an active subscription"
      });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: req.user.id,
        plan_type,
        amount: subscriptionAmount,
        currency,
        status: "active",
        charity_id,
        charity_percentage: percentage,
        renewal_date: renewal_date || null
      })
      .select(`
        *,
        charities (
          id,
          name,
          description,
          image_url,
          website_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    // Create charity contribution
    await createSubscriptionDonation(subscription);

    return res.status(201).json({
      success: true,
      message: "Subscription created successfully",
      subscription
    });
  } catch (error) {
    console.error("Create subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while creating subscription"
    });
  }
};


// UPDATE SUBSCRIPTION
const updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      plan_type,
      amount,
      charity_id,
      charity_percentage,
      renewal_date
    } = req.body;

    // Make sure subscription belongs to current user
    const { data: existingSubscription, error: findError } =
      await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (findError || !existingSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const updates = {};

    if (plan_type !== undefined) {
      if (!["monthly", "yearly"].includes(plan_type)) {
        return res.status(400).json({
          success: false,
          message: "Plan type must be monthly or yearly"
        });
      }

      updates.plan_type = plan_type;
    }

    if (amount !== undefined) {
      const subscriptionAmount = Number(amount);

      if (
        !Number.isFinite(subscriptionAmount) ||
        subscriptionAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Subscription amount must be greater than 0"
        });
      }

      updates.amount = subscriptionAmount;
    }

    if (charity_id !== undefined) {
      const { data: charity, error: charityError } =
        await supabase
          .from("charities")
          .select("id, is_active")
          .eq("id", charity_id)
          .single();

      if (charityError || !charity) {
        return res.status(404).json({
          success: false,
          message: "Charity not found"
        });
      }

      if (!charity.is_active) {
        return res.status(400).json({
          success: false,
          message: "Selected charity is not active"
        });
      }

      updates.charity_id = charity_id;
    }

    if (charity_percentage !== undefined) {
      const percentage = Number(charity_percentage);

      if (
        !Number.isFinite(percentage) ||
        percentage < 10 ||
        percentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Charity contribution must be between 10% and 100%"
        });
      }

      updates.charity_percentage = percentage;
    }

    if (renewal_date !== undefined) {
      updates.renewal_date = renewal_date;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select(`
        *,
        charities (
          id,
          name,
          description,
          image_url,
          website_url
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Subscription updated successfully",
      subscription
    });
  } catch (error) {
    console.error("Update subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating subscription"
    });
  }
};


// CANCEL SUBSCRIPTION
const cancelSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: existingSubscription, error: findError } =
      await supabase
        .from("subscriptions")
        .select("id, status")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (findError || !existingSubscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    if (existingSubscription.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled"
      });
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .update({
        status: "cancelled",
        cancelled_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("user_id", req.user.id)
      .select(`
        *,
        charities (
          id,
          name
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
      subscription
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while cancelling subscription"
    });
  }
};


// UPDATE SUBSCRIPTION STATUS - ADMIN
const updateSubscriptionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "active",
      "inactive",
      "cancelled",
      "expired",
      "past_due"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription status"
      });
    }

    const updates = {
      status
    };

    if (status === "cancelled") {
      updates.cancelled_at = new Date().toISOString();
    }

    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .update(updates)
      .eq("id", id)
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
        )
      `)
      .single();

    if (error || !subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Subscription status updated successfully",
      subscription
    });
  } catch (error) {
    console.error("Update subscription status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating subscription status"
    });
  }
};


// DELETE SUBSCRIPTION
const deleteSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: subscription, error: findError } =
      await supabase
        .from("subscriptions")
        .select("id")
        .eq("id", id)
        .eq("user_id", req.user.id)
        .single();

    if (findError || !subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found"
      });
    }

    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", id)
      .eq("user_id", req.user.id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Subscription deleted successfully"
    });
  } catch (error) {
    console.error("Delete subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting subscription"
    });
  }
};


module.exports = {
  getMySubscriptions,
  getSubscriptionById,
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  updateSubscriptionStatus,
  deleteSubscription
};