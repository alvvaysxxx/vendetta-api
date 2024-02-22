const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class AccountHandler {
  async register(req, res) {
    try {
      const { token, username, friendCode, tgname, tgusername } = req.body;
      const chatid = jwt.verify(token, "urionzzz");
      const candidate = await User.findOne({ chatid: chatid.chatid });

      if (candidate) {
        return res.status(401).json({ authenticated: false });
      }

      const user = new User({
        username,
        chatid: chatid,
        tgname,
        friendCode,
        tgusername,
      });
      await user.save();
      return res.status(200).json({ authenticated: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
  async checkAccount(req, res) {
    try {
      const { user } = req;
      if (user) {
        return res.status(200).json({ exists: true });
      } else {
        return res.status(200).json({ exists: false });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
  async myProfile(req, res) {
    try {
      const { user } = req;
      res.status(200).json({ user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }

  async changeProfile(req, res) {
    try {
      const { user } = req;
      const { avatar, friendCode, username } = req.body;
      const currentUser = await User.findOne({ chatid: user.chatid });
      if (avatar) {
        currentUser.avatarUrl = avatar;
      }
      if (friendCode) {
        currentUser.friendCode = friendCode;
      }
      if (username) {
        currentUser.username = username;
      }

      res.status(200).json({ error: false });

      await currentUser.save();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }
}

module.exports = AccountHandler;
