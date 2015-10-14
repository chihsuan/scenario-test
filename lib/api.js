var utils = require('./utils');

function API(spec) {
  utils.updateProps.call(this, spec);
}

module.exports = API;
