const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");
const axios = require("axios");
const bot = require("../bot");

const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { Api } = require("telegram/tl");
const input = require("input");

const token = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

const apiId = 20436441;
const apiHash = "a3c4c7df5fbf89439b9a01c2d1de524c";
const stringSession = new StringSession(
  "1AgAOMTQ5LjE1NC4xNjcuNTABu3MHWSmBj+xu+2D3QNKJlBO1/IofPjW81c4uTvJOeUhHfZHtyZaLLdgzutjMsfMghzXwlvRURgphd1+88iwpZDW21cBtOJ1Hw4zV6pLtdOEuWHJ6L02OLK+2pvLZHumzjjPx4L5G9wYar9R3CuRVwUrymOGAR4stOwvbsBuBD/iZ9gPbvmy+ljq8/oVmZgojqF4DMgac6Vh1m1GVNPhTLs7Pi8J/TOCPFlIdoU60saddEu6uWW0EIPpgUZRKmsnf5BgPERkseaLJHr6OLAjY9CRt1uPAJBB0CRIQ7RCIhfwBljz1LOZTc5D4xbJMPeG/gbPoHItfWx004DQAOwhtc68="
); // fill this later with the value from session.save()

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class TasksHandler {
  async createTask(req, res) {
    const { user } = req;
    const { title, description, vendettix, xp, type, channel } = req.body;
    if (user.role !== "Администратор") {
      return res.status(403).json({ error: true });
    }
    let newTask = new Task({
      title,
      description,
      vendettix,
      xp,
      type,
      channel,
    });
    await newTask.save();
    return res.status(200).json({ error: false });
  }

  async getTasks(req, res) {
    try {
      let { user } = req;
      console.log(user);
      let tasks = await Task.find({ completedBy: { $ne: user._id } });

      return res.status(200).json(tasks);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: true });
    }
  }

  async completeTask(req, res) {
    try {
      const { user } = req;
      const { task_id } = req.body;
      const task = await Task.findById(task_id);
      console.log(task);
      // ! Checks
      if (task.type === "telegram_sub") {
        const channel = task.channel;
        const userid = user.chatid;
        const apiUrl = `https://api.telegram.org/bot${token}/getChatMember?chat_id=@${channel}&user_id=${userid}`;

        const response = await axios.get(apiUrl);
        const chatMember = response.data.result;

        if (
          chatMember.status === "member" ||
          chatMember.status === "administrator" ||
          chatMember.status === "creator"
        ) {
          console.log("Пользователь подписан на канал");
          task.completedBy.push(user._id);
          user.vendettix += task.vendettix;
          user.xp += task.xp;
          await bot.sendMessage(
            user.chatid,
            `🔔 <b>Вы выполнили задание!</b>\nНаграды:\n\n${task.vendettix} vendettix\n${task.xp} xp`,
            {
              parse_mode: "HTML",
            }
          );
          await user.save();
          await task.save();
          return res.status(200).json({ completed: true, error: false });
        } else {
          console.log("Отправил ответ");
          return res.status(200).json({ completed: false, error: false });
        }
      }

      if (task.type === "boost") {
        let username = user.tgusername;

        const client = new TelegramClient(stringSession, apiId, apiHash, {
          connectionRetries: 5,
        });
        console.log(client);
        await client.start({
          phoneNumber: async () =>
            await input.text("Please enter your number: "),
          password: async () =>
            await input.text("Please enter your password: "),
          phoneCode: async () =>
            await input.text("Please enter the code you received: "),
          onError: (err) => console.log(err),
        });

        const result = await client.invoke(
          new Api.premium.GetBoostsList({
            peer: "-1001812423876",
            offset: "0",
          })
        );

        await client.disconnect();
        let boosts = result.boosts;
        let users = result.users;
        let boostersInfo = [];

        for (let i = 0; i < users.length; i++) {
          boostersInfo[i] = {
            username: users[i].username,
            amount: boosts[i].multiplier,
          };
        }

        for (let i = 0; i < boostersInfo.length; i++) {
          if (username == boostersInfo[i].username) {
            await bot.sendMessage(
              user.chatid,
              `🔔 <b>Вы выполнили задание!</b>\nНаграды:\n\n${
                task.vendettix * boostersInfo[i].amount
              } vendettix\n${task.xp * boostersInfo[i].amount} xp`,
              {
                parse_mode: "HTML",
              }
            );

            task.completedBy.push(user._id);
            user.vendettix += task.vendettix * boostersInfo[i].amount;
            user.xp += task.xp * boostersInfo[i].amount;

            await user.save();
            await task.save();

            console.log("Отправил ответ");
            return res.status(200).json({ error: false });
          }
        }
        console.log("Отправил ответ");
        return res.status(403).json({ error: true });
      }
    } catch (err) {
      console.error("Произошла ошибка:", err);
      return res.status(500).json({ error: true, completed: false });
    }
  }
}

module.exports = TasksHandler;
