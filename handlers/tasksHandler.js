const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");
const axios = require("axios");
const bot = require("../bot");

const token = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

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
          console.log("Пользователь не подписан на канал");
          return res.status(200).json({ completed: false, error: false });
        }
      }
    } catch (err) {
      console.error("Произошла ошибка:", err.message);
      return res.status(500).json({ error: true, completed: false });
    }
  }
}

module.exports = TasksHandler;
