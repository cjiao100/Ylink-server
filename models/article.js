const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  video: {
    type: String,
  },
  browse: {
    type: String,
    default: 0,
  },
  comment: {
    type: String,
    default: 0,
  },
  awesome: {
    type: String,
    default: 0,
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('article', articleSchema);
