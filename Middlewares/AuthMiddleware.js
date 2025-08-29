require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports.userVerification = (req, res, next) => {
  const token = req.cookies.token;
  if (!token)
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: Invalid token" });
    req.user = decoded.id;
    next();
  });
};
