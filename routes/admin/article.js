const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const Article = require('../../models/article');
const validatorArticleInput = require('../../validator/article');
const router = express.Router();

/**
 * @description 获取全部文章
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { pageNum, pageSize } = req.query;
    const postList = await Article.find()
      .populate({
        path: 'userId',
        model: User,
        select: { name: 1, avatar: 1 },
      })
      .sort({ created_at: 'desc' })
      .skip(pageNum * pageSize)
      .limit(Number(pageSize));
    res.json(postList);
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

/**
 * $ GET ylink/article/add
 * @description 新增文章接口
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatorArticleInput(req.body);

    if (!isValid) {
      return res.status(404).json(errors);
    }

    const newArticle = new Article({
      userId: req.user._id,
      title: req.body.title,
      content: req.body.content,
      coverImage: req.body.coverImage || '',
      video: req.body.video || '',
    });

    newArticle
      .save()
      .then(article => res.json(article))
      .catch(err => console.log(err));
  },
);

module.exports = router;
