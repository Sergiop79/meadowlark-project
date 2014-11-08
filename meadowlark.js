var fortune = require('./lib/fortune');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');

app.set('port', process.env.PORT || 3000);

// set up handlebars view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// static files
app.use(express.static(__dirname + '/public'));

// new routes
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/about', function (req, res) {
  res.render('about', { fortune: fortune.getFortune() });
});


// custom 404 page
app.use(function (req, res) {
  res.status(404);
  res.render('404');
});

// custom 505 page
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

// the server is listening
app.listen(app.get('port'), function () {
  console.log('Express started on http://localhost:' +
             app.get('port') + '; press Ctrl + C to terminate.');
});
