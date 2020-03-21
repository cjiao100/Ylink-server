const mongoose = require('mongoose');
const Schame = mongoose.Schema;

const userAndPlanSchame = new Schame({
  userId: mongoose.Types.ObjectId,
  planId: mongoose.Types.ObjectId,
  completeList: {
    type: [Schame.Types.ObjectId],
    default: [],
  },
  updateTime: {
    type: Date,
    default: Date.now(),
  },
  createTime: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model('user-plan', userAndPlanSchame);
