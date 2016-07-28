var

// https://github.com/request/request
requestWrapper = require('./server/request'),

// http://www.ibm.com/watson/developercloud/tone-analyzer/api/v3/?node
tone_analyzer = require('./server/tone_analyzer'),

// https://console.ng.bluemix.net/docs/services/Twitter/index.html
twitter = requestWrapper('twitterinsights'),

// https://console.ng.bluemix.net/docs/services/Weather/index.html
weather = requestWrapper('weatherinsights');

var
NY = [40.780707, -73.965284],
UK = [57.1526, 2.1100],
geo = NY;

function toISOString(d) {
  return d.toISOString().replace('.000Z', 'Z');
}

function hasError(args, next) {
  var err = args[0] || typeof args[2] === 'string' && args[2];
  if (err) {
    next(err);
    return err;
  }
}

module.exports = function(req, res, next) {
  weather.get('/api/weather/v1/geocode/'+geo[0]+'/'+geo[1]+'/observations/timeseries.json', {
    qs: {
      hours: 24,
      units: 'm'
    }
  }, function(err, r, weatherRes) {
    if (hasError(arguments, next)) {
      return;
    }

    var dates = [Infinity, -Infinity];
    weatherRes.observations.forEach(function(obs) {
      if (dates[0] > obs.valid_time_gmt) {
        dates[0] = obs.valid_time_gmt;
      }
      if (dates[1] < obs.expire_time_gmt) {
        dates[1] = obs.expire_time_gmt;
      }
    });
    dates = dates.map(function(date) {
      return new Date(date * 1000);
    });

    console.log('Getting twitter data from', dates[0], 'to', dates[1]);

    twitter.get('/api/v1/messages/search', {
      qs: {
        q: [
          'lang:en',
          'point_radius:[' + geo[0] + ' ' + geo[1] + ' 5.0mi]',
          'posted:' + toISOString(dates[0]) + ',' + toISOString(dates[1])
        ].join(' ')
      }
    }, function(err, r, twitterRes) {
      if (hasError(arguments, next)) {
        return;
      }

      console.log('Analyzing tone for', twitterRes.tweets.length, 'tweets.');

      tone_analyzer.tone({
        text: twitterRes.tweets.map(function(tweet) {
          return tweet.message.body.
              replace(/\n+/g, '; ').
              replace(/\.+/g, ';').
              replace(/http(s):\/\/\S+/g, '') + '.';
        }).join('\n'),
        tones: 'emotion'
      }, function(err, toneRes) {
        if (hasError(arguments, next)) {
          return;
        }

        console.log('Got', toneRes.sentences_tone.length, 'sentences analyzed');

        var output = twitterRes.tweets.map(function(tweet, i) {
          var w,
          toneCategories = toneRes.sentences_tone[i].tone_categories,
          postedTime = new Date(tweet.message.postedTime),
          weather = null;
          for (w = weatherRes.observations.length - 1; w >= 0; w--) {
            weather = weatherRes.observations[w];
            if (weather.valid_time_gmt * 1000 < postedTime &&
                postedTime < weather.expire_time_gmt * 1000) {
              break;
            }
          }

          return {
            text: tweet.message.body,
            tone: toneCategories.length > 0 && toneCategories[0].tones[3],
            weather: weather.wx_phrase,
            weather_icon: weather.wx_icon
          };
        });
        res.json(output);
      });
    });
  });
};
