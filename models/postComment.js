const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postCommentSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    content: {
      type: String,
      default: '',
    },
    father: {
      type: Schema.Types.ObjectId,
      default: -1,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('post-comment', postCommentSchema);
