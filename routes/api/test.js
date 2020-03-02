const express = require('express');
const passport = require('passport');

const User = require('../../models/user');
const Plan = require('../../models/plan');
const validatorPlanInput = require('../../validator/plan');
const router = express.Router();

/**
 * @description 添加计划
 */
router.get(
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
 * @description 计划列表
 */
router.get(
  '/plan/list',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {},
);

/**
 * @description 获取测试题列表
 */
router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {},
);

/**
 * @description 用户计划
 */
router.get(
  '/user',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {},
);
