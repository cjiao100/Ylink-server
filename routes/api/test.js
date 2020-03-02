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

// /**
//  * @description 获取测试题列表
//  */
// router.get(
//   '/user',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {},
// );

// /**
//  * @description 用户计划
//  */
// router.get(
//   '/user',
//   passport.authenticate('jwt', { session: false }),
//   (req, res) => {},
// );

module.exports = router;
