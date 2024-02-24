const mongoose = require("mongoose");
const User = require("../models/user");
const bot = require("../bot");

class MarriageHandler {
  async marry(req, res) {
    try {
      let { user } = req;
      let { receiver } = req.body;

      if (!receiver) {
        return res.status(400).json({ error: true });
      }

      let candidate = await User.findOne({ username: receiver });

      if (!candidate) {
        return res.status(400).json({ error: true });
      }

      if (user.marriedWith || candidate.marriedWith) {
        return res.status(403).json({ error: true });
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
    }
  }
}

module.exports = MarriageHandler;
