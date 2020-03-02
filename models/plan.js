const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  wordlist: {
    type: [Schema.Types.ObjectId],
    default: [],
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('article', planSchema);
