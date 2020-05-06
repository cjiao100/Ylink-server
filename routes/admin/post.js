const express = require('express');
const passport = require('passport');
const moment = require('moment');

const User = require('../../models/user');
const Post = require('../../models/post');
const Topic = require('../../models/topic');
const { SEVEN_DAYS_AGO } = require('../../util/moment');
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
      .limit(5);

    postList.forEach(item => {
      let browse = 0;
      item.postList.map(post => (browse += post.browse));
      item.browse = browse;
    });

    res.json(postList.sort((a, b) => (a.browse > b.browse ? -1 : 1)));
  },
);

/**
 * @description 获取7天内新增帖子数
 */
router.get(
  '/day/post',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const posts = await Post.aggregate()
      .match({
        created_at: {
          $gt: new Date(SEVEN_DAYS_AGO),
        },
      })
      .group({
        _id: {
          $subtract: [
            { $subtract: ['$created_at', new Date('1970-01-01')] },
            {
              $mod: [
                { $subtract: ['$created_at', new Date('1970-01-01')] },
                1000 * 60 * 60 * 24 /*聚合时间段，30分钟*/,
              ],
            },
          ],
        },
        count: { $sum: 1 },
      })
      .project({
        _id: 0,
        count: 1,
        date: '$_id',
      });

    const dateMap = [];
    let date = SEVEN_DAYS_AGO;
    for (let i = 0; i < 7; i++) {
      date = moment(date)
        .add(1, 'd')
        .format('YYYY-MM-DD');
      const post = posts.filter(
        item => moment(item.date).format('YYYY-MM-DD') === date,
      );
      if (post.length === 0) {
        dateMap[i] = { date: date, count: 0 };
      } else {
        dateMap[i] = { date: date, count: post[0].count };
      }
    }

    res.json(dateMap);
  },
);

/**
 * @description 获取7天内新增话题数
 */

router.get(
  '/day/topic',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const topics = await Topic.aggregate()
      .match({
        created_at: { $gt: new Date(SEVEN_DAYS_AGO) },
      })
      .group({
        _id: {
          $subtract: [
            { $subtract: ['$created_at', new Date('1970-01-01')] },
            {
              $mod: [
                { $subtract: ['$created_at', new Date('1970-01-01')] },
                1000 * 60 * 60 * 24 /*聚合时间段，30分钟*/,
              ],
            },
          ],
        },
        count: { $sum: 1 },
      })
      .project({
        _id: 0,
        count: 1,
        date: '$_id',
      });

    const dateMap = [];
    let date = SEVEN_DAYS_AGO;
    for (let i = 0; i < 7; i++) {
      date = moment(date)
        .add(1, 'd')
        .format('YYYY-MM-DD');
      const topic = topics.filter(
        item => moment(item.date).format('YYYY-MM-DD') === date,
      );
      if (topic.length === 0) {
        dateMap[i] = { date: date, count: 0 };
      } else {
        dateMap[i] = { date: date, count: topic[0].count };
      }
    }

    res.json(dateMap);
  },
);

module.exports = router;
