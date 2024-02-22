const jwt = require("jsonwebtoken");

const User = require("../models/user");

async function authentication(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.decode(token, "urionzzz");
    const currentUser = await User.findOne({
      chatid: decodedToken,
    });
    req.user = currentUser;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Unauthorized" });
  }
}

module.exports = authentication;
