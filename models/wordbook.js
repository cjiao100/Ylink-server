const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WordbookSchema = new Schema(
  {
    wordList: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('wordbook', WordbookSchema);
