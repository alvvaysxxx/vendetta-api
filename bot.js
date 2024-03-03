const TelegramBot = require("node-telegram-bot-api");

const API_KEY_BOT = "7033176556:AAFjD9Vns3shJ0hve7znsDiVIl3oEU5JQtI";

const commands = [
  {
    command: "start",
    description: "Запуск бота",
  },
  {
    command: "profile",
    description: "Ваш профиль",
  },
  {
    command: "help",
    description: "Раздел помощи",
  },
];

const bot = new TelegramBot(API_KEY_BOT, {});

module.exports = bot;
