var

express = require('express'),
morgan = require('morgan'),
serveStatic = require('serve-static'),

port = process.env.PORT || 3000;

express().
  use(morgan('dev')).
  use(serveStatic(__dirname + '/public')).
  get('/output', require('../EDIT_ME')).
  listen(port, function() {
    console.log('Server started, listening on port', port);
  });
