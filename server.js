const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./config/keys').mongoURI;
const user = require('./routes/api/user');
const article = require('./routes/api/article');
const upload = require('./routes/api/upload');
const translate = require('./routes/api/translate');
const test = require('./routes/api/test');
const wordbook = require('./routes/api/wordbook');
const word = require('./routes/api/word');
const plan = require('./routes/api/plan');
const post = require('./routes/api/post');
const topic = require('./routes/api/topic');

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
app.use('/ylink/', upload);
app.use('/ylink/user', user);
app.use('/ylink/article', article);
app.use('/ylink/translate', translate);
app.use('/ylink/test', test);
app.use('/ylink/wordbook', wordbook);
app.use('/ylink/word', word);
app.use('/ylink/plan', plan);
app.use('/ylink/post', post);
app.use('/ylink/topic', topic);

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

app.get('/', (req, res) => {
  res.json({ message: 'Hello Word', success: true });
});

app.post('/', (req, res) => {
  res.json({ message: 'Hello', success: true });
});

app.listen(port, () => {
  console.log(`Server is runing on port ${port}`);
});
