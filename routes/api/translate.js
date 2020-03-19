const express = require('express');

const Word = require('../../models/word');
const translation = require('../../util/translation');
const router = express.Router();

/**
 * $ GET
 * @description 翻译接口
 */
router.post('/', (req, res) => {
  Word.find({ query: req.body.query }).then(word => {
    if (word.length !== 0) {
      res.json(word);
    } else {
      const { query, from = 'auto', to = 'auto' } = req.body;
      translation({ query, from, to })
        .then(result => {
          const data = new Word({
            query: result.data.query,
            translation: result.data.translation,
            basic: result.data.basic,
            web: result.data.web,
          });
          return data.save();
        })
        .then(data => {
          res.json(data);
        })
        .catch(err => {
          new Error(err.message);
          res.status(500).json('异常');
        });
    }
  });
});

module.exports = router;
