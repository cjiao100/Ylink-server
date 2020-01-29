const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;

const db = require('./config/keys').mongoURI;

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
