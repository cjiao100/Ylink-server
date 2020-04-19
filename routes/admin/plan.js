const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const Plan = require('../../models/plan');
const Word = require('../../models/word');
const router = express.Router();

/**
 * @description 根据PlanId获取计划中的单词
 */
router.get(
  '/:planId/word',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const plan = await Plan.aggregate()
      .match({
        _id: new mongoose.Types.ObjectId(req.params.planId),
      })
      .lookup({
        from: 'words',
        localField: 'wordList',
        foreignField: '_id',
        as: 'wordList',
      })
      .project({
        wordList: {
          _id: 1,
          query: 1,
          basic: {
            explains: 1,
          },
        },
      });
    res.json(plan[0].wordList);
  },
);

/**
 * @description 配置计划 添加单词
 */
router.put(
  '/config/:planId/add',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findByIdAndUpdate(
      req.params.planId,
      {
        $addToSet: { wordList: req.body.wordList },
      },
      { new: true },
    )
      .then(plan => {
        if (!plan) {
          res.status(404).json('未找到计划');
        } else {
          const wordList = req.body.wordList;
          return Word.updateMany(
            { _id: wordList },
            { planId: plan._id },
            { multi: true },
          );
        }
      })
      .then(result => {
        if (result.ok) res.json(true);
      })
      .catch(err => {
        res.status(500).json(err);
        throw err;
      });
  },
);

/**
 * @description 配置计划 移除单词
 */
router.put(
  '/config/:planId/delete',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    let deleteWordList = req.body.wordList;
    Plan.findById(req.params.planId)
      .then(plan => {
        plan.wordList = plan.wordList.filter(
          item => !deleteWordList.includes(item.toString()),
        );
        return plan.save();
      })
      .then(() => {
        return Word.updateMany(
          { _id: deleteWordList },
          { $unset: { planId: '' } },
        );
      })
      .then(result => {
        if (result.ok === 1) res.json(true);
      })
      .catch(err => {
        res.status(500).json(err);
        throw err;
      });
  },
);

module.exports = router;
