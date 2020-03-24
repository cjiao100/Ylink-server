const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
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
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('comment', commentSchema);
