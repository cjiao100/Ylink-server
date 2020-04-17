const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const Post = require('../../models/post');
const Topic = require('../../models/topic');
const User = require('../../models/user');
const UserPost = require('../../models/userPost');
const PostComment = require('../../models/postComment');
const validatorPostInput = require('../../validator/post');
const validatorCommentInput = require('../../validator/comment');
const refreshUserLastDate = require('../../util/refreshLastDate');
const router = express.Router();

/**
 * @description 发布帖子
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    refreshUserLastDate(req.user._id);
    const { errors, isValid } = validatorPostInput(req.body);

    if (!isValid) {
      return res.status(403).json(errors);
    }

    const newPost = new Post({
      userId: req.user._id,
      title: req.body.title,
      content: req.body.content,
      images: req.body.images || [],
      topicList: [],
    });

    const post = await newPost.save();

    const topicList = (req.body.content.match(/#([^#]+)#/g) || []).map(
      item => item.split('#')[1],
    );

    if (topicList.length !== 0) {
      for (let i = 0; i < topicList.length; i++) {
        const result = await Topic.findOne({ title: topicList[i] });
        if (result) {
          result.postList.push(post._id);
          const topic = await result.save();
          post.topicList.push(topic._id);
        } else {
          const newTopic = new Topic({
            title: topicList[i],
            postList: [post._id],
          });
          const topic = await newTopic.save();
          post.topicList.push(topic._id);
        }
      }
    }

    res.json({ data: await post.save(), success: true });
  },
);

/**
 * @description 获取帖子列表
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    const { pageNum = 0, pageSize = 10 } = req.query;
    Post.aggregate([
      {
        $lookup: {
          from: 'userposts',
          localField: '_id',
          foreignField: 'postId',
          as: 'postInfo',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      {
        $project: {
          title: 1,
          content: 1,
          images: 1,
          topicList: 1,
          browse: 1,
          created_at: 1,
          updated_at: 1,
          postInfo: { star: 1, awesome: 1 },
          userInfo: { name: 1, avatar: 1 },
        },
      },
      { $skip: pageNum * pageSize },
      { $limit: Number(pageSize) },
      { $sort: { created_at: -1, browse: -1 } },
    ]).then(result => {
      result.forEach(post => {
        const postInfo = { star: 0, awesome: 0 };
        post.postInfo.forEach(item => {
          if (item.star) postInfo.star++;
          if (item.awesome) postInfo.awesome++;
        });
        post.postInfo = postInfo;
        post.userInfo = post.userInfo[0];
      });
      res.json({ data: result, success: true });
    });
  },
);

/**
 * @description 获取我的帖子列表
 */
