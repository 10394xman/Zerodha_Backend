const { UserModel } = require("../model/UserModel");
const { createSecretToken } = require("../util/SecretToken");
const bcrypt = require("bcryptjs");

module.exports.Signup = async (req, res) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    // const hashedPassword = await bcrypt.hash(password, 10);
    const user = await UserModel.create({
      email,
      password: password,
      username,
      createdAt,
    });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      // prevents client-side JavaScript from accessing the cookie through document.cookie. This is crucial because it stops malicious scripts (from cross-site scripting or XSS attacks)
      httpOnly: true, // set to true in production
      // secure: true, // uncomment if using HTTPS
    });
    res.status(201).json({
      message: "User signed in successfully",
      success: true,
      user, // <-- include the user object
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.json({ message: "All fields are required" });
    }
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.json({ message: "Incorrect password or email" });
    }
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      const token = createSecretToken(user._id);
      res.cookie("token", token, {
        httpOnly: true, //so that client-side scripts cannot access it (prevents XSS attacks).
        // secure: true, // enable on production with HTTPS
        sameSite: "lax", // or "strict"
        maxAge: 24 * 60 * 60 * 1000, // 1 day expiry, adjust as needed
        path: "/",
      });
      res.status(200).json({
        message: "User logged in successfully",
        success: true,
        user, // <-- include the user object
      });
    } else {
      res.status(401).json({ message: "Invalid credentials", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.ForgotPassword = async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) return res.json({ message: "User not found" });
    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();
    res.json({ success: true, message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.Logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
  });
  res.json({ success: true, message: "Logged out successfully" });
};
