const jwt = require("jsonwebtoken");

const User = require("../models/user");

async function authentication(req, res, next) {
  try {
    const token = req.headers.authorization;
    const decodedToken = jwt.decode(token, "urionzzz");
    console.log(decodedToken);
    const currentUser = await User.findOne({
      tgusername: decodedToken,
    });
    if (!currentUser) return res.status(401).json({ error: true });
    req.user = currentUser;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Unauthorized" });
  }
}

module.exports = authentication;
