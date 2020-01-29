const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    required: true,
  },
  identity: {
    type: String,
    default: '0',
  },
  createDate: {
    type: Date,
    default: Date.now(),
  },
  updateDate: {
    type: Date,
    default: Date.now(),
  },
  lastDate: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('users', UserSchema);
