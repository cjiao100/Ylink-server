const express = require('express');
const passport = require('passport');

const Post = require('../../models/post');
const Topic = require('../../models/topic');
const router = express.Router();

/**
 * @description 获取热门话题
 */
router.get(
  '/hot',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Topic.find()
      .populate({ path: 'postList', model: Post, select: { browse: 1 } })
      .then(result => {
        // console.log(result);
        result.map(item => {
          let browse = 0;
          item.postList.map(post => (browse += post.browse));
          item.browse = browse;
        });
        res.json(result.sort((a, b) => (a.browse > b.browse ? -1 : 1)));
      });
  },
);

module.exports = router;
