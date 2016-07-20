var

express = require('express'),
morgan = require('morgan'),

port = process.env.PORT || 3000;

express().
  use(morgan('dev')).
  use(express.static(__dirname + '/../public')).
  get('/output', require('../EDIT_ME')).
  listen(port, function() {
    console.log('Server started, listening on port', port);
  });
