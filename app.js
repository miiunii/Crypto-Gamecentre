const express = require('express');
const app = express();
const indexRouter = require('./routes/index');
const bodyParser = require('body-parser');
const sessionParser = require('express-session');
const mysqlStroe = require('express-mysql-session')(sessionParser);
const dbOption = require('./config/db.json')

require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss.l');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(sessionParser({
    secret: 'abcdefghijklmnopqrstuvwxyz',
    resave: false,
    saveUninitialized: true,
    store: new mysqlStroe(dbOption)
}));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

app.use('/', indexRouter);

app.listen(3000, function(){
    console.log('Server start: port 3000');
});