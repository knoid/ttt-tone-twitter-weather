var

request = require('request'),
vcap = JSON.parse(process.env.VCAP_SERVICES || {});

module.exports = function(serviceName) {
  var service = vcap[serviceName] && vcap[serviceName][0];

  return request.defaults({
    baseUrl: service.credentials.url,
    followRedirect: true,
    json: true
  });
};
