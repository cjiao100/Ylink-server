const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    wordList: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('plan', planSchema);
