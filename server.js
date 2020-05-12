const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./config/keys').mongoURI;
const upload = require('./routes/upload');
const index = require('./routes/index');
const admin = require('./routes/admin');
const search = require('./routes/search');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  next();
});

// 挂载静态目录
app.use(express.static('temp'));

// 使用bodyParser
app.use(
  bodyParser.urlencoded({
    extended: false,
  }),
);
app.use(bodyParser.json());

app.use(passport.initialize());
require('./config/passport')(passport);

// 定义路由
app.use('/ylink/', index);
app.use('/ylink/admin', admin);
app.use('/ylink/upload', upload);
app.use('/ylink/search', search);

// 连接mongodb数据库
mongoose.set('useFindAndModify', false);
mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    user: 'cjw',
    pass: 'cjw',
    dbName: 'ylink',
  })
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(err => console.log(err));

app.get('/login', (req, res) => {
  res.json({ message: 'Hello Word', success: true });
});

app.post('/', (req, res) => {
  res.json({ message: 'Hello', success: true });
});

app.listen(port, () => {
  console.log(`Server is runing on port ${port}`);
});
