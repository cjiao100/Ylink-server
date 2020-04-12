const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  let errors = '';

  data.name = isEmpty(data.name) ? '' : data.name;

  if (Validator.isEmpty(data.name)) {
    errors = '计划名不能为空';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
