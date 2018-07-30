var express = require('express');
var app = express();

var UserController = require('./api/controllers/UserController');
app.use('/users', UserController);
app.use(UserController);

module.exports = app;