router.get(
  '/list/my',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Post.aggregate()
      .match({ userId: req.user._id })
      .lookup({
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
      })
      .unwind('userInfo')
      .project({
        title: 1,
        content: 1,
        images: 1,
        topicList: 1,
        browse: 1,
        created_at: 1,
        updated_at: 1,
        userInfo: { name: 1, avatar: 1 },
      })
      .sort({ created_at: -1, browse: -1 })
      .then(result => {
        res.json({ data: result, success: true });
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

/**
 * @description 获取收藏的帖子
 */
router.get(
  '/list/star',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    UserPost.aggregate()
      .match({ userId: req.user._id, star: true })
      .project({
        postId: 1,
      })
      .lookup({
        from: 'posts',
        localField: 'postId',
        foreignField: '_id',
        as: 'post',
      })
      .lookup({
        from: 'users',
        localField: 'post.userId',
        foreignField: '_id',
        as: 'user',
      })
      .lookup({
        from: 'userposts',
        localField: 'postId',
        foreignField: 'postId',
        as: 'postInfo',
      })
      .unwind('post')
      .unwind('user')
      .project({
        post: 1,
        user: {
          name: 1,
          avatar: 1,
        },
        postInfo: {
          star: 1,
          awesome: 1,
        },
      })
      .then(result => {
        result.forEach(post => {
          const postInfo = { star: 0, awesome: 0 };
          post.postInfo.forEach(item => {
            if (item.star) postInfo.star++;
            if (item.awesome) postInfo.awesome++;
          });
          post.postInfo = postInfo;
        });
        res.json({ data: result, success: true });
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

/**
 * @description 查看帖子详细
 */
router.get(
  '/:postId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Post.aggregate()
      .match({ _id: new mongoose.Types.ObjectId(req.params.postId) })
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
      .project({
        title: 1,
        content: 1,
        images: 1,
        topicList: 1,
        browse: 1,
        created_at: 1,
        updated_at: 1,
        postInfo: { userId: 1, star: 1, awesome: 1 },
        userInfo: { name: 1, avatar: 1 },
      })
      .then(result => {
        const postInfo = { star: 0, awesome: 0 };
        const currentUser = { star: false, awesome: false };
        result[0].postInfo.forEach(item => {
          if (item.userId.toString() === req.user._id.toString()) {
            currentUser.star = item.star;
            currentUser.awesome = item.awesome;
          }
          if (item.star) postInfo.star++;
          if (item.awesome) postInfo.awesome++;
        });
        result[0].currentUser = currentUser;
        result[0].postInfo = postInfo;
        result[0].userInfo = result[0].userInfo[0];
        res.json({ data: result[0], success: true });
      })
      .catch(err => {
        res.status(500).json({ message: err.message });
      });
  },
);

/**
 * @description 浏览帖子
 */
router.put(
  '/:postId/browse',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Post.findByIdAndUpdate(
      req.params.postId,
      { $inc: { browse: 1 } },
      { new: true },
    )
      .then(() => {
        res.json({ success: true });
      })
      .catch(err => {
        res.status(500).json(err.message);
      });
  },
);

/**
 * @description  点赞
 */
router.put(
  '/:postId/awesome',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    UserPost.findOne({ userId: req.user._id, postId: req.params.postId }).then(
      userPost => {
        // console.log(userPost);
        // res.json(userPost);
        if (!userPost) {
          const newUserPost = new UserPost({
            userId: req.user._id,
            postId: req.params.postId,
            awesome: true,
            star: false,
          });

          newUserPost.save().then(() => res.json({ success: true }));
        } else {
          userPost.awesome = !userPost.awesome;
          userPost.save().then(() => res.json({ success: true }));
        }
      },
    );
  },
);

/**
 * @description  收藏
 */
router.put(
  '/:postId/star',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    UserPost.findOne({ userId: req.user._id, postId: req.params.postId }).then(
      userPost => {
        // res.json(userPost);
        if (!userPost) {
          const newUserPost = new UserPost({
            userId: req.user._id,
            postId: req.params.postId,
            awesome: false,
            star: true,
          });

          newUserPost.save().then(() => res.json({ success: true }));
        } else {
          userPost.star = !userPost.star;
          userPost.save().then(() => res.json({ success: true }));
        }
      },
    );
  },
);

/**
 * @description  评论
 */
router.put(
  '/:postId/comment',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    const { errors, isValid } = validatorCommentInput(req.body);

    if (!isValid) {
      return res.status(403).json(errors);
    }

    const newComment = new PostComment({
      postId: req.params.postId,
      userId: req.user._id,
      content: req.body.content,
      father: req.body.father,
    });

    newComment
      .save()
      .then(comment => {
        res.json({ data: comment, success: true });
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

/**
 * @description  删除帖子
 */
router.delete(
  '/:postId/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    refreshUserLastDate(req.user._id);
    const userPost = await UserPost.find({
      postId: req.params.postId,
    }).deleteMany();
    const comment = await PostComment.find({
      postId: req.params.postId,
    }).deleteMany();
    const post = await Post.findById(req.params.postId).deleteOne();
    if (userPost.ok === 1 && comment.ok === 1 && post.ok === 1) {
      res.json(true);
    } else {
      res.json(false);
    }
  },
);

/**
 * @description 获取评论列表
 */
router.get(
  '/:postId/comment',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    PostComment.find({ postId: req.params.postId })
      .populate({ path: 'userId', model: User, select: { name: 1, avatar: 1 } })
      .then(result => {
        res.json({ data: result, success: true });
      });
  },
);

module.exports = router;
