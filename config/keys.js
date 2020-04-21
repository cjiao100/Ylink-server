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
  salt: () => {
    return new Date().getTime();
    // function S4() {
    //   return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    // }

    // return (
    //   S4() +
    //   S4() +
    //   '-' +
    //   S4() +
    //   '-' +
    //   S4() +
    //   '-' +
    //   S4() +
    //   '-' +
    //   S4() +
    //   S4() +
    //   S4()
    // );
  },
  curTime: Math.round(new Date().getTime() / 1000),

  // 邮箱服务
  smtp: {
    get host() {
      // 使用腾讯的邮箱服务
      return 'smtp.qq.com';
    },
    get user() {
      return 'cjiao100@foxmail.com';
    },
    get pass() {
      return 'ddbwwwehamaqegib';
    },
    get code() {
      return () => {
        // 生成一个4位的随机数
        return Math.random()
          .toString(16)
          .slice(2, 6)
          .toUpperCase();
      };
    },
    get expire() {
      return () => {
        // 验证码有效时间为一分钟，即设置当前时间+1分钟，当验证时直接比较即可
        return new Date().getTime() + 60 * 1000;
      };
    },
  },
};
