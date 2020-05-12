const express = require('express');
const passport = require('passport');

const Word = require('../../models/word');
const WordBook = require('../../models/wordbook');
const translation = require('../../util/translation');
const refreshUserLastDate = require('../../util/refreshLastDate');
const router = express.Router();

/**
 * $ GET
 * @description 翻译接口
 */
router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Word.findOneAndUpdate(
      { query: req.body.query.toLowerCase() },
      { updated_at: new Date() },
    ).then(word => {
      if (word) {
        WordBook.findById(req.user.wordbook).then(wordbook => {
          const data = JSON.parse(JSON.stringify(word));
          if (wordbook) {
            data.wordbook = wordbook.wordList.includes(data._id);
          } else {
            data.wordbook = false;
          }
          res.json({ success: true, data });
        });
      } else {
        const { query, from = 'en', to = 'zh-CHS' } = req.body;
        // console.log(query);
        translation({ query, from, to })
          .then(result => {
            console.log(result.data);
            const data = new Word({
              query: result.data.query.toLowerCase(),
              translation: result.data.translation,
              basic: result.data.basic,
              web: result.data.web,
            });
            return data.save();
          })
          .then(data => {
            res.json({ success: true, data });
          })
          .catch(err => {
            res.status(500).json('异常');
            throw err.message;
          });
      }
    });
  },
);

module.exports = router;
