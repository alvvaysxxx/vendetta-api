const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bot = require("../bot");
const Gallery = require("../models/gallery");

mongoose.connect(
  "mongodb+srv://urionzzz:79464241@cluster0.o5sciwm.mongodb.net/?retryWrites=true&w=majority"
);

class GalleryHandler {
  async getGallery(req, res) {
    try {
      let images = await Gallery.find({}, { src: 1, _id: 0 });
      res.status(200).json(images);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: true });
    }
  }
}

module.exports = GalleryHandler;
