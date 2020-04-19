const express = require('express');
const router = express.Router();

const user = require('./admin/user');
const post = require('./admin/post');
const plan = require('./admin/plan');
const article = require('./admin/article');
const workbench = require('./admin/workbench');

router.use('/user', user);
router.use('/post', post);
router.use('/plan', plan);
router.use('/article', article);
router.use('/workbench', workbench);

module.exports = router;
