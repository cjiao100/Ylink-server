const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  const errors = {};

  data.content = isEmpty(data.content) ? '' : data.content;

  if (Validator.isEmpty(data.content)) {
    errors.content = '评论内容不能为空';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
