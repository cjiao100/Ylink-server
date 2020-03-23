const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordSchema = new Schema(
  {
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
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('word', WordSchema);
