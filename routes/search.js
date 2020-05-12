const express = require('express');
const passport = require('passport');

const Article = require('../models/article');
const Post = require('../models/post');
const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const query = req.body.query;
    const result = await Promise.all([
      Article.find({ title: { $regex: query } }),
      Post.find({ title: { $regex: query } }),
    ]);
    res.json(result);
  },
);

module.exports = router;
