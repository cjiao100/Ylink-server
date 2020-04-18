const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const User = require('../../models/user');
const keys = require('../../config/keys').secretOrKey;
const validatorLoginInput = require('../../validator/login');
// const refreshUserLastDate = require('../../util/refreshLastDate');
const router = express.Router();

/**
 * $ POST ylink/admin/user/login
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
      } else if (user.identity !== '0') {
        return res.status(403).json('无权限');
      } else {
        // refreshUserLastDate(user._id);
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) throw err;
          if (result) {
            const rule = {
              id: user.id,
              name: user.name,
              email: user.email,
              identity: 1,
            };

            //  设置有效时长为一天
            const token = jwt.sign(rule, keys, { expiresIn: 24 * 60 * 60 });

            res.json({
              success: true,
              access_token: `Bearer ${token}`,
              expires_in: 24 * 60 * 60,
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
 * @description 获取用户简略信息
 */
router.get(
  '/simple',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const simple = {
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
    };
    res.json(simple);
  },
);

module.exports = router;
