const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema({
  planId: {
    type: Schema.Types.ObjectId,
  },
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
  createTime: {
    type: Date,
    default: Date.now(),
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('word', WordSchema);
