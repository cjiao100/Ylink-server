const express = require('express');
const passport = require('passport');

const Todo = require('../../models/todo');
const router = express.Router();

/**
 * @description 新建代办事项
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const newTodo = new Todo({
      title: req.body.title,
      user: req.user._id,
    });

    try {
      await newTodo.save();
      res.json(true);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

/**
 * @description 完成代办
 */
router.put(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      await Todo.findByIdAndUpdate(
        req.params.id,
        { completed: true },
        { new: true },
      );
      res.json(true);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

/**
 * @description 查询代办列表
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const list = await Todo.find({ completed: false });
    res.json(list);
  },
);

/**
 * @description 删除代办
 */
router.delete(
  '/:id',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    try {
      await Todo.findByIdAndDelete(req.params.id);
      res.json(true);
    } catch (error) {
      res.status(500).json(error);
    }
  },
);

module.exports = router;
