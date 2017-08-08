var syncOrAsync = require('./util').syncOrAsync

/***************************************************************************************************
 * @class Cursor
 * @memberof leafnode
 */
function Cursor(cursor) {
  /*****************************************************************************
   * @property {xxx} cursor -- xxx
   */
  this._cursor = cursor
}

/***************************************************************************************************
 * @method count
 * @description Get the count of documents for this cursor
 * @param {boolean} applySkipLimit -- Should the count command apply limit and skip settings on the cursor or use the passed in options.
 * @param {object} [options=null] -- Optional settings.
 * @param {number} [options.skip=null] -- The number of documents to skip.
 * @param {number} [options.limit=null] -- The maximum amounts to count before aborting.
 * @param {number} [options.maxTimeMS=null] -- Number of miliseconds to wait before aborting the query.
 * @param {string} [options.hint=null] -- An index name hint for the query.
 * @param {(ReadPreference|string)} [options.readPreference=null] -- The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {number} -- returns the count
 */
Cursor.prototype.count = function(applySkipLimit, options, cb) {
  return syncOrAsync(this._cursor, 'count', [applySkipLimit, options], undefined, cb)
}

/***************************************************************************************************
 * @method next
 * @description Get the next available document from the cursor, returns null if no more documents are available.
 * @throws {Error}
 * @deprecated
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @return {object} -- returns the next document or null
 */
Cursor.prototype.next = function(cb) {
  return syncOrAsync(this._cursor, 'next', [], undefined, cb)
}

/***************************************************************************************************
 * @method sort
 * @description Sets the sort order of the cursor query.
 * @param {string|array|object} keyOrList -- The key or a keys set used by the sort.
 * @param {number} direction -- The direction of the sorting (1 or -1).
 * @throws {Error}
 * @return {Cursor} -- xxx
 */
Cursor.prototype.sort = function(keyOrList, direction) {
  return new Cursor(this._cursor.sort(keyOrList, direction))
}

/***************************************************************************************************
 * @method limit
 * @description Set the limit for the cursor.
 * @param {number} value -- The limit for the cursor query.
 * @throws {MongoError}
 * @return {Cursor}
 */
Cursor.prototype.limit = function(value) {
  return new Cursor(this._cursor.limit(value))
}

/***************************************************************************************************
 * @method project
 * @description Set the projection for the cursor.
 * @param {object} value -- field projection object.
 * @throws {MongoError}
 * @returns {Cursor}
 */
Cursor.prototype.project = function(value) {
  return new Cursor(this._cursor.project(value))
}

/***************************************************************************************************
 * @method toArray
 * @description Returns an array of documents. The caller is responsible for making sure that there 
 *              is enough memory to store the results. Note that the array only contain partial
 *              results when this cursor had been previouly accessed. In that case,
 *              cursor.rewind() can be used to reset the cursor.
 * @param {function} [cb=undefined] -- execute asynchronously if present (signature: cb(err, result))
 * @throws {Error}
 * @return {array} -- returns array of docs
 */
Cursor.prototype.toArray = function(cb) {
  return syncOrAsync(this._cursor, 'toArray', [], undefined, cb)
}

/***************************************************************************************************
 * @method setOption
 * @description Set a node.js specific cursor option
 * @param {string} field -- The cursor option to set ['numberOfRetries', 'tailableRetryInterval'].
 * @param {object} value -- The field value.
 * @throws {MongoError}
 * @return {Cursor}
 */
Cursor.prototype.setOption = function(field, value) {
  return new Cursor(this._cursor.setCursorOption(field, value))
}

/***************************************************************************************************
 * @method skip
 * @description Set the skip for the cursor.
 * @param {number} value -- The skip for the cursor query.
 * @throws {Error}
 * @return {Cursor}
 */
Cursor.prototype.skip = function(value) {
  return new Cursor(this._cursor.skip(value))
}


/****************************************************************************************************
 * exports
 */
if (typeof exports != "undefined") {
    exports.Cursor = Cursor
}
