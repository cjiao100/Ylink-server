const express = require('express');
const passport = require('passport');

const Plan = require('../../models/plan');
const Word = require('../../models/word');
const User = require('../../models/user');
const UserPlan = require('../../models/userPlan');
const validatorPlanInput = require('../../validator/plan');
const refreshUserLastDate = require('../../util/refreshLastDate');
const router = express.Router();

/**
 * @description 获取计划列表
 */
router.get(
  '/list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Plan.aggregate()
      .lookup({
        from: 'user-plans',
        localField: '_id',
        foreignField: 'planId',
        as: 'userPlan',
      })
      .project({
        wordList: 1,
        name: 1,
        userPlan: {
          $filter: {
            input: '$userPlan',
            as: 'userPlan',
            cond: {
              $eq: ['$$userPlan.userId', req.user._id],
            },
          },
        },
      })
      .then(planList => {
        res.json({ success: true, data: planList });
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

/**
 * @description 获取我的计划列表
 */
router.get(
  '/list/my',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    UserPlan.aggregate()
      .match({ userId: req.user._id })
      .lookup({
        from: 'plans',
        localField: 'planId',
        foreignField: '_id',
        as: 'plan',
      })
      .unwind('plan')
      .then(result => {
        res.json({ data: result, success: true });
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

/**
 * @description 获取计划详细
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    Promise.all([
      Plan.findById(req.user.plan),
      UserPlan.findOne({ planId: req.user.plan, userId: req.user._id }),
    ]).then(([plan, userPlan]) => {
      const today = userPlan.completeList.filter(item => {
        const date = new Date(item.date);
        const day = date.getDate();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const currentDay = new Date().getDate();
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        return (
          day === currentDay && month === currentMonth && year === currentYear
        );
      });
      const planInfo = {
        name: plan.name,
        total: plan.wordList.length,
        complete: userPlan.completeList.length,
        today: today.length,
      };
      res.json({ data: planInfo, success: true });
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
    refreshUserLastDate(req.user._id);
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
        throw err;
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
    refreshUserLastDate(req.user._id);
    Plan.findByIdAndDelete(req.params.planId)
      .then(plan => {
        if (plan) {
          // console.log(plan);
          return Promise.all([
            Word.updateMany({ _id: plan.wordList }, { $unset: { planId: '' } }),
            User.updateMany({ planId: plan._id }, { $unset: { plan: '' } }),
            UserPlan.deleteOne({ planId: plan._id }),
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

/**return
 * @description 用户选择计划
 */
router.post(
  '/select/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
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
              newUserPlan.save().then(() => res.json({ success: true }));
            } else {
              res.json({ success: true });
            }
          },
        );
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

/**
 * @description 重新开始计划
 */
router.put(
  '/:planId/reload',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    UserPlan.findOneAndUpdate(
      { userId: req.user._id, planId: req.params.planId },
      { $set: { completeList: [] } },
      { new: true },
    )
      .then(userPlan => {
        if (userPlan) res.json(true);
      })
      .catch(err => {
        res.status(500).json(err);
        throw err;
      });
  },
);

module.exports = router;
