const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const nodeMailer = require('nodemailer');

const User = require('../../models/user');
const UserVerify = require('../../models/userVerify');
const keys = require('../../config/keys').secretOrKey;
const Email = require('../../config/keys').smtp;
const validatorLoginInput = require('../../validator/login');
const validatorRegisterInput = require('../../validator/register');
const defaultAvatar = require('../../util/avatar');
const refreshUserLastDate = require('../../util/refreshLastDate');
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
        refreshUserLastDate(user._id);
        bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (err) throw err;
          if (result) {
            const rule = { id: user.id, name: user.name };

            //  设置有效时长为一个小时
            const token = jwt.sign(rule, keys, { expiresIn: 1 * 60 * 60 });
            // 设置刷新Token为7天
            const refreshToken = jwt.sign(rule, keys, {
              expiresIn: 7 * 24 * 60 * 60,
            });
            res.json({
              success: true,
              access_token: `Bearer ${token}`,
              expires_in: 1 * 60 * 60,
              refresh_token: `Bearer ${refreshToken}`,
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
        res.json({ success: true, data: info });
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
    refreshUserLastDate(req.user._id);
    User.where({ _id: req.user._id })
      .update({ $set: req.body })
      .exec()
      .then(item => {
        res.json(item);
      });
  },
);

/**
 * @description 刷新token
 */
router.get(
  '/refresh_token',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    const refreshToken = req.query.refresh_token;
    const rule = { id: req.user._id, name: req.user.name };
    //  设置有效时长为一个小时
    const token = jwt.sign(rule, keys, { expiresIn: 1 * 60 * 60 });
    res.json({
      success: true,
      access_token: `Bearer ${token}`,
      expires_in: 1 * 60 * 60,
      refresh_token: `${refreshToken}`,
    });
  },
);

router.post('/verify', async (req, res) => {
  const saveUserVerify = await UserVerify.findOne({ email: req.body.email });
  if (saveUserVerify && new Date().getTime() - saveUserVerify.expire < 0) {
    return res.status(400).json('验证请求过于频繁');
  }
  // 创建一个用于发送邮件的对象，设置邮件服务的地址、端口号、发送方的邮箱和密码
  const transporter = nodeMailer.createTransport({
    host: Email.host,
    port: 587,
    secure: false,
    auth: {
      user: Email.user,
      pass: Email.pass,
    },
  });

  // 这里是要发送的验证码、验证码的有效期、接受方的邮箱和用户名
  const ko = {
    code: Email.code(),
    expire: Email.expire(),
    email: req.body.email,
    user: req.body.name,
  };

  // 配置发送邮件内容 from: 发送方邮箱地址、to：接受方邮箱地址、subject: 邮件主题、html: 邮件内容
  const mailOption = {
    from: `认证邮件 <${Email.user}>`,
    to: ko.email,
    subject: 'Ylink 验证码',
    html: `亲爱的${req.body.name}:
    欢迎注册我们的网站，您的验证码是
    ${ko.code}
    `,
  };

  // 发送邮件
  await transporter.sendMail(mailOption, async error => {
    if (error) {
      return console.log(error);
    } else if (!saveUserVerify) {
      // 发撒成功后、将内容存储redis中
      const userVerify = new UserVerify({
        email: ko.email,
        code: ko.code,
        expire: ko.expire,
      });

      await userVerify.save();

      res.json({ success: true, message: '验证码已发送' });
    } else if (saveUserVerify) {
      saveUserVerify.code = ko.code;
      saveUserVerify.expire = ko.expire;

      await saveUserVerify.save();

      res.json({ success: true, message: '验证码已发送' });
    }
  });
});

module.exports = router;
