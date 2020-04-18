const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const Post = require('../../models/post');
const Topic = require('../../models/topic');
const router = express.Router();

/**
 * @description 获取全部帖子
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { pageNum, pageSize } = req.query;
    const postList = await Post.aggregate()
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
      })
      .lookup({
        from: 'userposts',
        localField: '_id',
        foreignField: 'postId',
        as: 'postInfo',
      })
      .lookup({
        from: 'post-comments',
        localField: '_id',
        foreignField: 'postId',
        as: 'comment',
      })
      .unwind('userInfo')
      .sort({ created_at: 'desc' })
      .skip(pageNum * pageSize)
      .limit(Number(pageSize))
      .project({
        title: 1,
        browse: 1,
        postInfo: { awesome: 1 },
        userInfo: { name: 1 },
        comment: { _id: 1 },
      });
    postList.forEach(post => {
      const postInfo = { awesome: 0 };
      post.postInfo.forEach(item => {
        if (item.awesome) postInfo.awesome++;
      });
      delete post.postInfo;
      post.awesome = postInfo.awesome;
      post.comment = post.comment.length;
    });
    res.json(postList);
  },
);

/**
 * @description 获取热门帖子
 */
router.get(
  '/list/hot',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const postList = await Post.find()
      .populate({
        path: 'userId',
        model: User,
        select: { name: 1, avatar: 1 },
      })
      .sort({ browse: 'desc' })
      .limit(5);

    res.json(postList);
  },
);

/**
 * @description 获取热门话题
 */
router.get(
  '/topic/hot',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const postList = await Topic.find()
      .populate({
        path: 'postList',
        model: Post,
        select: { browse: 1 },
      })
      // .sort({ browse: 'desc' })
      .limit(5);

    postList.forEach(item => {
      let browse = 0;
      item.postList.map(post => (browse += post.browse));
      item.browse = browse;
    });

    res.json(postList);
  },
);

module.exports = router;
