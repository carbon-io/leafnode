var _ = require('lodash')

var oo = require('@carbon-io/atom').oo(module)
var testtube = require('@carbon-io/test-tube')

var connect = require('../lib/leafnode').connect

var LeafnodeTestSuite = oo({
  _type: testtube.Test,
  _C: function() {
    this.dbUri = 'mongodb://localhost:27017'

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
