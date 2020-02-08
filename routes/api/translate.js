const querystring = require('querystring');
const express = require('express');
const passport = require('passport');
const sha256 = require('js-sha256');
const axios = require('axios');

const Wordbook = require('../../models/wordbook');
const User = require('../../models/user');
const truncate = require('../../util/truncate');
const { appKey, key, youdaoURI, salt, curTime } = require('../../config/keys');
const router = express.Router();

router.post('/', (req, res) => {
  // let param = req.body;
  const { query, from = 'auto', to = 'auto' } = req.body;
  const str = appKey + truncate(query) + salt + curTime + key;
  const sign = sha256(str);
  const params = {
    q: query,
    appKey: appKey,
    salt: salt,
    from: from,
    to: to,
    sign: sign,
    signType: 'v3',
    curtime: curTime,
  };

  let targetURL = `${youdaoURI}?${querystring.stringify(params)}`;
  axios
    .get(targetURL)
    .then(item => {
      let result = {
        query: item.data.query,
        translation: item.data.translation,
        basic: item.data.basic,
        web: item.data.web,
      };
      res.json(result);
    })
    .catch(err => {
      new Error(err);
      res.json(err.message);
    });
});

router.post(
  '/save',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Wordbook.findOne({ query: req.body.query }).then(wordbook => {
      if (wordbook) {
        const flag = wordbook.users.some(
          item => item.toString() == req.user._id,
        );
        if (flag) {
          return res.status(400).json('已经在单词本中');
        } else {
          User.findById(req.user._id).then(user => {
            user.wordbook.push(wordbook.id);
            user.save().then(() => res.json(true));
          });
        }
      } else {
        const word = new Wordbook({
          users: [req.user._id],
          query: req.body.query,
          translation: req.body.translation,
          basic: req.body.basic,
          web: req.body.web,
        });

        word
          .save()
          .then(word => {
            // res.json(word);
            User.findById(req.user._id).then(user => {
              user.wordbook.push(word.id);
              user.save().then(() => res.json(true));
            });
          })
          .catch(err => res.json(err.message));
      }
    });
  },
);

module.exports = router;
