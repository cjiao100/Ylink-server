const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const onlineSchema = new Schema({
  date: {
    type: Date,
    required: true,
  },
  online: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model('online', onlineSchema);
