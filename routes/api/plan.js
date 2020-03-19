const express = require('express');
const passport = require('passport');

const Plan = require('../../models/plan');
const Word = require('../../models/word');
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
 * @description 配置计划
 */
router.put(
  '/config/:planId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    Plan.findById(req.params.planId)
      .then(plan => {
        plan.wordList.push(...JSON.parse(req.body.wordList));
        return plan.save();
      })
      .then(plan => {
        const wordList = JSON.parse(req.body.wordList);
        return Word.updateMany(
          { _id: wordList },
          { planId: plan._id },
          { multi: true },
        );
      })
      .then(result => {
        if (result.ok) res.json(true);
      })
      .catch(err => {
        res.status(500).json(err);
      });
  },
);

module.exports = router;
