const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const topicSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    browse: {
      type: Number,
      default: 0,
    },
    postList: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('topic', topicSchema);
