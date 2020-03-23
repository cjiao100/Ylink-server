const express = require('express');
const passport = require('passport');

const WordBook = require('../../models/wordbook');
const Word = require('../../models/word');
const User = require('../../models/user');
const router = express.Router();

/**
 * @description 查询单词本列表
 */
router.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    WordBook.findById(req.user.wordbook)
      .then(wordbook => {
        // res.json(wordbook);
        return Word.find({ _id: wordbook.wordList });
      })
      .then(wordList => {
        res.json(wordList);
      })
      .catch(err => {
        res.status(500).json(err.message);
        throw err;
      });
  },
);

/**
 * @description 添加单词本
 */
router.post(
  '/add',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    // console.log(req.body);
    if (!req.body.wordId) {
      return res.status(400).json({ message: 'wordId不可为空' });
    }
    User.findById(req.user._id)
      .then(user => {
        if (!user.wordbook) {
          const newWordBook = new WordBook({
            wordList: [req.body.wordId],
          });
          newWordBook
            .save()
            .then(wordbook => {
              user.wordbook = wordbook._id;
              return user.save();
            })
            .then(temp => {
              res.json(temp);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json(err.message);
            });
        } else {
          WordBook.findById(user.wordbook)
            .then(wordbook => {
              if (
                wordbook.wordList.some(
                  item => item.toString() === req.body.wordId,
                )
              ) {
                throw { message: '已经在单词本中' };
              } else {
                wordbook.wordList.push(req.body.wordId);
              }
              return wordbook.save();
            })
            .then(temp => {
              res.json(temp);
            })
            .catch(err => {
              console.log(err);
              res.status(500).json(err.message);
            });
        }
      })
      .catch(err => {
        res.status(500).json('异常');
        throw err;
      });
  },
);

/**
 * @description 删除单词本中的单词
 */
router.delete(
  '/delete/:wordId',
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    WordBook.findById(req.user.wordbook)
      .then(wordbook => {
        wordbook.wordList = wordbook.wordList.filter(
          item => item.toString() !== req.params.wordId,
        );

        return wordbook.save();
      })
      .then(wordbook => {
        res.json(wordbook);
      })
      .catch(err => {
        res.status(500).json(err.message);
        throw err;
      });
  },
);

module.exports = router;
