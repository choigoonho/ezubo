var _ = require('lodash');
var Q = require('q');
var fs = require('fs');
var lib = require('./lib');
var async = require('async');

function query (invest, page, ret) {
  page = page || 1;
  return lib.get(
    'http://www.ezubo.com/invest/getInvestHistory4html',
    'POST', 'page=' + page + '&id=' + invest,
    {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  ).then(function (json) {
    ret = ret || [];
    _.each(json.data, function (str) {
      var arr = str.replace('<tr><td>', '').replace('</td></tr>', '').split('</td><td>');
      ret.push(arr);
    });
    if (json.hasMore) {
      return Q.delay(1000).then(function () {
        return query(invest, page + 1, ret);
      });
    }
    return ret;
  });
}

function prettify (data) {
  var str = JSON.stringify(data, null, 2);
  str = str.replace(/\n(\s{4}|\s{2}(\]))/g, ' $2');
  var lines = str.split('\n');
  var max = 0;
  _.each(lines, function (line) {
    if (line.length > max) {
      max = line.length;
    }
  });
  return _.map(lines, function (line) {
    return line.replace(/" ](|,)$/, function (match, p1) {
      var spaces = max - line.length + p1.length;
      return '"' + Array(spaces).join(' ') + ' ]' + p1;
    });
  }).join('\n');
}

try { fs.mkdirSync('data'); } catch (e) {}

var q = async.queue(function (id, callback) {
  console.log('getting', id);
  query(id).then(function (data) {
    var content = prettify(data.map(function (item) {
      return [item[2], item[0], item[1]];
    }));
    fs.writeFileSync('data/' + id, content + '\n');
    return Q.delay(10000).then(function () {
      callback(undefined, id);
    });
  }).catch(function (err) {
    callback(err, id);
  });
}, 1);

// var toget = fs.readFileSync('toget').toString().split('\n');
// console.log(toget);

var toget = [];
for (var i = 1000; i > 0; i--) {
  if (!fs.existsSync('data/' + i)) {
    toget.push(i);
  }
}

toget.forEach(function (i) {
  q.push(i, function (err, id) {
    if (err) {
      console.error(err);
    } else {
      console.log('successfully downloaded', id);
    }
  });
});

q.drain = function () {
  console.log('successfully downloaded all records');
};
