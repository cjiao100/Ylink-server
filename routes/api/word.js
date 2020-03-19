const express = require('express');
const passport = require('passport');

// const Wordbook = require('../../models/wordbook');
const Word = require('../../models/word');
const router = express.Router();

/**
 * @description 获取未加入计划的单词
 */
router.get(
  '/list/noplan',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Word.find().then(wordList => {
      res.json(wordList.filter(item => !item.planId));
    });
  },
);

module.exports = router;
