var assert = require('assert');

var _ = require('lodash')

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)

var Collection = require('../lib/collection')

var util = require('./util')

__(function() {
  module.exports = o.main({
    _type: util.LeafnodeTestSuite,
    name: 'dbTests',
    description: 'db tests',
    colName: 'leafnode.db-test',
    tests: [
      o({
        _type: util.LeafnodeTest,
        name: 'createCollectionTest',
        description: 'createCollection test',
        doTest: function() {
          var self = this
          var col = undefined
          try {
            assert.doesNotThrow(function() {
              col = self.db.createCollection('leafnode.createCollectionTest', {safe: true})
            }, Error)
            assert(!_.isUndefined(col))
          } finally {
            if (!_.isUndefined(col)) {
              col.drop()
              col = undefined
            }
          }
          try {
            assert.doesNotThrow(function() {
              col = self.db.createCollection('leafnode.createCollectionTest')
            }, Error)
            assert(!_.isUndefined(col))
          } finally {
            if (!_.isUndefined(col)) {
              col.drop()
              col = undefined
            }
          }
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'getCollectionsTest',
        description: 'getCollections test',
        collections: [
          'leafnode.foo',
          'leafnode.bar',
          'leafnode.baz'
        ],
        setup: function() {
          var self = this
          util.LeafnodeTest.prototype.setup.call(this)
          this.collections.forEach(function(collectionName) {
            self.db.createCollection(collectionName)
          })
        },
        teardown: function() {
          var self = this
          this.collections.forEach(function(collectionName) {
            var collection = self.db.getCollection(collectionName)
            collection.drop()
          })
          util.LeafnodeTest.prototype.teardown.call(this)
        },
        doTest: function() {
          this.db.getCollections().forEach(function(collection) {
            assert(collection instanceof Collection)
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'getCollectionNamesTest',
        description: 'getCollectionNames test',
        collections: [
          'leafnode.bar',
          'leafnode.baz',
          'leafnode.foo'
        ],
        setup: function() {
          var self = this
          util.LeafnodeTest.prototype.setup.call(this)

          this.collections.forEach(function(collectionName) {
            self.db.createCollection(collectionName)
          })
        },
        teardown: function() {
          var self = this
          this.collections.forEach(function(collectionName) {
            try {
              var collection = self.db.getCollection(collectionName)
              collection.drop()
            } catch (e) {
              // ignore
            }
          })
          util.LeafnodeTest.prototype.teardown.call(this)
        },
        doTest: function() {
          var collectionNames = this.db.getCollectionNames()
          var collection = undefined
          systemIndexesIndex = collectionNames.indexOf('system.indexes')
          if (systemIndexesIndex != -1) {
            collectionNames.splice(systemIndexesIndex, 1)
          }
          collectionNames.sort()
          assert.equal(collectionNames.length, this.collections.length)
          for (var i = 0; i < collectionNames.length; i++ ) {
            assert.equal(collectionNames[i], this.collections[i])
          }
          collection = this.db.getCollection(this.collections[this.collections.length - 1])
          collection.drop()
          collectionNames = this.db.getCollectionNames()
          systemIndexesIndex = collectionNames.indexOf('system.indexes')
          if (systemIndexesIndex != -1) {
            collectionNames.splice(systemIndexesIndex, 1)
          }
          collectionNames.sort()
          assert.equal(collectionNames.length, this.collections.length - 1)
          for (var i = 0; i < collectionNames.length - 1; i++ ) {
            assert.equal(collectionNames[i], this.collections[i])
          }
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'statsTest',
        description: 'stats test',
        doTest: function() {
          var props = [ 
            'db',
            'collections',
            'objects',
            'avgObjSize',
            'dataSize',
            'storageSize',
            'numExtents',
            'indexes',
            'indexSize',
            'ok'
          ]
          var stats = this.db.stats()
          props.forEach(function(prop) {
            assert(prop in stats)
          })
        }
      })
    ]
  })
})
