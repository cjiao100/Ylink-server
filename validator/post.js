const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  const errors = {};

  data.title = isEmpty(data.title) ? '' : data.title;
  data.content = isEmpty(data.content) ? '' : data.content;

  if (Validator.isEmpty(data.title)) {
    errors.title = '标题不能为空';
  }

  if (Validator.isEmpty(data.content)) {
    errors.content = '内容不能为空';
  }

  if (!Validator.isLength(data.title, { min: 0, max: 30 })) {
    errors.title = '标题小于30字符';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
