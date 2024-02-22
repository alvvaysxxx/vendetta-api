const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bot = require("../bot");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

function isWeekAgo(date) {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7); // Отнимаем 7 дней от текущей даты

  return date < weekAgo;
}

class ItemsHandler {
  async sendAnonymousMsg(req, res) {
    try {
      let { user } = req;
      let { destination, msg } = req.body;
      if (user.inventory["anonymousMsg"] === 0) {
        return res.status(403).json({ error: true });
      }
      let receiver = await User.findOne({
        tgusername: destination.split("@")[1],
      });
      if (!receiver) {
        return res.status(404).json({ error: true });
      }
      console.log(receiver.chatid);
      /* user.anonymousMsg -= 1;*/
      await bot.sendMessage(
        receiver.chatid,
        `🔔<b>Вам пришло анонимное сообщение!</b>\n\n${msg}`,
        {
          parse_mode: "HTML",
        }
      );
      user.inventory.anonymousMsg -= 1;
      await user.updateOne({
        $set: { inventory: user.inventory },
      });
      return res.status(200).json({ error: false });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
  async spin(req, res) {
    try {
      let { user } = req;
      if (!user.lastspin || isWeekAgo(user.lastspin)) {
        let prizes = [
          "unwarn",
          "nextLevel",
          "anonymousMsg",
          200,
          100,
          500,
          1000,
        ];
        let prize = prizes[Math.floor(Math.random() * prizes.length)];
        switch (prize) {
          case "unwarn":
            user.inventory.unwarn += 1;
            break;
          case "nextLevel":
            user.inventory.nextLevel += 1;
            break;
          case "anonymousMsg":
            user.inventory.anonymousMsg += 1;
            break;
          case 100:
            user.vendettix += 100;
            break;
          case 200:
            user.vendettix += 200;
            break;
          case 500:
            user.vendettix += 500;
            break;
        }
        user.lastspin = new Date();
        await user.updateOne({
          $set: {
            inventory: user.inventory,
            vendettix: user.vendettix,
            lastspin: user.lastspin,
          },
        });
        return res.status(200).json({ error: false, prize });
      } else {
        return res.status(403).json({ error: true });
      }
    } catch (err) {
      console.error(err);
      res.status(200).json({ error: true });
    }
  }
  async getTimeTillNextSpin(req, res) {
    try {
      let { user } = req;

      let endDate = new Date(user.lastspin);
      endDate.setDate(endDate.getDate() + 7);

      let currentDate = new Date();

      let difference = endDate - currentDate;

      // Конвертируем разницу в секунды
      let secondsDifference = Math.ceil(difference / 1000);
      res.status(200).json({ error: false, timeleft: secondsDifference });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }
}

module.exports = ItemsHandler;
