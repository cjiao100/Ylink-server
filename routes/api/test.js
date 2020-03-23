const express = require('express');
const passport = require('passport');

const Word = require('../../models/word');
const Plan = require('../../models/plan');
const UserPlan = require('../../models/userPlan');
const { random, randomList } = require('../../util/random');
const router = express.Router();

/**
 * @description 获取计划中的单词
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let word = {};
    Promise.all([
      Plan.findById(req.user.plan),
      UserPlan.findOne({ userId: req.user._id, planId: req.user.plan }),
    ])
      .then(([plan, userPlan]) => {
        if (!plan) {
          throw { success: true, status: 404, message: '未设置计划' };
        } else {
          const complete = [...userPlan.completeList];
          const word = [...plan.wordList];
          const undone = word.filter(
            v => !complete.some(item => item.toString() == v.toString()),
          );
          return random(Word, undone);
        }
      })
      .then(item => {
        if (!item) {
          throw { success: true, status: 200, message: '计划完成' };
        } else {
          word = item;
          return randomList(Word, 4, item._id);
        }
      })
      .then(list => {
        const wordList = list;
        const index = Math.floor(Math.random() * wordList.length);
        wordList.splice(index, 0, {
          value: word.basic.explains.join('；'),
          index: 1,
        });

        const result = {
          wordId: word._id,
          question: word.query,
          phonetic: word.basic.phonetic,
          speech: word.basic['uk-speech'],
          answer: wordList,
        };
        res.json(result);
      })
      .catch(err => {
        if (err.success) {
          res.status(err.status).json(err);
        } else {
          throw err;
        }
      });
  },
);

/**
 * @description 答题结果
 */
router.post(
  '/result/:wordId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (req.body.result) {
      UserPlan.findOneAndUpdate(
        {
          userId: req.user._id,
          planId: req.user.plan,
        },
        { $addToSet: { completeList: req.params.wordId } },
        { new: true },
      )
        .then(userPlan => {
          res.json(userPlan);
        })
        .catch(err => {
          res.status(500).json(err);
          throw err;
        });
    } else {
      res.json({ message: '回答错误' });
    }
  },
);

module.exports = router;
