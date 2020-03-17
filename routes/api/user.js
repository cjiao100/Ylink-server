const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../../models/user');
const keys = require('../../config/keys').secretOrKey;
const validatorLoginInput = require('../../validator/login');
const validatorRegisterInput = require('../../validator/register');
const defaultAvatar = require('../../util/avatar');
const router = express.Router();

/**
 * $ GET ylink/user/test
 * @description 用户测试接口
 */
router.get('/test', (req, res) => {
  const avatar = defaultAvatar('cjiao100');
  res.send(avatar);
});

/**
 * $ GET ylink/user/test/token
 * @description 测试token
 */
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

/**
 * $ POST ylink/user/register
 * @description 用户注册接口
 */
router.post('/register', (req, res) => {
  const { errors, isValid } = validatorRegisterInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        return res.status(400).json('邮箱已被注册');
      } else {
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          avatar: defaultAvatar(req.body.email),
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;

            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    })
    .catch(err => console.log(err));
});

/**
 * $ POST ylink/user/login
 * @description 登录接口
 */
router.post('/login', (req, res) => {
  const { errors, isValid } = validatorLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(400).json('该邮箱未注册');
      } else {
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) throw err;
          if (result) {
            const rule = { id: user.id, name: user.name };

            jwt.sign(rule, keys, { expiresIn: 3600 }, (err, token) => {
              if (err) throw err;
              res
                .cookie('token', `Bearer ${token}`, {
                  httpOnly: true,
                })
                .json({ success: true });
            });
          } else {
            res.status(400).json('密码错误');
          }
        });
      }
    })
    .catch(err => console.log(err));
});

/**
 * $ GET ylink/user/
 * @description 查询用户信息
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findById(req.user._id)
      .then(user => {
        const info = {
          name: user.name,
          email: user.email,
          identity: user.identity,
          avatar: user.avatar,
        };
        res.json(info);
      })
      .catch(() => res.status(404).json('找不到用户信息'));
  },
);

/**
 * $ PUT ylink/user/update
 * @description 更新用户数据
 */
router.put(
  '/update',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.where({ _id: req.user._id })
      .update({ $set: req.body })
      .exec()
      .then(item => {
        res.json(item);
      });
  },
);

module.exports = router;
