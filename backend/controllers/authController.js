const bcrypt = require("bcryptjs");

const supabase = require("../config/supabase");
const generateToken = require("../utils/generateToken");

// ============================================================
// REGISTER USER
// ============================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const { data: user, error: createUserError } = await supabase
      .from("users")
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        password_hash: passwordHash
      })
      .select("id, name, email, role, is_active, created_at")
      .single();

    if (createUserError) {
      throw createUserError;
    }

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
};


// ============================================================
// LOGIN USER
// ============================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (userError) {
      throw userError;
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive"
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at
    };

    const token = generateToken(safeUser);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser
    });
  } catch (error) {
  console.error("LOGIN ERROR:", error);

  return res.status(500).json({
    success: false,
    message: "Server error during login",
    error: error.message
  });
}
}


// ============================================================
// GET CURRENT USER
// ============================================================

const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    console.error("Get me error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// ============================================================
// TEMPORARY ADMIN SETUP
// ============================================================

const setupAdmin = async (req, res) => {
  try {
    const setupKey = req.headers["x-admin-setup-key"];

    if (!setupKey || setupKey !== process.env.ADMIN_SETUP_KEY) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin setup key"
      });
    }

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingUser, error: existingUserError } =
      await supabase
        .from("users")
        .select("id, role")
        .eq("email", normalizedEmail)
        .maybeSingle();

    if (existingUserError) {
      throw existingUserError;
    }

    // If user already exists, promote that user to admin
    if (existingUser) {
      const { data: updatedUser, error: updateError } =
        await supabase
          .from("users")
          .update({
            role: "admin",
            is_active: true
          })
          .eq("id", existingUser.id)
          .select("id, name, email, role, is_active, created_at")
          .single();

      if (updateError) {
        throw updateError;
      }

      return res.status(200).json({
        success: true,
        message: "Existing user promoted to admin successfully",
        user: updatedUser
      });
    }

    // Create new admin
    const passwordHash = await bcrypt.hash(password, 10);

    const { data: adminUser, error: createAdminError } =
      await supabase
        .from("users")
        .insert({
          name: name.trim(),
          email: normalizedEmail,
          password_hash: passwordHash,
          role: "admin",
          is_active: true
        })
        .select("id, name, email, role, is_active, created_at")
        .single();

    if (createAdminError) {
      throw createAdminError;
    }

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      user: adminUser
    });
  } catch (error) {
    console.error("Setup admin error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during admin setup"
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getMe,
  setupAdmin
};