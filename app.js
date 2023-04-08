require('dotenv').config(); // su dung thu vien doc file env
//var createError = require('http-errors');
var express = require('express');

var mongoose = require('mongoose');
var passport = require('passport');
var config = require('./config/database');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var apiRouter = require('./routes/api');
const expressHbs = require('express-handlebars');
const bodyParser = require('body-parser');
var session = require('express-session');
var app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.engine('.hbs', expressHbs.engine({defaultLayout: 'main' ,extname: "hbs",layoutsDir: './views/layouts'}));

app.set('view engine', '.hbs');
app.set('views', './views');

//sesison đặt trước router
app.set('trust proxy', 1) // trust first proxy

app.use(session({
  secret:process.env.KEY_SESSION, // chuỗi ký tự đặc biệt để Session mã hóa, tự viết
  resave:false,
  saveUninitialized:false
}));
app.use((req, res, next) => {
  if (req.session.token) {
    req.headers.authorization = `Bearer ${req.session.token}`;
  }
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/api', apiRouter);

mongoose.connect(config.database, { useNewUrlParser: true, useUnifiedTopology: true });

// var cors = require('cors')

// app.use(cors());

app.use(passport.initialize());



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('404 - Khong tim thay trang')
  next();
});

module.exports = app;

const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
