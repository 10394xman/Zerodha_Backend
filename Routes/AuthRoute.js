const {
  Signup,
  Login,
  ForgotPassword,
  Logout,
} = require("../Controllers/AuthController");
const { userVerification } = require("../Middlewares/AuthMiddleware");
const router = require("express").Router();
const { UserModel } = require('../model/UserModel');

// router.post('/',userVerification)
router.post("/signup", Signup);
router.post("/login", Login);
router.post("/forgot-password", ForgotPassword);
router.post("/logout", Logout);
router.get("/verify", userVerification, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    const user = await UserModel.findById(req.user);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
