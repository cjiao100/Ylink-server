const express = require('express');
const bctypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../../models/user');
const keys = require('../../config/keys').secretOrKey;
const router = express.Router();

/**
 * $ GET ylink/user/test
 * @description 用户测试接口
 */
router.get('/test', (req, res) => {
  res.json({
    msg: 'user OK',
  });
});

/**
 * $ POST ylink/user/register
 * @description 用户注册接口
 */
router.post('/register', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json('邮箱已被注册');
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.pass,
      });

      bctypt.genSalt(10, (err, salt) => {
        bctypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;

          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

module.exports = router;
