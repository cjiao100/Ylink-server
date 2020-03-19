const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  const errors = {};

  data.name = isEmpty(data.name) ? '' : data.name;

  if (Validator.isEmpty(data.name)) {
    errors.message = '计划名不能为空';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
