const express = require('express');
const passport = require('passport');

const Article = require('../models/article');
const Post = require('../models/post');
const User = require('../models/user');
const router = express.Router();

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const query = req.body.query;
    const result = await Promise.all([
      Article.find({ title: { $regex: query } }),
      Post.find({ title: { $regex: query } }).populate({
        path: 'userId',
        model: User,
        select: { name: 1, avatar: 1 },
      }),
    ]);
    res.json({ success: true, data: result });
  },
);

module.exports = router;
