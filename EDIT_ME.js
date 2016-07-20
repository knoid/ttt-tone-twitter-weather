var

// https://github.com/request/request
requestWrapper = require('./server/request'),

// http://www.ibm.com/watson/developercloud/tone-analyzer/api/v3/?node
tone_analyzer = require('./server/tone_analyzer'),

// https://console.ng.bluemix.net/docs/services/Twitter/index.html
twitter = requestWrapper('twitterinsights'),

// https://console.ng.bluemix.net/docs/services/Weather/index.html
weather = requestWrapper('weatherinsights');

module.exports = function(req, res) {
  // sample output
  res.json([
    {
      text: 'this is a tweet',
      group: 'group name by location',
      tone: Number,
      weather: Number
    }
  ]);
};
