const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  if (!Validator.isEmail(data.email)) {
    errors.message = '邮箱不合法';
  }

  if (Validator.isEmpty(data.email)) {
    errors.message = '邮箱不能为空';
  }

  if (Validator.isEmpty(data.password)) {
    errors.message = '密码不能为空';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
