var assert = require('assert');

var _ = require('lodash')

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)

var Collection = require('../lib/collection')

var util = require('./util')

__(function() {
  module.exports = o.main({
    _type: util.LeafnodeTestSuite,
    name: 'DbTests',
    description: 'db tests',
    colName: 'leafnode.db-test',
    tests: [
      o({
        _type: util.LeafnodeTest,
        name: 'CreateCollectionTest',
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
        name: 'CreateCollectionAsyncTest',
        description: 'createCollection async test',
        doTest: function(ctx, done) {
          var self = this
          col = self.db.createCollection('leafnode.createCollectionTest', {safe: true}, function(err, col) {
            if (err) {
              return done(err)
            }
            try {
              assert(!_.isUndefined(col))
            } catch (err) {
              return done(err)
            }
            col.drop({}, function(err) {
              if (err) {
                return done(err)
              }
              self.db.createCollection('leafnode.createCollectionTest', {}, function(err, col) {
                if (err) {
                  return done(err)
                }
                try {
                  assert(!_.isUndefined(col))
                } catch (err) {
                  return done(err)
                }
                col.drop({}, done)
              })
            })
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'GetCollectionsTest',
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
        name: 'GetCollectionsAsyncTest',
        description: 'getCollections async test',
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
        doTest: function(ctx, done) {
          debugger
          this.db.getCollections(function(err, collections) {
            if (err) {
              return done(err)
            }
            var errors = []
            try {
              assert(collections.length > 0)
              for (var i = 0; i < collections.length; i++) {
                assert(collections[i] instanceof Collection)
              }
            } catch (e) {
              err = e
            }
            return done(err)
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'GetCollectionNamesTest',
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
          var systemIndexesIndex = collectionNames.indexOf('system.indexes')
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
        name: 'GetCollectionNamesAsyncTest',
        description: 'getCollectionNames async test',
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
        doTest: function(ctx, done) {
          var self = this
          this.db.getCollectionNames(function(err, collectionNames) {
            if (err) {
              return done(err)
            }
            var systemIndexesIndex = collectionNames.indexOf('system.indexes')
            if (systemIndexesIndex != -1) {
              collectionNames.splice(systemIndexesIndex, 1)
            }
            collectionNames.sort()
            try {
              assert.equal(collectionNames.length, self.collections.length)
              for (var i = 0; i < collectionNames.length; i++ ) {
                assert.equal(collectionNames[i], self.collections[i])
              }
            } catch (err) {
              return done(err)
            }
            self.db.getCollection(
              self.collections[self.collections.length - 1], 
              {}, function(err, collection) {
                if (err) {
                  return done(err)
                }
                collection.drop({}, function(err) {
                  if (err) {
                    return done(err)
                  }
                  self.db.getCollectionNames(function(err, collectionNames) {
                    if (err) {
                      return done(err)
                    }
                    systemIndexesIndex = collectionNames.indexOf('system.indexes')
                    if (systemIndexesIndex != -1) {
                      collectionNames.splice(systemIndexesIndex, 1)
                    }
                    collectionNames.sort()
                    try {
                      assert.equal(collectionNames.length, self.collections.length - 1)
                      for (var i = 0; i < collectionNames.length - 1; i++ ) {
                        assert.equal(collectionNames[i], self.collections[i])
                      }
                    } catch (e) {
                      err = e
                    }
                    return done(err)
                  })
                })
              })
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'StatsTest',
        description: 'Stats test',
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
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'StatsAsyncTest',
        description: 'Stats async test',
        doTest: function(ctx, done) {
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
          this.db.stats({}, function(err, stats) {
            if (err) {
              return done(err)
            }
            try {
              props.forEach(function(prop) {
                assert(prop in stats)
              })
            } catch (e) {
              err = e
            }
            return done(err)
          })
        }
      })
    ]
  })
})
