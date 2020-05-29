const moment = require('moment');
const User = require('../models/user');
const Online = require('../models/online');

module.exports = () => {
  setInterval(async () => {
    const CURRENT_TIME = moment();
    const FIVE_MINUTES_AGO = moment().subtract(5, 'minutes');

    const count = await User.find({
      last_login: { $lt: CURRENT_TIME, $gt: FIVE_MINUTES_AGO },
    }).countDocuments();

    const online = new Online({
      date: CURRENT_TIME,
      online: count,
    });

    await online.save();
  }, 1000 * 60 * 5);
};
