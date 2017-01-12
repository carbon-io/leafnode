/****************************************************************************************************
 *
 *  Copyright (C) 2012 ObjectLabs Corporation
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

var assert = require('assert')
var sinon = require('sinon')

var _ = require('lodash')
var mongodbURI = require('mongodb-uri')
var sinon = require('sinon')

var o = require('@carbon-io/atom').o(module).main
var testtube = require('@carbon-io/test-tube')

var Collection = require('../lib/collection')
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
            var doc = this.c.saveObject({foo: 'foo'})
            var numUpdated = this.c.updateObject(doc, {'$set': {foo: 'bar'}})
            assert.equal(numUpdated, 1)
            assert('_id' in doc)
            doc = this.c.findOne({_id: doc._id})
            assert.equal(doc.foo, 'bar')
            doc._id += 1
            numUpdated = this.c.updateObject(doc, {'$set': {foo: 'bar'}})
            assert.equal(numUpdated, 0)
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'updateObjectNoIdTest',
          description: 'verify updateObject throws when no id present test',
          doTest: function() {
            var self = this
            assert.throws(function() {
              self.c.updateObject({foo: 'bar'}, {'$set': {foo: 'baz'}})
            }, /_id is required/)
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
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            assert(_.every(docs, function(doc) { return '_id' in doc }))
            var numUpdated = this.c.updateObjects(docs, {'$set': {updated: true}})
            assert.equal(numUpdated, docs.length)
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
            delete docs[1]._id
            assert.throws(function() {
              self.c.updateObjects(docs, {'$set': {updated: true}})
            }, /_id is required/)
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
            var doc = this.c.saveObject({foo: 'foo'})
            assert('_id' in doc)
            var numDeleted = this.c.deleteObject(doc)
            assert.equal(numDeleted, 1)
            doc = this.c.saveObject({foo: 'foo'})
            doc._id += 1
            numDeleted = this.c.deleteObject(doc)
            assert.equal(numDeleted, 0)
          }
        }),
        o({
          _type: util.LeafnodeTest,
          name: 'deleteObjectNoIdTest',
          description: 'verify deleteObject throws when no id present test',
          doTest: function() {
            var self = this
            assert.throws(function() {
              self.c.deleteObject({foo: 'bar'})
            }, /_id is required/)
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
            var docCount = this.c.count()
            var docs = this.c.insertObjects([
              {foo: 'foo'},
              {bar: 'bar'},
              {baz: 'baz'}
            ])
            assert.equal(this.c.count(), docCount + docs.length)
            docsToDelete = docs.slice(0, 2)
            var numDeleted = this.c.deleteObjects(docsToDelete)
            assert.equal(numDeleted, 2)
            assert.equal(this.c.count(), docCount + docs.length - 2)
            assert(_.isNull(this.c.findOne({_id: docsToDelete[0]._id})))
            assert(_.isNull(this.c.findOne({_id: docsToDelete[1]._id})))
            assert.deepEqual(this.c.findOne({_id: docs[2]._id}), docs[2])
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
            delete docs[1]._id
            assert.throws(function() {
              self.c.deleteObjects(docs)
            }, /_id is required/)
          }
        })
      ]
    })
  ]
})

module.exports = collectionTests
