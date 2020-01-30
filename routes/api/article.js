const express = require('express');
const passport = require('passport');

const Article = require('../../models/article');
const validatorArticleInput = require('../../validator/article');
const router = express.Router();

/**
 * $ GET ylink/article/inquire？pageNum=0&pageSize=0
 * @description 查询文章接口
 */
router.get('/inquire', (req, res) => {
  const { pageNum, pageSize } = req.query;
  Article.find({ createTime: { $gte: Date.now() - 5 * 24 * 60 * 60 * 1000 } })
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
 * $ GET ylink/article？numPage=0&numSize=0
 * @description 删除文章接口
 */

module.exports = router;
