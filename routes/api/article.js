const express = require('express');
const passport = require('passport');

const Article = require('../../models/article');
const User = require('../../models/user');
const validatorArticleInput = require('../../validator/article');
const router = express.Router();

/**
 * $ GET ylink/article/inquire？pageNum=0&pageSize=0
 * @description 查询文章列表接口
 */
router.get('/inquire', (req, res) => {
  const { pageNum, pageSize } = req.query;
  // 查询一周以内的文章
  // Article.find({ createTime: { $gte: Date.now() - 5 * 24 * 60 * 60 * 1000 } })
  Article.find()
    .skip(pageNum * pageSize)
    .limit(Number(pageSize))
    .sort({ browse: 'desc', awesome: 'desc' })
    .exec()
    .then(list => res.json(list))
    .catch(err => console.log(err));
});

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
      return res.status(400).json(errors);
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

/**
 * $ GET ylink/article/:id
 * @description 查询文章接口
 */
router.get('/:id', (req, res) => {
  Article.findById(req.params.id)
    .then(article => {
      res.json(article);
    })
    .catch(err => {
      res.status(400).json(err.message);
    });
});

/**
 * $ post ylink/article/:id/comment
 * @description 评论文章
 */
/**
 * $ PUT ylink/article/:id/awesome
 * @description 点赞文章
 */
router.put(
  '/:id/awesome',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Article.findById(req.params.id).then(article => {
      if (article.awesome.includes(req.user._id)) {
        res.json('yb');
      }
      User.updateOne({ _id: req.user._id }, { $push: { awsome: req.user.id } })
        .then(i => {
          console.log(i);
          article.awesome.push(req.user._id);
          article
            .save()
            .then(() => res.json('success'))
            .catch(err => res.json(err.message));
        })
        .catch(err => res.json(err.message));
    });
  },
);
/**
 * $ post ylink/article/:id/browse
 * @description 浏览文章
 */
router.put(
  '/:id/browse',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Article.find({ _id: req.params.id, browse: req.user._id }).then(article => {
      console.log(article);
      if (article.length === 0) {
        Article.updateOne(
          { _id: req.params.id },
          { $push: { browse: req.user._id } },
        )
          .then(() =>
            User.updateOne(
              { _id: req.user._id },
              { $push: { browse: req.params.id } },
            ),
          )
          .then(() => res.json(true));
      } else {
        return res.json(false);
      }
    });
  },
);

/**
 * $ GET ylink/article？numPage=0&numSize=0
 * @description 删除文章接口
 */

module.exports = router;
