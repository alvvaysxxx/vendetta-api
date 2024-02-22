const { model, Schema } = require("mongoose");

const Gallery = new Schema({
  src: {
    type: String,
  },
});

module.exports = model("gallery", Gallery);
