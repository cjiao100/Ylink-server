const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../temp'));
  },
});

const limits = {
  fieldSize: 5 * 1024 * 1024,
  fileSize: 5 * 1024 * 1024,
};

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new multer.MulterError('FILE_TYPE'));
  }
};

const upload = multer({ storage, limits, fileFilter });

const errorMessage = code => {
  switch (code) {
    case 'FILE_TYPE':
      return '文件类型错误，仅支持png/jpg';
    case 'LIMIT_UNEXPECTED_FILE':
      return '文件数量超过上传上限';
    case 'LIMIT_FILE_SIZE':
      return '文件大小超过上传上限';
    default:
      return;
  }
};

module.exports = {
  upload,
  errorMessage,
};
