module.exports = {
  // mongo数据库地址
  mongoURI: 'mongodb://127.0.0.1:27017',
  // Token 加密方式
  secretOrKey: 'secret',
  // 有道翻译API
  youdaoURI: 'http://openapi.youdao.com/api',
  // 有道应用ID
  appKey: '00df5ceb8844dd7a',
  // 有道应用密钥
  key: 'DuPyyCEsu5PGXguAK25lwZOplqjneNAb',
  salt: new Date().getTime(),
  curTime: Math.round(new Date().getTime() / 1000),
};
