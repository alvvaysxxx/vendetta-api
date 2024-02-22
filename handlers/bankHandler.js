const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bot = require("../bot");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class BankHandler {
  async getBalance(req, res) {
    try {
      const { user } = req;
      res
        .status(200)
        .json({ vendettix: user.vendettix, avacoins: user.avacoins });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }

  async cardDetails(req, res) {
    try {
      const { user } = req;
      return res
        .status(200)
        .json({ error: false, number: user._id, cardholder: user.tgname });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }

  async convert(req, res) {
    try {
      const { user } = req;
      const { amount } = req.body;

      console.log(user);
      if (user.vendettix < amount) {
        /*4fun*/ return res.status(418).json({ error: true });
      }
      let converted = amount / 5;
      let rest = amount % 5;
      console.log(converted);
      user.vendettix -= amount + rest;
      user.avacoins += converted;
      await user.save();
      return res.status(200).json({ error: false, converted });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }

  async sendVendettix(req, res) {
    try {
      const { user } = req;
      const { receiverId, amount } = req.body;

      if (user.vendettix < amount) {
        return res.status(400).json({ error: true });
      }
      const receiver = await User.findById(receiverId);
      console.log(receiver, amount);
      receiver.vendettix = receiver.vendettix + amount;
      user.vendettix -= amount;
      await receiver.save();
      await user.save();

      await bot.sendMessage(
        receiver.chatid,
        `🔔 <b>Уведомление!</b>\nПользователь <a href = "https://t.me/${user.tgusername}">${user.username}</a> отправил вам ${amount} vendettix. Проверить свой баланс вы сможете <a href = "https://c2kq4hl1-5173.euw.devtunnels.ms/bank">на сайте</a>.`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }
      );

      return res.status(200).json({ error: false });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
}

module.exports = BankHandler;
