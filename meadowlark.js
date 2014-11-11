'use strict';

var fortune = require('./lib/fortune');
var express = require('express');
var app = express();
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var jqupload = require('jquery-file-upload-middleware');
var credentials = require('./credentials');

//config handlebars
var hbs = exphbs.create({
  defaultLayout: 'main',
  helpers: {
    section: function (name, options) {
      if (!this._sections) {
        this._sections = {};
      }
      this._sections[name] = options.fn(this);
      return null;
    }
  }
});

// cookies and sessions
app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());

// body-parser
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// port
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

// file uploads
app.use('/upload', function (req, res, next) {
  var now = Date.now();
  jqupload.fileHandler({
    uploadDir: function () {
      return __dirname + '/public/uploads/' + now;
    },
    uploadUrl: function () {
      return '/uploads/' + now;
    }
  })(req, res, next);
});

// flash messages middleware
app.use(function (req, res, next) {
  // if there's a flash message, transfer
  // it to the context, then clear it
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// routes
app.get('/', function (req, res) {
  res.cookie('monster', 'mom mom');
  res.cookie('signed_monster', 'mom mom', {
    signed: true
  });
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

app.get('/nursery-rhyme', function (req, res) {
  res.render('nursery-rhyme');
});

app.get('/data/nursery-rhyme', function (req, res) {
  res.json({
    animal: 'squirrel',
    bodyPart: 'tail',
    adjective: 'bushy',
    noun: 'heck'
  });
});

app.get('/newsletter', function (req, res) {
  // we will lear about CSRF later ..for now we just
  // provide a dummy value
  res.render('newsletter', {
    csrf: 'CSRF token goes here'
  });
});

// for now we're mocking NewsLetterSignUp:
function NewsLetterSignUp() {
  NewsLetterSignUp.prototype.save = function (cb) {
    cb();
  };
}

var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.post('/newsletter', function (req, res) {
  var name = req.body.name || '';
  var email = req.body.email || '';

  if (!email.match(VALID_EMAIL_REGEX)) {
    if (req.xhr) {
      return res.json({
        error: 'Invalid name email address'
      });
    }
    req.session.flash = {
      type: 'danger',
      intro: 'Validation Error',
      message: 'The email address you entered was not valid.'
    };
    return res.redirect(303, '/newsletter/archive');
  }
  new NewsLetterSignUp({
    name: name,
    email: email
  }).save(function (err) {
    if (err) {
      if (req.xhr) {
        return res.json({
          error: 'Database error'
        });
      }
      req.session.flash = {
        type: 'danger',
        intro: 'Database error',
        message: 'There wa a database error; please try again later.'
      };
      return res.redirect(303, '/newsletter/archive');
    }
    if (req.xhr) {
      return res.json({
        success: true
      });
    }
    req.session.flash = {
      type: 'success',
      intro: 'Thank you!',
      message: 'You have now signed up for the newsletter'
    };
    return res.redirect(303, '/newsletter/archive');
  });
});

app.get('/newsletter/archive', function (req, res) {
  res.render('newsletter/archive');
});

app.get('/thank-you', function (req, res) {
  res.render('thank-you');
});

app.post('/process', function (req, res) {
  if (req.xhr || req.accepts('json,html') === 'json') {
    res.send({
      sucess: true
    });
  } else {
    res.redirect(303, '/thank-you');
  }
});

app.get('/contest/vacation-photo', function (req, res) {
  var now = new Date();
  res.render('contest/vacation-photo', {
    year: now.getFullYear(),
    month: now.getMonth()
  });
});

app.post('/contest/vacation-photo/:year/:month', function (req, res) {
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    if (err) {
      return res.redirect(303, '/error');
    }
    console.log('received fields:');
    console.log(fields);
    console.log('received files:');
    console.log(files);
    res.redirect(303, '/thank-you');
  });
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
