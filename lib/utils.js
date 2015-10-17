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
    result[key] = _getVar(data, paramsTemplate[key]);
  }

  return result;
};

exports.formatPath = function(props, path, path_params, query, to) {
  var data = {};
  path_params = path_params || {};
  data.self = props;
  data.to = to.props || {};

  _.forIn(path_params, function(value, key) {
    if (value.indexOf('.') !== -1) {
      value = _getVar(data, value);
    }
    path = path.replace(key, value);
  });
  
  if (query) path += '?';

  _.forIn(query, function(value, key) {
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

exports.deepGet = function(obj, keys) {
  var keyArray = keys.split('.');
  var result = obj;

  keyArray.forEach(function(key) {
    if (!result.hasOwnProperty(key)) {
      console.log('Warninig obtain value get undefined');
    }
    result = result[key];
  });

  return result;
};

function _getVar(data, value) {
  var arr = value.split('.');
  if (!data.hasOwnProperty(arr[0]) || !data[arr[0]].hasOwnProperty(arr[1])) {
    console.log('Warning: bad params name');
    return value;
  }

  return data[arr[0]][arr[1]];
}
