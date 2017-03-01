var assert = require('assert')
var sinon = require('sinon')

var _ = require('lodash')
var mongodbURI = require('mongodb-uri')
var sinon = require('sinon')

var o = require('@carbon-io/atom').o(module).main
var testtube = require('@carbon-io/test-tube')

var Collection = require('../lib/collection')
var errors = require('../lib/errors')
var leafnode = require('../lib/leafnode')

var util = require('./util')


var pkFactory = {
  counter: 0,
  createPk: function() {
    return this.counter++
  }
}

var collectionTests = o({
  _type: util.LeafnodeTestSuite,
  name: 'collectionTests',
  description: 'collection tests',
  colName: 'leafnode',
  conOptions: {
    db: {
      pkFactory: pkFactory
    }
  },
  tests: [
    o({
      _type: util.LeafnodeTest,
      name: 'insertObjectTests',
      description: 'insertObject tests',
      setup: function() {
        util.LeafnodeTest.prototype.setup.apply(this, arguments)
        this.makeObj = this.parent.makeObj
      },
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'insertObjectSimpleTest',
          description: 'simple insertObject test',
          doTest: function() {
            var expectedId = pkFactory.counter
            var doc = this.c.insertObject(this.parent.makeObj())
            assert.equal(doc._id, expectedId)
            delete doc._id
            assert.deepEqual(doc, this.parent.makeObj())
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'insertObjectsTests',
      description: 'insertObjects tests',
      setup: function() {
        util.LeafnodeTest.prototype.setup.apply(this, arguments)
        this.makeObj = this.parent.makeObj
      },
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'insertObjectsSimpleTest',
          description: 'simple insertObjects test',
          doTest: function() {
            var self = this
            var expectedIds = [
              pkFactory.counter,
              pkFactory.counter + 1,
              pkFactory.counter + 2
            ]
            var docs = _.range(3).map(function() { return self.parent.makeObj() })
            docs = this.c.insertObjects(docs)
            for (var i = expectedIds[0]; i < expectedIds[0] + expectedIds.length; i++) {
              doc = docs.shift()
              assert.equal(doc._id, i)
              delete doc._id
              assert.deepEqual(doc, this.parent.makeObj())
            }
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'insertObjectsAllDocsNotInsertedTest',
          description: 'verify error thrown when insertObjects fails to insert all docs test',
          setup: function() {
            util.LeafnodeTest.prototype.setup.apply(this, arguments)
            this.sandbox = sinon.sandbox.create()
            this.sandbox.stub(this.c, 'insertMany', function(docs) {
              docs = _.cloneDeep(docs)
              docs.splice(docs.length - 1, 1)
              return {
                insertedCount: 2,
                ops: docs
              }
            })
          },
          teardown: function() {
            this.sandbox.restore()
            util.LeafnodeTest.prototype.teardown.apply(this, arguments)
          },
          doTest: function() {
            var self = this
            var docs = [{foo: 'foo'}, {bar: 'bar'}, {baz: 'baz'}]
            assert.throws(function() {
              self.c.insertObjects(docs)
            }, function(err) {
              assert.equal(err.docs.length, docs.length - 1)
              for (var i = 0; i < err.docs.length; i++) {
                assert.deepEqual(err.docs[i], docs[i])
              }
              return true
            })
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'saveObjectTests',
      description: 'saveObject tests',
      setup: function() {
        util.LeafnodeTest.prototype.setup.apply(this, arguments)
        this.makeObj = this.parent.makeObj
      },
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'saveObjectSimpleTest',
          description: 'simple saveObject test',
          doTest: function() {
            var expectedId = pkFactory.counter
            var doc = this.c.saveObject(this.parent.makeObj())
            assert.equal(doc._id, expectedId)
            delete doc._id
            assert.deepEqual(doc, this.parent.makeObj())
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'updateObjectTests',
      description: 'updateObject tests',
      setup: function() {
        util.LeafnodeTest.prototype.setup.apply(this, arguments)
        this.makeObj = this.parent.makeObj
      },
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'updateObjectSimpleTest',
          description: 'simple updateObject test',
          doTest: function() {
            var self = this
            var doc = this.c.saveObject({foo: 'foo'})
            assert.doesNotThrow(function() {
              self.c.updateObject(doc._id, {'$set': {foo: 'bar'}})
            }, errors.LeafnodeDocsAffectedError)
            assert('_id' in doc)
            doc = this.c.findOne({_id: doc._id})
            assert.equal(doc.foo, 'bar')
            doc._id += 1
            assert.throws(function() {
              self.c.updateObject(doc._id, {'$set': {foo: 'bar'}})
            }, function(err) {
              assert(err instanceof errors.LeafnodeObjectSetOperationError)
              assert.equal(err.modifiedCount, 0)
              assert.equal(err.objectCount, 1)
              return true
            })
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'updateObjectNoIdTest',
          description: 'verify updateObject throws when no id present test',
          doTest: function() {
            var self = this
            assert.throws(function() {
              self.c.updateObject(undefined, {'$set': {foo: 'baz'}})
            }, /_id required/)
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'updateObjectsTests',
      description: 'updateObjects tests',
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'updateObjectsSimpleTest',
          description: 'simple updateObject test',
          doTest: function() {
            var self = this
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            assert(_.every(docs, function(doc) { return '_id' in doc }))
            assert.doesNotThrow(function() {
              self.c.updateObjects(_.map(docs, '_id'), {'$set': {updated: true}})
            }, errors.LeafnodeObjectSetOperationError)
            var updatedDocs = this.c.find({_id: {'$in': _.map(docs, '_id')}}).toArray()
            assert.equal(updatedDocs.length, docs.length)
            for (var i = 0; i < updatedDocs.length; i++) {
              var index = _.findIndex(updatedDocs, function(doc) { return docs[i]._id == doc._id })
              assert(updatedDocs[index].updated)
              delete updatedDocs[index].updated
              assert.deepEqual(updatedDocs[index], docs[i])
            }
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'updateObjectsNoIdTest',
          description: 'verify updateObject throws when no id present test',
          doTest: function() {
            var self = this
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            docs = _.map(docs, '_id')
            docs[1] = undefined
            assert.throws(function() {
              self.c.updateObjects(docs, {'$set': {updated: true}})
            }, /_ids required/)
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'deleteObjectTests',
      description: 'deleteObject tests',
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'deleteObjectSimpleTest',
          description: 'simple deleteObject test',
          doTest: function() {
            var self = this
            var doc = this.c.saveObject({foo: 'foo'})
            assert('_id' in doc)
            assert.doesNotThrow(function() {
              self.c.deleteObject(doc._id)
            }, errors.LeafnodeObjectSetOperationError)
            doc = this.c.saveObject({foo: 'foo'})
            doc._id += 1
            assert.throws(function() {
              self.c.deleteObject(doc._id)
            }, function(err) {
              assert(err instanceof errors.LeafnodeObjectSetOperationError)
              assert.equal(err.modifiedCount, 0)
              assert.equal(err.objectCount, 1)
              return true
            })
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'deleteObjectNoIdTest',
          description: 'verify deleteObject throws when no id present test',
          doTest: function() {
            var self = this
            assert.throws(function() {
              self.c.deleteObject(undefined)
            }, /_id required/)
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'deleteObjectsTests',
      description: 'deleteObjects tests',
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'deleteObjectsSimpleTest',
          description: 'simple deleteObject test',
          doTest: function() {
            var self = this
            var docCount = this.c.count()
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            assert.equal(this.c.count(), docCount + docs.length)
            docsToDelete = docs.slice(0, 2)
            assert.doesNotThrow(function() {
              self.c.deleteObjects(_.map(docsToDelete, '_id'))
            }, errors.LeafnodeObjectSetOperationError)
            assert.equal(this.c.count(), docCount + docs.length - 2)
            assert(_.isNull(this.c.findOne({_id: docsToDelete[0]._id})))
            assert(_.isNull(this.c.findOne({_id: docsToDelete[1]._id})))
            assert.deepEqual(this.c.findOne({_id: docs[2]._id}), docs[2])
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'deleteObjectsNoIdTest',
          description: 'verify deleteObject throws when no id present test',
          doTest: function() {
            var self = this
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            var _ids = _.map(docs, '_id')
            _ids[1] = undefined
            assert.throws(function() {
              self.c.deleteObjects(_ids)
            }, /_ids required/)
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'removeObjectTests',
      description: 'removeObject tests',
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'removeObjectSimpleTest',
          description: 'simple removeObject test',
          doTest: function() {
            var self = this
            var doc = this.c.saveObject({foo: 'foo'})
            assert('_id' in doc)
            assert.doesNotThrow(function() {
              self.c.removeObject(doc._id)
            }, errors.LeafnodeObjectSetOperationError)
            doc = this.c.saveObject({foo: 'foo'})
            doc._id += 1
            assert.throws(function() {
              self.c.removeObject(doc._id)
            }, function(err) {
              assert(err instanceof errors.LeafnodeObjectSetOperationError)
              assert.equal(err.modifiedCount, 0)
              return true
            })
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'removeObjectNoIdTest',
          description: 'verify removeObject throws when no id present test',
          doTest: function() {
            var self = this
            assert.throws(function() {
              self.c.removeObject(undefined)
            }, /_id required/)
          }
        })
      ]
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'removeObjectsTests',
      description: 'removeObjects tests',
      tests: [
        o({
          _type: util.LeafnodeTest,
          name: 'removeObjectsSimpleTest',
          description: 'simple removeObject test',
          doTest: function() {
            var self = this
            var docCount = this.c.count()
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            assert.equal(this.c.count(), docCount + docs.length)
            docsToDelete = docs.slice(0, 2)
            assert.doesNotThrow(function() {
              self.c.removeObjects(_.map(docsToDelete, '_id'))
            }, errors.LeafnodeObjectSetOperationError)
            assert.equal(this.c.count(), docCount + docs.length - 2)
            assert(_.isNull(this.c.findOne({_id: docsToDelete[0]._id})))
            assert(_.isNull(this.c.findOne({_id: docsToDelete[1]._id})))
            assert.deepEqual(this.c.findOne({_id: docs[2]._id}), docs[2])
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'removeObjectsNoIdTest',
          description: 'verify removeObject throws when no id present test',
          doTest: function() {
            var self = this
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            var _ids = _.map(docs, '_id')
            _ids[1] = undefined
            assert.throws(function() {
              self.c.removeObjects(_ids)
            }, /_ids required/)
          }
        })
      ]
    })
  ]
})

module.exports = collectionTests
