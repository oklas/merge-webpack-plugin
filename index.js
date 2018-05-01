var JoinPlugin = require('join-webpack-plugin');
var merge = require("merge");

function stable_stringify(value) {
  if(value instanceof Array) {
    return JSON.stringify( value.map( function(item) {
      return stable_stringify(item);
    }));
  }

  if(value instanceof Object) {
    var keys = Object.keys(value).sort()
    return JSON.stringify( keys.reduce( function(obj, key) {
        obj[key] = stable_stringify(value[key]);
        return obj;
      }, {}),
      keys
   );
  }

  return JSON.stringify(value);
}

function MergePlugin(options) {

  options.join = function(common, addition) {
    return merge.recursive(
      common ? common : {},
      addition ? JSON.parse(addition) : {}
    );
  };

  options.save = function(common) {
    return options.sort ?
      stable_stringify(common) : JSON.stringify(common);
  };

  JoinPlugin.call(this,options);
}
MergePlugin.prototype = Object.create(JoinPlugin.prototype);

MergePlugin.prototype.loader = JoinPlugin.prototype.loader;
MergePlugin.loader = JoinPlugin.loader;

module.exports = MergePlugin;

