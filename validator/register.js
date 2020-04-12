const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = data => {
  let errors = '';

  data.name = !isEmpty(data.name) ? data.name : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password : '';

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors = '名字的长度不小于2位大于30位';
  }

  if (Validator.isEmpty(data.name)) {
    errors = '名字不能为空';
  }

  if (!Validator.isEmail(data.email)) {
    errors = '邮箱不合法';
  }

  if (Validator.isEmpty(data.email)) {
    errors = '邮箱不能为空';
  }

  if (Validator.isEmpty(data.password)) {
    errors = '密码不能为空';
  }

  if (Validator.isEmpty(data.password2)) {
    errors = '确认密码不能为空';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 20 })) {
    errors = '密码长度不小于6位大于20位';
  }

  if (!Validator.equals(data.password, data.password2)) {
    errors = '密码不一致';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
