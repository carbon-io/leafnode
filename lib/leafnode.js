var DB = require('./db').DB
var sync = require('./util').sync
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var Server = require('mongodb').Server
var NativeDB = require('mongodb').Db
var mongodbUri = require("mongodb-uri")

/**
 * connect
 *
 * @param {!String} uri
 * @param {Object=} options
 * @param {Boolean} singleNodeConnection
 *
 * Options are as specified for MongoClient.connect
 * http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
 *
 * Unfortunately, MongoClient.connect will always return a connection to the master node if it can find one.
 * In order to connect to specific node, set singleNodeConnection to true and a different connection strategy
 * will be used. singleNodeConnections cannot recognize URI options.
 *
 */
function connect(uri, options, singleNodeConnection) {
  if(singleNodeConnection){
    return _singleNodeConnect(uri,options)
  }
  else{
    // Don't call DB.connect() as it defers to the native Db.connect(), which doesn't use MongoClient
    return new DB(sync(MongoClient, 'connect', arguments))
  }
}


/**
 * _singleNodeConnect
 *
 * @param {!String} uri
 * @param {Object=} options
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
function _singleNodeConnect(uri, options){
    var uriObj = mongodbUri.parse(uri)
    if (uriObj.hosts.length > 1) {
      throw new Error("Multiple hosts found for single node connection")
    }
    var host = uriObj.hosts[0]
    var serverOptions = options["server"] || null
    var dbOptions = options["db"] || options["database"] || null

    var server = new Server(host.host, host.port, serverOptions)
    var db = new NativeDB(uriObj.database, server, dbOptions)
    db = sync(db, 'open')

    if (uriObj.username && uriObj.password) {
      var authed = sync(db, 'authenticate',[uriObj.username, uriObj.password, {}])
      if (!authed) {
        throw new Error("Unable to authenticate")
      }
    }

    return new DB(db)
}

/****************************************************************************************************
 * exports
 */
module.exports = {
  connect: connect,
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
