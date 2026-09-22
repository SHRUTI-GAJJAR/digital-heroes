const supabase = require("../config/supabase");

// GET ALL CHARITIES
const getCharities = async (req, res) => {
  try {
    const { search, featured, active } = req.query;

    let query = supabase
      .from("charities")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    if (featured !== undefined) {
      query = query.eq("is_featured", featured === "true");
    }

    if (active !== undefined) {
      query = query.eq("is_active", active === "true");
    }

    const { data: charities, error } = await query;

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      count: charities.length,
      charities
    });
  } catch (error) {
    console.error("Get charities error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching charities"
    });
  }
};


// GET SINGLE CHARITY
const getCharityById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: charity, error } = await supabase
      .from("charities")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found"
      });
    }

    return res.status(200).json({
      success: true,
      charity
    });
  } catch (error) {
    console.error("Get charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching charity"
    });
  }
};


// CREATE CHARITY
const createCharity = async (req, res) => {
  try {
    const {
      name,
      description,
      image_url,
      website_url,
      is_featured = false,
      is_active = true
    } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Name and description are required"
      });
    }

    const { data: charity, error } = await supabase
      .from("charities")
      .insert({
        name: name.trim(),
        description: description.trim(),
        image_url: image_url || null,
        website_url: website_url || null,
        is_featured: Boolean(is_featured),
        is_active: Boolean(is_active)
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Charity created successfully",
      charity
    });
  } catch (error) {
  console.error("CREATE CHARITY ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Server error while creating charity",
    error: error.message
  });
}
}
//   catch (error) {
//     console.error("Create charity error:", error);

//     return res.status(500).json({
//       success: false,
//       message: "Server error while creating charity"
//     });
//   }
// };


// UPDATE CHARITY
const updateCharity = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      image_url,
      website_url,
      is_featured,
      is_active
    } = req.body;

    const updates = {};

    if (name !== undefined) {
      updates.name = name.trim();
    }

    if (description !== undefined) {
      updates.description = description.trim();
    }

    if (image_url !== undefined) {
      updates.image_url = image_url;
    }

    if (website_url !== undefined) {
      updates.website_url = website_url;
    }

    if (is_featured !== undefined) {
      updates.is_featured = Boolean(is_featured);
    }

    if (is_active !== undefined) {
      updates.is_active = Boolean(is_active);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields provided for update"
      });
    }

    const { data: charity, error } = await supabase
      .from("charities")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Charity updated successfully",
      charity
    });
  } catch (error) {
    console.error("Update charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating charity"
    });
  }
};


// DELETE CHARITY
const deleteCharity = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: charity, error: findError } = await supabase
      .from("charities")
      .select("id")
      .eq("id", id)
      .single();

    if (findError || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found"
      });
    }

    const { error } = await supabase
      .from("charities")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Charity deleted successfully"
    });
  } catch (error) {
    console.error("Delete charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while deleting charity"
    });
  }
};


// TOGGLE CHARITY ACTIVE STATUS
const toggleCharityStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: charity, error: findError } = await supabase
      .from("charities")
      .select("id, is_active")
      .eq("id", id)
      .single();

    if (findError || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found"
      });
    }

    const { data: updatedCharity, error } = await supabase
      .from("charities")
      .update({
        is_active: !charity.is_active
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Charity status updated successfully",
      charity: updatedCharity
    });
  } catch (error) {
    console.error("Toggle charity status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating charity status"
    });
  }
};


// TOGGLE FEATURED STATUS
const toggleFeaturedCharity = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: charity, error: findError } = await supabase
      .from("charities")
      .select("id, is_featured")
      .eq("id", id)
      .single();

    if (findError || !charity) {
      return res.status(404).json({
        success: false,
        message: "Charity not found"
      });
    }

    const { data: updatedCharity, error } = await supabase
      .from("charities")
      .update({
        is_featured: !charity.is_featured
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return res.status(200).json({
      success: true,
      message: "Charity featured status updated successfully",
      charity: updatedCharity
    });
  } catch (error) {
    console.error("Toggle featured charity error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating featured status"
    });
  }
};


module.exports = {
  getCharities,
  getCharityById,
  createCharity,
  updateCharity,
  deleteCharity,
  toggleCharityStatus,
  toggleFeaturedCharity
};