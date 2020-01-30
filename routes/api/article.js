const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const router = express.Router();

/**
 * $ GET ylink/article/
 * @description 用户测试接口
 */
