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

/**
 * $ POST ylink/user/login
 * @description 登录接口
 */
router.post('/login', (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (!user) {
      return res.status(400).json('该邮箱未注册');
    } else {
      bctypt.compare(req.body.pass, user.password, (err, result) => {
        if (err) throw err;
        if (result) {
          const rule = { id: user.id, name: user.name };

          jwt.sign(rule, keys, { expiresIn: 3600 }, (err, token) => {
            if (err) throw err;
            res.json({ success: true, token: `Bearer ${token}` });
          });
        } else {
          res.status(400).json('密码错误');
        }
      });
    }
  });
});

router.get(
  '/test/token',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  },
);
module.exports = router;
