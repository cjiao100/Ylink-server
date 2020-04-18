const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const Article = require('../../models/article');
const router = express.Router();

/**
 * @description 获取全部文章
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    // const { pageNum, pageSize } = req.query;
    // const postList = await Post.find()
    //   .populate({
    //     path: 'userId',
    //     model: User,
    //     select: { name: 1, avatar: 1 },
    //   })
    //   .sort({ created_at: 'desc' })
    //   .skip(pageNum * pageSize)
    //   .limit(Number(pageSize));
    // res.json(postList);
    res.json('');
  },
);

/**
 * @description 获取热门文章
 */
router.get(
  '/list/hot',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const articleList = await Article.find()
      .populate({
        path: 'userId',
        model: User,
        select: { name: 1, avatar: 1 },
      })
      .sort({ browse: 'desc' })
      .limit(5);

    res.json(articleList);
  },
);

module.exports = router;
