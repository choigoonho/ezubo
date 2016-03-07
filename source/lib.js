var Q = require('q');
var http = require('http');
var parseUrl = require('url').parse;

var UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.99 Safari/537.36';

module.exports.get = get;

function get (url, method, data, headers, retries) {
  retries = retries || 0;

  var deferred = Q.defer();
  var parsed = parseUrl(url);

  headers = headers || {};
  headers['User-Agent'] =  UA;

  var req = http.request({
    hostname: parsed.hostname,
    path: parsed.path,
    method: method || 'GET',
    headers: headers
  }, function (res) {
    var body = '';
    res.on('error', function (err) {
      deferred.reject(err);
    });
    res.on('data', function (chunk) {
      body += chunk;
    });
    res.on('end', function () {
      try {
        if (body[0] === '{' || body[0] === '[') {
          body = JSON.parse(body);
        }
      } finally {
        deferred.resolve(body);
      }
    });
  });
  req.setTimeout(10000, function () {
    if (retries < 5) {
      get(url, method, data, headers, retries + 1).then(function (data) {
        deferred.resolve(data);
      }, function (err) {
        deferred.reject(err);
      });
    } else {
      deferred.reject('timeout: ' + data);
    }
  });
  req.on('error', function (err) {
    deferred.reject(err);
  });
  req.end(data);
  return deferred.promise;
}

