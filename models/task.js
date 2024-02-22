const { model, Schema } = require("mongoose");

const Task = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  vendettix: {
    type: Number,
    required: true,
  },
  xp: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  channel: {
    type: String,
  },
  completedBy: {
    type: Array,
    default: [],
  },
});

module.exports = model("task", Task);
