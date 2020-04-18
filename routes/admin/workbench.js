const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const Post = require('../../models/post');
const Article = require('../../models/article');
const Word = require('../../models/word');
const { WEEKDAY_FRIST } = require('../../util/moment');
const router = express.Router();

/**
 * @description 获取工作台周数据
 */
router.get(
  '/week',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const [user, post, article, word] = await Promise.all([
      User.find({ created_at: { $gte: WEEKDAY_FRIST } }).countDocuments(),
      Post.find({ created_at: { $gte: WEEKDAY_FRIST } }).countDocuments(),
      Article.find({ created_at: { $gte: WEEKDAY_FRIST } }).countDocuments(),
      Word.find({ updated_at: { $gte: WEEKDAY_FRIST } }).countDocuments(),
    ]);
    res.json({
      user,
      post,
      article,
      word,
    });
  },
);

module.exports = router;
