const express = require('express');
const passport = require('passport');

const Post = require('../../models/post');
const Topic = require('../../models/topic');
const User = require('../../models/user');
const validatorPostInput = require('../../validator/post');
// const validatorCommentInput = require('../../validator/comment');
const router = express.Router();

/**
 * @description 发布帖子
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
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

    res.json(await post.save());
  },
);

module.exports = router;
