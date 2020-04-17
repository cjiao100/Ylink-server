const express = require('express');
const router = express.Router();

const user = require('./main/user');
const article = require('./main/article');
const translate = require('./main/translate');
const test = require('./main/test');
const wordbook = require('./main/wordbook');
const word = require('./main/word');
const plan = require('./main/plan');
const post = require('./main/post');
const topic = require('./main/topic');

router.use('/user', user);
router.use('/article', article);
router.use('/translate', translate);
router.use('/test', test);
router.use('/wordbook', wordbook);
router.use('/word', word);
router.use('/plan', plan);
router.use('/post', post);
router.use('/topic', topic);

module.exports = router;
