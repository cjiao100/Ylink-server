const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordbookSchema = new Schema({
  query: {
    type: String,
    require: true,
  },
  translation: {
    type: [String],
    required: true,
  },
  basic: {
    type: Object,
    required: true,
  },
  web: {
    type: [Object],
    required: true,
  },
  users: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('wordbook', WordbookSchema);
