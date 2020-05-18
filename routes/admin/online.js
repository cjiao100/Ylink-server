const express = require('express');
const passport = require('passport');

const Online = require('../../models/online');
const router = express.Router();

router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const online = await Online.find();
    res.json(online);
  },
);

module.exports = router;
