const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userPostSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    postId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    star: {
      type: Boolean,
      default: false,
    },
    awesome: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('user-post', userPostSchema);
