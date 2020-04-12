const User = require('../models/user');

module.exports = userId => {
  User.findByIdAndUpdate(
    userId,
    { lastLogin: new Date() },
    { new: true },
  ).catch(err => {
    console.warn(err);
  });
};
