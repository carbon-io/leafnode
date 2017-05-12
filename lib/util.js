var syncInvoke = require('@carbon-io/fibers').syncInvoke

/**
 * sync
 *
 * Based on technique used by 0ctave and olegp:
 *     (https://github.com/0ctave/node-sync/blob/master/lib/sync.js)
 *     (https://github.com/olegp/mongo-sync/blob/master/lib/mongo-sync.js)
 *
 * @param {Object} that - receiver
 * @param {String} method - name of method
 * @param {Array} args
 *
 * @return {*} returns what the method would have returned via the supplied callback
 * @throws {Error} 
 *
 * @ignore
 */
var sync = syncInvoke

var syncOrAsync = function (that, methodOrFunction, args, transform, cb) {
  var mof = that ? that[methodOrFunction] : methodOrFunction
  var transformCb = function(err) {
    var result = undefined
    if (!err) {
      try {
        result = transform.apply(
          undefined, Array.prototype.slice.call(arguments, 1))
      } catch (e) {
        err = e
      }
    }
    cb.apply(undefined, (new Array(err)).concat(result))
  }
  transform = transform ? transform : function() {
    return arguments.length === 1 ? arguments[0] : arguments
  }
  if (cb) {
    return mof.apply(that, Array.prototype.concat.call(args, transformCb))
  }
  return transform(syncInvoke(that, methodOrFunction, args))
}

// XXX: for backward compatibility
sync.sync = sync

module.exports = {
  sync: sync,
  syncOrAsync: syncOrAsync
}
