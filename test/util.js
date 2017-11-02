var _ = require('lodash')
var mongodbUri = require('mongodb-uri')

var _o = require('@carbon-io/bond')._o(module)
var oo = require('@carbon-io/atom').oo(module)
var testtube = require('@carbon-io/test-tube')

var connect = require('../lib/leafnode').connect

// if we have a specific address in the environment for a stand alone instance, then use that,
// otherwise default to localhost:27017
STAND_ALONE_DB_URI = _o('env:LEAFNODE_STAND_ALONE_MONGODB_URI') || 'mongodb://localhost:27017'
// if we have a replica set address in the environment, then initialize REPL_SET_DB_URI to that
// NOTE: it is suggested that both be present, otherwise some connection tests will be skipped
REPL_SET_DB_URI = _o('env:LEAFNODE_REPL_SET_MONGODB_URI') || undefined
// if REPL_SET_DB_URI is present, use that for all tests, otherwise, use the stand alone instance
DB_URI = REPL_SET_DB_URI || STAND_ALONE_DB_URI
DB_NAME = mongodbUri.parse(DB_URI).database || 'leafnode'

var LeafnodeTestSuite = oo({
  _type: testtube.Test,
  _C: function() {
    this.dbUri = DB_URI
    this.dbIsReplSet = !_.isNil(REPL_SET_DB_URI)

    this.conOptions = undefined
    this.colName = undefined
    this.con = undefined
    this.db = undefined
    this.c = undefined
  },
  setup: function() {
    this.con = connect(this.dbUri, this.conOptions)
    this.db = this.con.db(DB_NAME)
    if (!_.isUndefined(this.colName)) {
      this.c = this.db.getCollection(this.colName)
    }
  },
  teardown: function() {
    try {
      if (!_.isUndefined(this.c)) {
        this.c.drop()
      }
    } catch (e) {
      // ignore
    }
    this.db.close()
  },
  makeObj: function(i) {
    return { 
      i : i,
      iField : 22,
      ddField : 22.2,
      bField : true,
      b2Field : false,
      nField : null,
      dField : new Date(123000000),
      aField : [1, null, true, [1, 2, 3], { a: 1, b: null, c: [] }],
      oField : { a: 1, b: false, c: [{}, 0], d: { ee : 1, ff : 2 }}
    }
  }
})

var LeafnodeTest = oo({
  _type: testtube.Test,
  setup: function() {
    this.con = this.parent.con
    this.db = this.parent.db
    this.c = this.parent.c
    try {
      if (!_.isUndefined(this.c)) {
        this.c.drop()
      }
    } catch (e) {
      // ignore
    }
  },
  teardown: function() {
  }
})

module.exports = {
  LeafnodeTestSuite: LeafnodeTestSuite,
  LeafnodeTest: LeafnodeTest,
  DB_URI: DB_URI,
  DB_NAME: DB_NAME,
  STAND_ALONE_DB_URI: STAND_ALONE_DB_URI,
  REPL_SET_DB_URI: REPL_SET_DB_URI
}
