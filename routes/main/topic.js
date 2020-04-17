const express = require('express');
const passport = require('passport');

const Post = require('../../models/post');
const Topic = require('../../models/topic');
const refreshUserLastDate = require('../../util/refreshLastDate');
const router = express.Router();

/**
 * @description 获取热门话题
 */
router.get(
  '/hot',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Topic.find()
      .populate({ path: 'postList', model: Post, select: { browse: 1 } })
      .then(result => {
        // console.log(result);
        result.map(item => {
          let browse = 0;
          item.postList.map(post => (browse += post.browse));
          item.browse = browse;
        });
        res.json({
          data: result
            .sort((a, b) => (a.browse > b.browse ? -1 : 1))
            .slice(0, 4),
          success: true,
        });
      });
  },
);

module.exports = router;
