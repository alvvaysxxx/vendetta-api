const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const generateProfileImage = require("./tghandlers/profile_image.js");
const User = require("./models/user.js");
const Gallery = require("./models/gallery.js");
const compression = require("compression");

const router = require("./router.js");

const API_KEY_BOT = "6855579648:AAF29wJqMxl_QCdy9RCjesGojgSduJxJrLY";

(async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
    );
  } catch (error) {
    console.error("Ошибка при подключении к MongoDB:", error);
  }
})();

const app = express();
app.use(express.json());
app.use(compression());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Content-Type", "application/json");
  next();
});
app.use("/", router);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  try {
    console.log("Сервер стартанул!!! Порт:", PORT);
  } catch (err) {
    console.error("Ошибка при запуске сервера:", err);
  }
});

module.exports = app;
