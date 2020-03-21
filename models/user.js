const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },
    avatar: {
      type: String,
      required: true,
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
    // 性别
    gender: {
      type: String,
      default: '0',
    },
    // 单词本
    wordbook: {
      type: Schema.Types.ObjectId,
    },
    // 计划
    plan: {
      type: Schema.Types.ObjectId,
    },
    // 赞
    awesome: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
    // 浏览历史
    browse: {
      type: [Schema.Types.ObjectId],
      default: [],
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
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('users', UserSchema);
