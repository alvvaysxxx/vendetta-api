const mongoose = require("mongoose");
const User = require("../models/user");
const bot = require("../bot");

class MarriageHandler {
  async marry(req, res) {
    try {
      let { user } = req;
      let { receiver } = req.body;

      if (!receiver) {
        return res
          .status(400)
          .json({ error: true, message: "Этот пользователь не найден" });
      }

      let candidate = await User.findOne({ username: receiver });

      if (!candidate) {
        return res
          .status(400)
          .json({ error: true, message: "Этот пользователь не найден" });
      }

      if (user.username == receiver.username) {
        return res.status(400).json({
          error: true,
          message: "Вы не можете заключить брак с самим собой!",
        });
      }

      if (user.marriedWith || candidate.marriedWith) {
        return res
          .status(403)
          .json({ error: true, message: "Кто-то из вас уже состоит в браке!" });
      }

      await bot.sendMessage(
        user.chatid,
        `🔔 <b>Уведомление!</b>\nВы отправили запрос о бракосочетании <a href = "${candidate.tgusername}">${candidate.username}</a>. Мы уведомим вас, как только поступит ответ от ${candidate.username}`,
        {
          parse_mode: "HTML",
        }
      );
      await bot.sendMessage(
        candidate.chatid,
        `🔔 <b>Уведомление!</b>\n${user.username} сделал вам предложение о браке!`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Принять",
                  callback_data: `acceptMarriage ${user._id}`,
                },
                {
                  text: "❌ Отклонить",
                  callback_data: `rejectMarriage ${user._id}`,
                },
              ],
            ],
          },
        }
      );

      return res.status(200).json({ error: false });
    } catch (err) {
      console.error(err);
      return res.status(50).json({
        error: false,
        message: "Произошла непредвиденная ошибка, обратитесь к администратору",
      });
    }
  }

  async unmarry(req, res) {
    try {
      let { user } = req;

      if (user.marriedWith == "") {
        return res
          .status(400)
          .json({ error: true, message: "Вы не находитесь в браке!" });
      }

      let partner = await User.findById(user.marriedWith);

      if (!partner) {
        return res
          .status(400)
          .json({ error: true, message: "Партнер не найден." });
      }

      user.marriedWith = "";
      partner.marriedWith = "";

      await user.save();
      await partner.save();

      await bot.sendMessage(
        user.chatid,
        `🔔 <b>Уведомление!</b>\nВы успешно расторгнули брак с <a href = "https://t.me/${partner.tgusername}">${partner.username}</a> 💔`,
        {
          parse_mode: "HTML",
        }
      );

      await bot.sendMessage(
        partner.chatid,
        `🔔 <b>Уведомление!</b>\nК сожалению, <a href = "https://t.me/${user.tgusername}">${user.username}</a> расторгнул брак 💔`,
        {
          parse_mode: "HTML",
        }
      );

      return res
        .status(200)
        .json({ error: false, message: "Брак успешно расторгнут" });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        error: true,
        message: "Произошла непредвиденная ошибка, обратитесь к администратору",
      });
    }
  }

  async myMarriage(req, res) {
    try {
      const { user } = req;

      let partner = await User.findById(user.marriedWith);

      if (!partner) {
        return res
          .status(404)
          .json({ error: true, message: "Партнер не найден" });
      }
      return res.status(200).json({ error: false, partner });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }

  async marriages(req, res) {
    try {
      // Find all users with a non-empty marriedWith field
      const users = await User.find({ marriedWith: { $ne: "" } });

      // Prepare the response as an array of marriage objects
      const marriages = await Promise.all(
        users.map(async (user) => {
          try {
            const marriedWith = await User.findById(user.marriedWith);
            return {
              partner1: {
                id: user._id,
                avatarUrl: user.avatarUrl,
                username: user.username,
                tgusername: user.tgusername,
              },
              partner2: {
                id: marriedWith._id,
                avatarUrl: marriedWith.avatarUrl,
                username: marriedWith.username,
                tgusername: marriedWith.tgusername,
              },
            };
          } catch (error) {
            console.error(`Error fetching marriage details: ${error}`);
            // You might want to handle the error or return some default value
            return null;
          }
        })
      );

      const uniqueMarriages = [];

      const seenPairs = new Set();

      marriages.forEach((marriage) => {
        const sortedIds = [marriage.partner1.id, marriage.partner2.id].sort();
        const pair = sortedIds.join("_");
        if (!seenPairs.has(pair)) {
          uniqueMarriages.push(marriage);
          seenPairs.add(pair);
        }
      });

      // Send the JSON response
      res.status(200).json({ error: false, marriages: uniqueMarriages });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }
}

module.exports = MarriageHandler;
