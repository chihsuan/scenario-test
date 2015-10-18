var yaml = require('js-yaml');
var util= require('util');
var _ = require('lodash');
var fs   = require('fs');

exports.loadyaml = function(filePath) {
  try {
    return yaml.safeLoad(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.log(e);
  }
};

exports.updateProps = function(properties) {
  for(var key in properties) {
    this[key] = properties[key];
  }
};

exports.formatParams = function(props, paramsTemplate, argv, to) {
  var result = {};
  var data = {};
  data.self = props;
  data.argv = argv || {};
  data.to = to.props || {};
  if (_.isString(paramsTemplate) && data.hasOwnProperty(paramsTemplate)) {
    return data[paramsTemplate];
  }

  for(var key in paramsTemplate) {
    result[key] = deepGet(data, paramsTemplate[key]);
  }

  return result;
};

exports.formatPath = function(props, path, path_params, query, query_params, to) {
  var data = {};
  path_params = path_params || {};
  data.self = props;
  data.argv = query_params || {};
  data.to = to.props || {};

  _.forIn(path_params, function(value, key) {
    if (value.indexOf('.') !== -1) {
      value = deepGet(data, value);
    }
    path = path.replace(key, value);
  });
  
  if (query) path += '?';

  _.forIn(query, function(value, key) {
    if (value.indexOf('.') !== -1) {
      value = _getVar(data, value);
    }
    if (value !== undefined)
      path += util.format('%s=%s&', key, value);
  });

  return path;
};

exports.formatExpects = function(obj) {
  var expects = {};
  for (var key in obj) {
    expects[key.substr(key.indexOf(' ')+1)] = obj[key];
  }
  return expects;
};

var deepGet = exports.deepGet = function (obj, keys) {
  var keyArray = keys.split('.');
  var result = obj;

  keyArray.forEach(function(key) {
    var match;
    if (key.indexOf('[') !== -1) {
      var reg = /(.*)\[(\d)\]/;
      match = reg.exec(key);
      key = match[1];
    }

    if (!result.hasOwnProperty(key)) {
      console.log('Warninig: ' +  key + ' get undefined');
    }

    result = result[key];

    if (match) {
      result = result[match[2]];
    }
  });

  return result;
};

