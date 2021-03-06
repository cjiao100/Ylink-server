const express = require('express');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { upload, errorMessage } = require('../config/multer');
const refreshUserLastDate = require('../util/refreshLastDate');

const avatar = upload.single('avatar');
router.post(
  '/avatar',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    avatar(req, res, err => {
      // 发生错误
      if (err instanceof multer.MulterError) {
        res.status(500).json(errorMessage(err.code) || err.message);
      } else if (err) {
        console.log(err);
      } else {
        fs.copyFile(
          req.file.path,
          `${req.file.destination}/avatar/${req.file.filename}.png`,
          err => {
            if (err) throw err;
            fs.unlink(req.file.path, err => {
              if (err) throw err;
              res.json({ url: `/avatar/${req.file.filename}.png` });
            });
          },
        );
      }
    });
  },
);

const article = upload.array('photos', 5);
router.post(
  '/article',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    article(req, res, err => {
      if (err instanceof multer.MulterError) {
        res.status(500).json(errorMessage(err.code) || err.message);
      } else if (err) {
        console.log(err);
        // 发生错误
      } else {
        const files = [];
        req.files.forEach(file => {
          fs.copyFileSync(
            file.path,
            `${file.destination}/article/${file.filename}.png`,
          );
          files.push(`/article/${file.filename}.png`);
          fs.unlink(file.path, err => {
            if (err) throw err;
          });
        });
        res.json({ errno: 0, data: files });
      }
    });
  },
);

const posts = upload.single('photo');
router.post(
  '/post',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    refreshUserLastDate(req.user._id);
    posts(req, res, err => {
      // 发生错误
      if (err instanceof multer.MulterError) {
        const message = errorMessage(err.code) || err.message;
        res.status(500).json({ filename: req.body.fileName, message });
      } else if (err) {
        console.log(err);
      } else {
        fs.copyFile(
          req.file.path,
          `${req.file.destination}/post/${req.file.filename}.png`,
          err => {
            if (err) throw err;
            fs.unlink(req.file.path, err => {
              if (err) throw err;
              res.json({
                url: `/post/${req.file.filename}.png`,
                filename: req.file.originalname,
                type: req.file.mimetype,
                success: true,
              });
            });
          },
        );
      }
    });
  },
);

module.exports = router;
