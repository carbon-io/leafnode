var _ = require('lodash')

var _o = require('@carbon-io/bond')._o(module)
var oo = require('@carbon-io/atom').oo(module)
var testtube = require('@carbon-io/test-tube')

var connect = require('../lib/leafnode').connect

var LeafnodeTestSuite = oo({
  _type: testtube.Test,
  _C: function() {
    this.dbUri = _o('env:LEAFNODE_MONGODB_URI') || 'mongodb://localhost:27017'

    this.colName = undefined
    this.db = undefined
    this.c = undefined
  },
  setup: function() {
    if (_.isUndefined(this.colName)) {
      throw new Error('"colName" undefined')
    }
    this.db = connect(this.dbUri)
    this.c = this.db.getCollection(this.colName)
  },
  teardown: function() {
    try {
      this.c.drop()
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
    this.db = this.parent.db
    this.c = this.parent.c
    try {
      this.c.drop()
    } catch (e) {
      // ignore
    }
  },
  teardown: function() {
  }
})

module.exports = {
  LeafnodeTestSuite: LeafnodeTestSuite,
  LeafnodeTest: LeafnodeTest
}
