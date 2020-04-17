const express = require('express');
const passport = require('passport');

const Word = require('../../models/word');
const refreshUserLastDate = require('../../util/refreshLastDate');
const router = express.Router();

/**
 * @description 获取未加入计划的单词
 */
router.get(
  '/list/noplan',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Word.find()
      .then(wordList => {
        res.json(wordList.filter(item => !item.planId));
      })
      .catch(err => {
        res.status(500).json(err.message);
        throw err;
      });
  },
);

module.exports = router;
