const crypto = require('crypto');
const fs = require('fs');
const jdenticon = require('jdenticon');

// 生成默认头像
module.exports = (id = Math.random().toString(), size = 150) => {
  // 根据ID 生成MD5值
  let md5 = crypto.createHash('md5').update(id);
  md5 = md5.digest('hex');

  // 生成图片svg
  let avatar = jdenticon.toPng(md5, size);
  // 将图片保存在本地服务器上
  fs.writeFileSync(`./temp/avatar/${md5}.png`, avatar);

  // 返回图片地址
  return `/avatar/${md5}.png`;
};
