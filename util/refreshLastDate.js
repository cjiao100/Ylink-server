const User = require('../models/user');

module.exports = userId => {
  User.findByIdAndUpdate(
    userId,
    { last_login: new Date() },
    { new: true },
  ).catch(err => {
    console.warn(err);
  });
};
