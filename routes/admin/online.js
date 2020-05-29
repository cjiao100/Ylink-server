const express = require('express');
const passport = require('passport');

const Online = require('../../models/online');
const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const online = await Online.find()
      .sort({ date: -1 })
      .limit(10)
      // .sort({ date: 1 });
    res.json(online);
  },
);

module.exports = router;
