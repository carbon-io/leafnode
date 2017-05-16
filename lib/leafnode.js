var async = require('async')
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var Server = mongodb.Server
var NativeDB = mongodb.Db
var mongodbUri = require("mongodb-uri")

var DB = require('./db').DB
var errors = require('./errors')
var syncOrAsync = require('./util').syncOrAsync
var sync = require('./util').sync

/**
 * connect
 *
 * @param {!String} uri
 * @param {Object=} options
 * @param {Boolean} singleNodeConnection
 * @param {function} [cb=undefined] execute asynchronously if present (signature: cb(err, result))
 * @return {Object} returns the database object
 *
 * Options are as specified for MongoClient.connect
 * http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
 *
 * Unfortunately, MongoClient.connect will always return a connection to the
 * master node if it can find one.  In order to connect to specific node, set
 * singleNodeConnection to true and a different connection strategy will be
 * used. singleNodeConnections cannot recognize URI options.
 *
 */
function connect(uri, options, singleNodeConnection, cb) {
  if(singleNodeConnection){
    return _singleNodeConnect(uri, options, cb)
  } else {
    // Don't call DB.connect() as it defers to the native Db.connect(), which
    // doesn't use MongoClient
    return syncOrAsync(
      MongoClient, 'connect', [uri, options], function(db) {
        return new DB(db)
      }, cb
    )
  }
}


/**
 * _singleNodeConnect
 *
 * @param {!String} uri
 * @param {Object=} options
 * @param {function} [cb=undefined] execute asynchronously if present (signature: cb(err, result))
 *
 * Options are as specified for MongoClient.connect
 * http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
 *
 * MongoClient.connect will return a Master connection if available, regardless of the node specified.
 * The _singleNodeConnect strategy ensures that a connection to the specified node is returned,
 * not necessarily Master.
 *
 * This connection strategy cannot recognize URI options.
 */
function _singleNodeConnect(uri, options, cb){
  var uriObj = mongodbUri.parse(uri)
  if (uriObj.hosts.length > 1) {
    var err = new Error("Multiple hosts found for single node connection")
    if (cb) {
      return cb(err)
    }
    throw err
  }
  var host = uriObj.hosts[0]
  var serverOptions = options["server"] || null
  var dbOptions = options["db"] || options["database"] || null

  var server = new Server(host.host, host.port, serverOptions)
  var db = new NativeDB(uriObj.database, server, dbOptions)

  var seq = async.seq(
    function(db, cb) {
      return db.open(cb)
    },
    function(db, cb) {
      if (uriObj.username && uriObj.password) {
        return db.authenticate(uriObj.username, uriObj.password, {}, function(err, authed) {
          return cb(err ? new Error("Unable to authenticate") : undefined, db)
        })
      }
      return cb(undefined, db)
    })

  return syncOrAsync(undefined, seq, [db], function(db) {
      return new DB(db)
  }, cb)
}

/****************************************************************************************************
 * exports
 */
module.exports = {
  connect: connect,
  errors: errors,
  mongodb: mongodb
}

/*
  bson: { // XXX not sure if we want all of these exported, but this is everything mongodb exports from BSON
    Binary: mongodb.Binary,
    Code: mongodb.Code,
    Map: mongodb.Map,
    DBRef: mongodb.DBRef,
    Double: mongodb.Double,
    Long: mongodb.Long,
    MinKey: mongodb.MinKey,
    MaxKey: mongodb.MaxKey,
    ObjectId: mongodb.ObjectId,
    Symbol: mongodb.Symbol,
    Timestamp: mongodb.Timestamp,
    Decimal128: mongodb.Decimal128
  },
*/

Object.defineProperty(module.exports, '$Test', {
  enumerable: false,
  configurable: false,
  writeable: false,
  get: function() {
    return require('../test/index.js')
  }
})
