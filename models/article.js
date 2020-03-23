const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
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
      type: [Schema.Types.ObjectId],
      default: [],
    },
    comment: {
      type: [Object],
      default: [],
    },
    awesome: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('article', articleSchema);
