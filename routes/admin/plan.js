const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const Plan = require('../../models/plan');
const Word = require('../../models/word');
const User = require('../../models/user');
const UserPlan = require('../../models/userPlan');
const validatorPlanInput = require('../../validator/plan');
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
  async (req, res) => {
    try {
      const deleteWordList = req.body.wordList;
      const plan = await Plan.findById(req.params.planId);
      const userPlans = await UserPlan.find({ planId: req.params.planId });

      plan.wordList = plan.wordList.filter(
        item => !deleteWordList.includes(item.toString()),
      );
      userPlans.forEach(
        userPlan =>
          (userPlan.completeList = userPlan.completeList.filter(
            item => !deleteWordList.includes(item.word.toString()),
          )),
      );

      await plan.save();
      for (let i = 0; i < userPlans.length; i++) {
        await userPlans[i].save();
      }

      await Word.updateMany(
        { _id: deleteWordList },
        { $unset: { planId: '' } },
      );

      res.json(true);
    } catch (error) {
      res.status(500).json(error);
      throw error;
    }
  },
);

/**
 * @description 添加计划
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { errors, isValid } = validatorPlanInput(req.body);

    if (!isValid) {
      return res.status(404).json(errors);
    }
    const result = await Plan.findOne({ name: req.body.name });

    if (result) {
      return res.status(400).json(`已经有${req.body.name}的计划`);
    }

    const newPlan = new Plan({
      name: req.body.name,
    });

    try {
      await newPlan.save();
      res.json(true);
    } catch (error) {
      res.status(500).json(error.message);
      throw error;
    }
  },
);

/**
 * @description 删除计划
 */
router.delete(
  '/delete/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findByIdAndDelete(req.params.planId)
      .then(plan => {
        if (plan) {
          // console.log(plan);
          return Promise.all([
            Word.updateMany({ _id: plan.wordList }, { $unset: { planId: '' } }),
            User.updateMany({ planId: plan._id }, { $unset: { plan: '' } }),
            UserPlan.deleteMany({ planId: plan._id }),
          ]);
        } else {
          res.status(400).json('没有找到计划');
        }
      })
      .then(result => {
        if (result[0].ok === 1 && result[1].ok === 1 && result[2].ok === 1) {
          res.json(true);
        }
      })
      .catch(err => {
        res.status(500).json(err);
        throw err;
      });
  },
);

module.exports = router;
