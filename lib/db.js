var NativeDB = require('mongodb').Db
var _ = require('lodash')

var Collection = require('./collection').Collection
var syncOrAsync = require('./util').syncOrAsync

/***************************************************************************************************
 * @class DB
 * @description DB class description
 * @memberof leafnode
 */
var DB = function(nativeDb) {
  if ( nativeDb instanceof NativeDB ) {
    // This overloading is intended for internal use only (DB.connect())
    /***************************************************************************
     * @property {xxx} nativeDb -- nativeDb
     */
    this._nativeDB = nativeDb
  } else {
    throw new Error("nativeDB is not an instance of the native DB")
  }
}

/**
 * The database name
 *
 */
Object.defineProperty(DB.prototype, 'databaseName', {
  configurable: false,
  enumerable: true,
  get: function() {
    return this._nativeDB.databaseName
  }
})

/***************************************************************************************************
 * @method getCollections
 * @description Fetch all collections for the current db.
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {array} -- returns an array of objects containing collection info
 */
DB.prototype.getCollections = function(cb) {
  var self = this
  return syncOrAsync(this._nativeDB, 'collections', [], function(collections) {
    return _.map(collections, function(collection) {
      return new Collection(self, collection)
    })
  }, cb)
}

/***************************************************************************************************
 * @method getCollectionNames
 * @description Fetch all collection names for the current db.
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {array} -- returns an array of objects containing collection info
 */
DB.prototype.getCollectionNames = function(cb) {
  var query = this._nativeDB.listCollections()
  return syncOrAsync(query, 'toArray', [], function(collections) {
    return _.map(collections, function(collection) {
      return collection.name
    })
  }, cb)
}

/***************************************************************************************************
 * @method createCollection
 * @description Creates a collection on a server pre-allocating space, need to create f.ex capped collections.
 * @param {string} name -- the collection name we wish to access.
 * @param {object} [options=null] -- Optional settings.
 * @param {number|string} [options.w=null] -- The write concern.
 * @param {number} [options.wtimeout=null] -- The write concern timeout.
 * @param {boolean} [options.j=false] -- Specify a journal write concern.
 * @param {boolean} [options.raw=false] -- Return document results as raw BSON buffers.
 * @param {object} [options.pkFactory=null] -- A primary key factory object for generation of custom _id keys.
 * @param {ReadPreference|string} [options.readPreference=null] -- The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
 * @param {boolean} [options.serializeFunctions=false] -- Serialize functions on any object.
 * @param {boolean} [options.strict=false] -- Returns an error if the collection does not exist
 * @param {boolean} [options.capped=false] -- Create a capped collection.
 * @param {number} [options.size=null] -- The size of the capped collection in bytes.
 * @param {number} [options.max=null] -- The maximum number of documents in the capped collection.
 * @param {boolean} [options.autoIndexId=true] -- Create an index on the _id field of the document, True by default on MongoDB 2.2 or higher off for version < 2.2.
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {Collection} -- returns newly created collection
 */
DB.prototype.createCollection = function(name, options, cb) {
  var self = this
  return syncOrAsync(this._nativeDB, 'createCollection', [name, options], function(collection) {
    return new Collection(self, collection)
  }, cb)
},

/***************************************************************************************************
 * @method getCollection
 * @description Fetch a specific collection (containing the actual collection information).
 * @param {string} name -- the collection name we wish to access.
 * @param {object} [options=null] -- Optional settings.
 * @param {number|string} [options.w=null] -- The write concern.
 * @param {number} [options.wtimeout=null] -- The write concern timeout.
 * @param {boolean} [options.j=false] -- Specify a journal write concern.
 * @param {boolean} [options.raw=false] -- Return document results as raw BSON buffers.
 * @param {object} [options.pkFactory=null] -- A primary key factory object for generation of custom _id keys.
 * @param {ReadPreference|string} [options.readPreference=null] -- The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
 * @param {boolean} [options.serializeFunctions=false] -- Serialize functions on any object.
 * @param {boolean} [options.strict=false] -- Returns an error if the collection does not exist
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {Collection} -- return the new Collection instance if not in strict mode
 */
DB.prototype.getCollection = function(name, options, cb) {
  return syncOrAsync(this._nativeDB, 'collection', [name, options], function(collection) {
    return new Collection(this, collection)
  }, cb)
}

/***************************************************************************************************
 * @method authenticate
 * @description Authenticate a user against the server.
 * @param {string} username -- The username.
 * @param {string} [password] -- The password.
 * @param {object} [options=null] -- Optional settings.
 * @param {string} [options.authMechanism=MONGODB-CR] -- The authentication mechanism to use, GSSAPI, MONGODB-CR, MONGODB-X509, PLAIN
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {boolean} -- returns true if authed, false otherwise
 */
DB.prototype.authenticate = function(username, password, options, cb) {
  return syncOrAsync(this._nativeDB, 'authenticate', [username, password, options], undefined, cb)
}

/***************************************************************************************************
 * @method command
 * @description Execute a command
 * @param {object} command -- The command hash
 * @param {object} [options=null] -- Optional settings.
 * @param {ReadPreference|string} [options.readPreference=null] -- The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
 * @param {number} [options.maxTimeMS=null] -- Number of milliseconds to wait before aborting the query.
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {object} -- returns result of the command
 */
DB.prototype.command = function(command, options, cb) {
  return syncOrAsync(this._nativeDB, 'command', [command, options], undefined, cb)
}

/***************************************************************************************************
 * @method db
 * @description Create a new Db instance sharing the current socket connections. Be aware that the new db instances are
 *              related in a parent-child relationship to the original instance so that events are correctly emitted on child
 *              db instances. Child db instances are cached so performing db('db1') twice will return the same instance.
 *              You can control these behaviors with the options noListener and returnNonCachedInstance.
 * @param {string} name -- The name of the database we want to use.
 * @param {object} [options=null] -- Optional settings.
 * @param {boolean} [options.noListener=false] -- Do not make the db an event listener to the original connection.
 * @param {boolean} [options.returnNonCachedInstance=false] -- Control if you want to return a cached instance or have a new one created
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {DB}
 */
DB.prototype.db = function(name, options, cb) {
  var err = undefined
  try {
    var db = new DB(this._nativeDB.db(name, options))
  } catch (e) {
    if (!cb) {
      throw e
    }
    err = e
  }
  if (cb) {
    return cb(err, db)
  }
  return db
  
}

/***************************************************************************************************
 * @method stats
 * @description Get all the db statistics.
 * @param {object} [options=null] -- Optional settings.
 * @param {number} [options.scale=null] -- Divide the returned sizes by scale value.
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {object} -- see: http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#~resultCallback
 */
DB.prototype.stats = function(options, cb) {
  return syncOrAsync(this._nativeDB, 'stats', [options], undefined, cb)
}

/***************************************************************************************************
 * @method close
 * @description Close the db and it's underlying connections
 * @param {boolean} force -- Force close, emitting no events
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {undefined} -- no return value
 */
DB.prototype.close = function(force, cb) {
  return syncOrAsync(this._nativeDB, 'close', [force], undefined, cb)
}

// XXX: for backward compatibility
DB.DB = DB

module.exports = DB

