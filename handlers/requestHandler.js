const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Request = require("../models/request");
const bot = require("../bot");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class RequestHandler {
  async newRequest(req, res) {
    try {
      let { user } = req;
      let { request } = req.body;

      let potentialRequest = await Request.findOne({ performedBy: user._id });
      if (potentialRequest) {
        return res.status(403).json({ error: true });
      }

      let newRequest = new Request({
        1: request[1],
        2: request[2],
        3: request[3],
        4: request[4],
        5: request[5],
        6: request[6],
        7: request[7],
        8: request[8],
        9: request[9],
        10: request[10],
        performedBy: user._id,
      });

      await newRequest.save();
      await bot.sendMessage(
        user.chatid,
        "🔔 <b>Вы успешно подали заявку на вступление в клан</b>\nДожидайтесь ответа от администраторов.",
        {
          parse_mode: "HTML",
        }
      );
      await bot.sendMessage(
        "806166779",
        `🔔 <b>Заявка в клан!</b>\nЗаявка от: <a href = "https://t.me/${user.tgusername}">${user.tgname}</a>\n\nАнкета:\n1: ${request[1]}\n2: ${request[2]}\n3: ${request[3]}\n4: ${request[4]}\n5: ${request[5]}\n6: ${request[6]}\n7: ${request[7]}\n8: ${request[8]}\n9: ${request[9]}\n10: ${request[10]}\n\nЧто будем делать, Администратор?`,
        {
          parse_mode: "HTML",
          disable_web_page_preview: true,
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "✅ Принять",
                  callback_data: `acceptToClan ${user._id}`,
                },
                {
                  text: "❌ Отклонить",
                  callback_data: `rejectFromClan ${user._id}`,
                },
              ],
            ],
          },
        }
      );
      res.status(200).json({ error: false });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
}

module.exports = RequestHandler;
