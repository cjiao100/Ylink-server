const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  articleId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  commentId: {
    type: Schema.Types.ObjectId,
  },
  content: {
    type: String,
    default: '',
  },
  children: {
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

module.exports = mongoose.model('comment', commentSchema);
