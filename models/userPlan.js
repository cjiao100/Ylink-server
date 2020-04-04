const mongoose = require('mongoose');
const Schame = mongoose.Schema;

const userAndPlanSchame = new Schame(
  {
    userId: mongoose.Types.ObjectId,
    planId: mongoose.Types.ObjectId,
    completeList: {
      type: [Object],
      default: [],
    },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } },
);

module.exports = mongoose.model('user-plan', userAndPlanSchame);
