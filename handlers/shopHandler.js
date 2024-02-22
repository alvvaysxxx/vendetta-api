const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class ShopHandler {
  async getProducts(req, res) {
    try {
      // name & price
      res.status(200).json({ unwarn: 200, anonymousMsg: 50, nextLevel: 250 });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }

  async buyProduct(req, res) {
    async function buy({ item, price, user }) {
      try {
        if (user.vendettix > price) {
          user.inventory[item] = user.inventory[item] + 1;
          user.vendettix -= price;
          console.log(user);
          await user.updateOne({
            $set: { inventory: user.inventory, vendettix: user.vendettix },
          });
          return true; // Успешно завершили покупку
        } else {
          return false; // Не хватает денег
        }
      } catch (err) {
        console.error(err);
        return false; // Произошла ошибка при сохранении
      }
    }

    try {
      console.log("request");
      let { user } = req;
      let { product } = req.body;
      let result;
      switch (product) {
        case "unwarn":
          result = await buy({ item: "unwarn", price: 200, user });
          break;
        case "anonymousMsg":
          result = await buy({ item: "anonymousMsg", price: 50, user });
          break;
        case "nextLevel":
          result = await buy({ item: "nextLevel", price: 250, user });
          break;
      }
      if (result) {
        res.status(200).json({ error: false });
      } else {
        res.status(403).json({ error: true });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: true });
    }
  }
}

module.exports = ShopHandler;
