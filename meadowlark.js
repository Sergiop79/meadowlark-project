'use strict';

var fortune = require('./lib/fortune');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');

//config handlebars
var hbs = exphbs.create({
  defaultLayout:'main'
});


app.set('port', process.env.PORT || 3000);

// set up handlebars view engine
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// static files
app.use(express.static(__dirname + '/public'));

// middleware for tests
app.use(function (req, res, next) {
  res.locals.showTests = app.get('env') !== 'production' &&
    req.query.test === '1';
  next();
});

// routes
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about', {
    fortune: fortune.getFortune(),
    pageTestScript: '/qa/tests-about.js'
  });
});

app.get('/tours/hood-river', function (req, res) {
  res.render('tours/hood-river');
});

app.get('/tours/oregon-coast', function (req, res) {
  res.render('tours/oregon-coast');
});

app.get('/tours/request-group-rate', function (req, res) {
  res.render('tours/request-group-rate');
});

// custom 404 page
app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

// custom 505 page
app.use(function (err, req, res) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// the server is listening
app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' +
    app.get('port') + '; press Ctrl + C to terminate.');
});
