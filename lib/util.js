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
  var transformCb = function(err, result) {
    if (!err) {
      try {
        result = transform(result)
      } catch (e) {
        err = e
      }
    }
    cb(err, result)
  }
  transform = transform ? transform : function(result) {
    return result
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
