var express = require('express');
var app = express();
var exphbs = require('express-handlebars');

app.set('port', process.env.PORT || 3000);

// set up handlebars view engine
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// static files
app.use(express.static(__dirname + '/public'));

// fortunes
var fortunes = [
  'Conquer your fears or they will conquer you',
  'Rivers need springs',
  'Do not fear what yo don\'t know',
  'You will have a pleasant surprise',
  'Whenever possible, keep it simple'
];


// new routes
app.get('/', function (req, res) {
  res.render('home');
});

app.get('/about', function (req, res) {
  var randomFortune =
      fortunes[Math.floor(Math.random() * fortunes.length)];
  res.render('about', {fortune: randomFortune});
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
