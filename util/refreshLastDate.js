const User = require('../models/user');

module.exports = userId => {
  User.findByIdAndUpdate(userId, { lastLogin: new Date() }, { new: true })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.warn(err);
    });
};
