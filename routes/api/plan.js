const express = require('express');
const passport = require('passport');

const Plan = require('../../models/plan');
const Word = require('../../models/word');
const User = require('../../models/user');
const UserPlan = require('../../models/userPlan');
const validatorPlanInput = require('../../validator/plan');
const router = express.Router();

/**
 * @description 获取计划列表
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.find().then(planList => {
      res.json(planList);
    });
  },
);

/**
 * @description 添加计划
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    const { errors, isValid } = validatorPlanInput(req.body);

    if (!isValid) {
      return res.status(403).json(errors);
    }

    const newPlan = new Plan({
      name: req.body.name,
    });

    newPlan
      .save()
      .then(plan => {
        res.json(plan);
      })
      .catch(err => {
        res.status(500).json(err.message);
        throw new Error(err);
      });
  },
);

/**
 * @description 配置计划 添加单词
 */
router.put(
  '/config/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findByIdAndUpdate(
      req.params.planId,
      {
        $addToSet: { wordList: JSON.parse(req.body.wordList) },
      },
      { new: true },
    )
      .then(plan => {
        if (!plan) {
          res.status(404).json('未找到计划');
        } else {
          const wordList = JSON.parse(req.body.wordList);
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
        throw new Error(err);
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
    let deleteWordList = JSON.parse(req.body.wordList);
    Plan.findById(req.params.planId)
      .then(plan => {
        plan.wordList = plan.wordList.filter(
          item => !deleteWordList.includes(item.toString()),
        );
        // res.json(plan);
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
        throw new Error(err);
      });
  },
);

/**
 * @description 删除计划
 */
router.delete(
  '/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findByIdAndDelete(req.params.planId)
      .then(plan => {
        if (plan) {
          console.log(plan);
          return Promise.all([
            Word.updateMany({ _id: plan.wordList }, { $unset: { planId: '' } }),
            User.updateMany({ planId: plan._id }, { $unset: { plan: '' } }),
            UserPlan.deleteOne({ planId: plan._id }),
          ]);
        } else {
          res.status(400).json({ message: '没有找到计划' });
        }
      })
      .then(result => {
        if (result[0].ok === 1 && result[1].ok === 1 && result[2].ok === 1) {
          res.json(true);
        }
      })
      .catch(err => {
        res.status(500).json(err);
        throw new Error(err);
      });
  },
);

/**return
 * @description 用户选择计划
 */
router.post(
  '/select/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    User.findByIdAndUpdate(
      req.user._id,
      {
        $set: { plan: req.params.planId },
      },
      { new: true },
    )
      .then(user => {
        UserPlan.find({ planId: req.params.planId, userId: user._id }).then(
          userPlan => {
            if (userPlan.length === 0) {
              const newUserPlan = new UserPlan({
                userId: user._id,
                planId: req.params.planId,
              });
              newUserPlan.save().then(() => res.json(true));
            } else {
              res.json(true);
            }
          },
        );
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

module.exports = router;
