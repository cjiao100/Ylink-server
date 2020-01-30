const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./config/keys').mongoURI;
const user = require('./routes/api/user');
const article = require('./routes/api/article');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
  next();
});

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
app.use('/ylink/user', user);
app.use('/ylink/article', article);

// 连接mongodb数据库
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
  res.send('Hello Word');
});

app.post('/', (req, res) => {
  res.send('hello');
});

app.listen(port, () => {
  console.log(`Server is runing on port ${port}`);
});
