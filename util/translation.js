const axios = require('axios');
const querystring = require('querystring');
const sha256 = require('js-sha256');

const { appKey, key, youdaoURI, salt, curTime } = require('../config/keys');
const truncate = require('./truncate');

module.exports = ({ query, from, to }) => {
  const str = appKey + truncate(query) + salt() + curTime + key;
  const sign = sha256(str);
  const params = {
    q: query,
    appKey: appKey,
    salt: salt(),
    from: from,
    to: to,
    sign: sign,
    signType: 'v3',
    curtime: curTime,
  };
  const targetURL = `${youdaoURI}?${querystring.stringify(params)}`;
  return axios.get(targetURL);
};
