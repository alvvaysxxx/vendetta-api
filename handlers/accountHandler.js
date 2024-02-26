const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bot = require("../bot");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class AccountHandler {
  async register(req, res) {
    try {
      const { username, friendCode, tgname, tgusername, chatid } = req.body;
      const candidate = await User.findOne({ tgusername });

      if (candidate) {
        return res.status(401).json({ authenticated: false });
      }

      const user = new User({
        username,
        chatid,
        tgname,
        friendCode,
        tgusername,
      });
      await user.save();
      await bot.sendMessage(
        chatid,
        `<b>✅ Вы успешно создали аккаунт на нашей платформе!\nТеперь, у вас открыты все возможности в приложении</b>`,
        {
          parse_mode: "HTML",
        }
      );
      return res.status(200).json({ authenticated: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
  async checkAccount(req, res) {
    try {
      const { username } = req.body;
      let user = await User.findOne({ tgusername: username });
      if (user) {
        res
          .status(200)
          .json({ error: false, token: jwt.sign(username, "urionzzz") });
      } else {
        res.status(201).json({ error: true });
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

  async search(req, res) {
    try {
      let { query } = req.body;
      const regex = new RegExp(query, "i"); // 'i' означает, что поиск будет регистронезависимым
      const users = await User.find({ username: regex });
      res.status(200).json({ error: false, users });
    } catch (err) {
      res
        .status(500)
        .json({ error: true, message: "Произошла ошибка на стороне сервера" });
    }
  }
}

module.exports = AccountHandler;
