var

request = require('request'),
vcap = {};

try {
  vcap = JSON.parse(process.env.VCAP_SERVICES || {});
} catch (e) {}

module.exports = function(serviceName, baseUrl) {
  var service = vcap[serviceName] && vcap[serviceName][0];

  return request.defaults({
    baseUrl: service ? service.credentials.url : baseUrl,
    followRedirect: true,
    json: true
  });
};
