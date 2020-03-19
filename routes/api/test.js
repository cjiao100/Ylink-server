const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const Plan = require('../../models/plan');
// const WordBook = require('../../models/wordbook');
const validatorPlanInput = require('../../validator/plan');
const router = express.Router();

/**
 * @description 添加计划
 */
router.post(
  '/plan/add',
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
      .then(plan => res.json(plan))
      .catch(err => console.log(err));
  },
);

/**
 * @description 配置计划
 */
router.put(
  '/plan/edit/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findById(req.params.planId).then(plan => {
      if (!req.body.word) {
        return res.status(400).json('word的不可为空');
      }
      const word = JSON.parse(req.body.word);
      plan.wordlist.push(...word);
      plan
        .save()
        .then(result => {
          res.json(result);
        })
        .catch(err => {
          console.log(err);
          new Error(err.message);
        });
    });
  },
);

/**
 * @description 计划列表
 */
router.get(
  '/plan/list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.find().then(planList => {
      // console.log(res);
      res.json(planList);
    });
  },
);

/**
 * @description 用户选择计划
 */
router.post(
  '/plan/select/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // res.json(req.params);
    Plan.findById(req.params.planId).then(plan => {
      User.findById(req.user._id).then(user => {
        user.plan.currentPlanId = req.params.planId;
        const p = {
          planId: plan._id,
          total: plan.wordlist.length,
          complete: [],
          error: [],
        };
        if (!user.plan.planList) {
          user.plan.planList = [p];
          // console.log(temp);
        } else {
          const temp = user.plan.planList.filter(item => {
            return item.planId.toString() === req.params.planId.toString();
          });

          if (temp.length === 0) {
            console.log(temp);
            user.plan.planList.push(p);
          }
        }

        user.save().then(t => {
          res.json(t);
        });
      });
    });
  },
);

/**
 * @description 获取计划的单词列表
 */

module.exports = router;
