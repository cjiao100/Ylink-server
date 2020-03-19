const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordbookSchema = new Schema({
  wordList: {
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
