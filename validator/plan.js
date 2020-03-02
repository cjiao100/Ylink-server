const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  const errors = {};

  data.content = isEmpty(data.name) ? '' : data.name;

  if (Validator.isEmpty(data.name)) {
    errors.name = '计划名不能为空';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
