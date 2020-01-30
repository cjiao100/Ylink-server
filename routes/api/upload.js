const express = require('express');
const passport = require('passport');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { upload, errorMessage } = require('../../config/multer');

const avatar = upload.single('avatar');
router.post(
  '/upload/avatar',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    avatar(req, res, err => {
      // 发生错误
      if (err instanceof multer.MulterError) {
        res.status(500).json(errorMessage(err.code) || err.message);
      } else if (err) {
        console.log(err);
        // 发生错误
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
  '/upload/article',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
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
          files.push({
            filename: file.originalname,
            url: `/article/${file.filename}.png`,
          });
          fs.unlink(file.path, err => {
            if (err) throw err;
          });
        });
        res.json(files);
      }
    });
  },
);

module.exports = router;
