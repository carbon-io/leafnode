var assert = require('assert')
var sinon = require('sinon')

var _ = require('lodash')
var async = require('async')
var mongodbURI = require('mongodb-uri')
var sinon = require('sinon')

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)
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

__(function() {
  module.exports = o.main({
    _type: util.LeafnodeTestSuite,
    name: 'CollectionTests',
    description: 'collection tests',
    colName: 'leafnode',
    conOptions: {
      db: {
        pkFactory: pkFactory
      }
    },
    tests: [

      // -- object api tests

      o({
        _type: util.LeafnodeTest,
        name: 'InsertObjectTests',
        description: 'insertObject tests',
        setup: function() {
          util.LeafnodeTest.prototype.setup.apply(this, arguments)
          this.makeObj = this.parent.makeObj
        },
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'InsertObjectSimpleTest',
            description: 'simple insertObject test',
            doTest: function() {
              var expectedId = pkFactory.counter
              var doc = this.c.insertObject(this.parent.makeObj())
              assert.equal(doc._id, expectedId)
              delete doc._id
              assert.deepEqual(doc, this.parent.makeObj())
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'InsertObjectSimpleAsyncTest',
            description: 'Simple insertObject async test',
            doTest: function(ctx, done) {
              var self = this
              var expectedId = pkFactory.counter
              this.c.insertObject(this.parent.makeObj(), {}, function(err, doc) {
                if (err) {
                  return done(err)
                }
                try {
                  assert.equal(doc._id, expectedId)
                  delete doc._id
                  assert.deepEqual(doc, self.parent.makeObj())
                } catch (e) {
                  err = e
                }
                return done(err)
              })
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'InsertObjectsTests',
        description: 'insertObjects tests',
        setup: function() {
          util.LeafnodeTest.prototype.setup.apply(this, arguments)
          this.makeObj = this.parent.makeObj
        },
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'InsertObjectsSimpleTest',
            description: 'Simple insertObjects test',
            doTest: function() {
              var self = this
              var doc = undefined
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
            name: 'InsertObjectsSimpleAsyncTest',
            description: 'Simple insertObjects test',
            doTest: function(ctx, done) {
              var self = this
              var expectedIds = [
                pkFactory.counter,
                pkFactory.counter + 1,
                pkFactory.counter + 2
              ]
              var docs = _.range(3).map(function() { return self.parent.makeObj() })
              this.c.insertObjects(docs, {}, function(err, docs) {
                var doc = undefined
                if (err) {
                  return done(err)
                }
                try {
                  for (var i = expectedIds[0]; i < expectedIds[0] + expectedIds.length; i++) {
                    doc = docs.shift()
                    assert.equal(doc._id, i)
                    delete doc._id
                    assert.deepEqual(doc, self.parent.makeObj())
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
            name: 'InsertObjectsAllDocsNotInsertedTest',
            description: 'Verify error thrown when insertObjects fails to insert all docs test',
            setup: function() {
              util.LeafnodeTest.prototype.setup.apply(this, arguments)
              this.sandbox = sinon.sandbox.create()
              this.sandbox.stub(this.c, 'insertMany', function(docs, options, cb) {
                docs = _.cloneDeep(docs)
                docs.splice(docs.length - 1, 1)
                var ret = {
                  insertedCount: 2,
                  ops: docs
                }
                if (cb) {
                  return cb(undefined, ret)
                }
                return ret
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
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'InsertObjectsAllDocsNotInsertedAsyncTest',
            description: 'Verify error thrown when insertObjects fails to insert all docs test',
            setup: function() {
              util.LeafnodeTest.prototype.setup.apply(this, arguments)
              this.sandbox = sinon.sandbox.create()
              this.sandbox.stub(this.c, 'insertMany', function(docs, options, cb) {
                docs = _.cloneDeep(docs)
                docs.splice(docs.length - 1, 1)
                var ret = {
                  insertedCount: 2,
                  ops: docs
                }
                if (cb) {
                  return cb(undefined, ret)
                }
                return ret
              })
            },
            teardown: function() {
              this.sandbox.restore()
              util.LeafnodeTest.prototype.teardown.apply(this, arguments)
            },
            doTest: function(ctx, done) {
              var self = this
              var docs = [{foo: 'foo'}, {bar: 'bar'}, {baz: 'baz'}]
              self.c.insertObjects(docs, {}, function(err) {
                var e = undefined
                try {
                  assert.equal(err.docs.length, docs.length - 1)
                  for (var i = 0; i < err.docs.length; i++) {
                    assert.deepEqual(err.docs[i], docs[i])
                  }
                } catch (err) {
                  e = err
                }
                return done(e)
              })
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SaveObjectTests',
        description: 'saveObject tests',
        setup: function() {
          util.LeafnodeTest.prototype.setup.apply(this, arguments)
          this.makeObj = this.parent.makeObj
        },
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'SaveObjectSimpleWithNewIdTest',
            description: 'Simple saveObject with new id test',
            doTest: function() {
              var obj = this.parent.makeObj()
              obj._id = this.name
              var upserted = this.c.saveObject(obj)
              assert(upserted)
              upserted = this.c.saveObject(obj)
              assert(!upserted)
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'SaveObjectSimpleWithIdGenTest',
            description: 'Simple saveObject with id gen test',
            doTest: function() {
              var obj = this.parent.makeObj()
              assert.equal(this.c.find().count(), 0)
              var upserted = this.c.saveObject(obj)
              assert.equal(this.c.find().count(), 1)
              try {
                assert(upserted)
              } catch (e) {
                throw new testtube.errors.SkipTestError(
                  'XXX: upsert is not reported correctly by the underlying ' + 
                  'driver. Revisit later.')
              }
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'SaveObjectSimpleAsyncTest',
            description: 'Simple saveObject async test',
            doTest: function(ctx, done) {
              var self = this
              var obj = this.parent.makeObj()
              obj._id = this.name
              this.c.saveObject(obj, {}, function(err, upserted) {
                if (!err) {
                  try {
                    assert(upserted)
                  } catch (e) {
                    err = e
                  }
                }
                if (err) {
                  return done(err)
                }
                self.c.saveObject(obj, {}, function(err, upserted) {
                  if (!err) {
                    try {
                      assert(!upserted)
                    } catch (e) {
                      err = e
                    }
                  }
                  return done(err)
                })
              })
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'UpdateObjectTests',
        description: 'updateObject tests',
        setup: function() {
          util.LeafnodeTest.prototype.setup.apply(this, arguments)
          this.makeObj = this.parent.makeObj
        },
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateObjectSimpleTest',
            description: 'Simple updateObject test',
            doTest: function() {
              var self = this
              var doc = this.c.insertObject({foo: 'foo'})
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
            name: 'UpdateObjectSimpleAsyncTest',
            description: 'Simple updateObject async test',
            doTest: function(ctx, done) {
              var self = this
              var doc = this.c.insertObject({foo: 'foo'})
              self.c.updateObject(doc._id, {'$set': {foo: 'bar'}}, {}, function(err, result) {
                if (err) {
                  return done(err)
                }
                try {
                  assert('_id' in doc)
                } catch (e) {
                  return done(e)
                }
                self.c.findOne({_id: doc._id}, {}, function(err, doc) {
                  if (err) {
                    return done(err)
                  }
                  try {
                    assert.equal(doc.foo, 'bar')
                  } catch (e) {
                    done(err)
                  }
                  doc._id += 1
                  self.c.updateObject(doc._id, {'$set': {foo: 'bar'}}, {}, function(err, result) {
                    var e = undefined
                    try {
                      assert(err instanceof errors.LeafnodeObjectSetOperationError)
                      assert.equal(err.modifiedCount, 0)
                      assert.equal(err.objectCount, 1)
                    } catch (err) {
                      e = err
                    }
                    done(e)
                  })
                })
              })
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateObjectNoIdTest',
            description: 'Verify updateObject throws when no id present test',
            doTest: function() {
              var self = this
              assert.throws(function() {
                self.c.updateObject(undefined, {'$set': {foo: 'baz'}})
              }, /_id required/)
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateObjectNoIdAsyncTest',
            description: 'Verify updateObject throws when no id present async test',
            doTest: function(ctx, done) {
              this.c.updateObject(undefined, {'$set': {foo: 'baz'}}, {}, function(err, result) {
                var e = undefined
                try {
                  assert(err.toString().match(/_id required/))
                } catch (err) {
                  e = err
                }
                done(e)
              })
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'UpdateObjectsTests',
        description: 'updateObjects tests',
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateObjectsSimpleTest',
            description: 'Simple updateObject test',
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
                var index = 
                  _.findIndex(
                    updatedDocs, function(doc) { return docs[i]._id == doc._id })
                assert(updatedDocs[index].updated)
                delete updatedDocs[index].updated
                assert.deepEqual(updatedDocs[index], docs[i])
              }
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateObjectsSimpleAsyncTest',
            description: 'Simple updateObject async test',
            doTest: function(ctx, done) {
              var self = this
              this.c.insertObjects([
                {foo: 'foo'},
                {bar: 'bar'},
                {baz: 'baz'}
              ], {}, function(err, docs) {
                if (err) {
                  return done(err)
                }
                try {
                  assert(_.every(docs, function(doc) { return '_id' in doc }))
                } catch (e) {
                  return done(e)
                }
                self.c.updateObjects(
                  _.map(docs, '_id'), {'$set': {updated: true}}, {}, function(err, result) {
                    if (err) {
                      return done(err)
                    }
                    self.c.find({_id: {'$in': _.map(docs, '_id')}}, function(err, curs) {
                      if (err) {
                        return done(err)
                      }
                      curs.toArray(function(err, updatedDocs) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.equal(updatedDocs.length, docs.length)
                          for (var i = 0; i < updatedDocs.length; i++) {
                            var index = 
                              _.findIndex(
                                updatedDocs, function(doc) { return docs[i]._id == doc._id })
                            assert(updatedDocs[index].updated)
                            delete updatedDocs[index].updated
                            assert.deepEqual(updatedDocs[index], docs[i])
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
            name: 'UpdateObjectsNoIdTest',
            description: 'Verify updateObject throws when no id present test',
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
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateObjectsNoIdTest',
            description: 'Verify updateObject throws when no id present test',
            doTest: function(ctx, done) {
              var self = this
              this.c.insertObjects([
                {foo: 'foo'},
                {bar: 'bar'},
                {baz: 'baz'}
              ], {}, function(err, docs) {
                docs = _.map(docs, '_id')
                docs[1] = undefined
                self.c.updateObjects(docs, {'$set': {updated: true}}, {}, function(err, result) {
                  var e = undefined
                  try {
                    assert(err.toString().match(/_ids required/))
                  } catch (err) {
                    e = err
                  }
                  done(e)
                })
              })
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'DeleteObjectTests',
        description: 'deleteObject tests',
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'DeleteObjectSimpleTest',
            description: 'Simple deleteObject test',
            doTest: function() {
              var self = this
              var doc = this.c.insertObject({foo: 'foo'})
              assert('_id' in doc)
              assert.doesNotThrow(function() {
                self.c.deleteObject(doc._id)
              }, errors.LeafnodeObjectSetOperationError)
              doc = this.c.insertObject({foo: 'foo'})
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
            name: 'DeleteObjectSimpleAsyncTest',
            description: 'Simple deleteObject async test',
            doTest: function(ctx, done) {
              var self = this
              var doc = this.c.insertObject({foo: 'foo'}, {}, function(err, doc) {
                if (err) {
                  return done(err)
                }
                try {
                  assert('_id' in doc)
                } catch (e) {
                  return done(e)
                }
                self.c.deleteObject(doc._id, {}, function(err, result) {
                  self.c.insertObject({foo: 'foo'}, {}, function(err, doc) {
                    doc._id += 1
                    self.c.deleteObject(doc._id, {}, function(err, result) {
                      var e = undefined
                      try {
                        assert(err instanceof errors.LeafnodeObjectSetOperationError)
                        assert.equal(err.modifiedCount, 0)
                        assert.equal(err.objectCount, 1)
                      } catch (err) {
                        e = err
                      }
                      done(e)
                    })
                  })
                })
              })
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'DeleteObjectNoIdTest',
            description: 'Verify deleteObject throws when no id present test',
            doTest: function() {
              var self = this
              assert.throws(function() {
                self.c.deleteObject(undefined)
              }, /_id required/)
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'DeleteObjectNoIdAsyncTest',
            description: 'Verify deleteObject throws when no id present async test',
            doTest: function(ctx, done) {
              this.c.deleteObject(undefined, {}, function(err, result) {
                var e = undefined
                try {
                  assert(err.toString().match(/_id required/))
                } catch (err) {
                  e = err
                }
                done(e)
              })
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
            name: 'DeleteObjectsSimpleTest',
            description: 'Simple deleteObject test',
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
            name: 'DeleteObjectsSimpleAsyncTest',
            description: 'Simple deleteObject async test',
            doTest: function(ctx, done) {
              var self = this
              this.c.count({}, function(err, docCount) {
                self.c.insertObjects([
                  {foo: 'foo'},
                  {bar: 'bar'},
                  {baz: 'baz'}
                ], {}, function(err, docs) {
                  if (err) {
                    return done(err)
                  }
                  docsToDelete = docs.slice(0, 2)
                  async.series([
                    function(done) {
                      debugger
                      self.c.count({}, function(err, count) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.equal(count, docCount + docs.length)
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.deleteObjects(_.map(docsToDelete, '_id'), {}, function(err, result) {
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.count({}, function(err, count) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.equal(count, docCount + docs.length - 2)
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.findOne({_id: docsToDelete[0]._id}, {}, function(err, result) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert(_.isNull(result))
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.findOne({_id: docsToDelete[1]._id}, {}, function(err, result) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert(_.isNull(result))
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.findOne({_id: docs[2]._id}, {}, function(err, result) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.deepEqual(result, docs[2])
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    }
                  ], function(err) {
                    return done(err)
                  })
                })
              })
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'DeleteObjectsNoIdTest',
            description: 'Verify deleteObject throws when no id present test',
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
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'DeleteObjectsNoIdAsyncTest',
            description: 'Verify deleteObject throws when no id present async test',
            doTest: function(ctx, done) {
              var self = this
              this.c.insertObjects([
                {foo: 'foo'},
                {bar: 'bar'},
                {baz: 'baz'}
              ], {}, function(err, docs) {
                var _ids = _.map(docs, '_id')
                _ids[1] = undefined
                self.c.deleteObjects(_ids, {}, function(err) {
                  var e = undefined
                  try {
                    assert(err.toString().match(/_ids required/))
                  } catch (err) {
                    e = err
                  }
                  done(e)
                })
              })
            }
          }),
        ]
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'RemoveObjectTests',
        description: 'removeObject tests',
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'RemoveObjectSimpleTest',
            description: 'Simple removeObject test',
            doTest: function() {
              var self = this
              var doc = this.c.insertObject({foo: 'foo'})
              assert('_id' in doc)
              assert.doesNotThrow(function() {
                self.c.removeObject(doc._id)
              }, errors.LeafnodeObjectSetOperationError)
              doc = this.c.insertObject({foo: 'foo'})
              doc._id += 1
              assert.throws(function() {
                self.c.removeObject(doc._id)
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
            name: 'RemoveObjectSimpleAsyncTest',
            description: 'Simple removeObject async test',
            doTest: function(ctx, done) {
              var self = this
              var doc = this.c.insertObject({foo: 'foo'}, {}, function(err, doc) {
                if (err) {
                  return done(err)
                }
                try {
                  assert('_id' in doc)
                } catch (e) {
                  return done(e)
                }
                self.c.removeObject(doc._id, {}, function(err, result) {
                  self.c.insertObject({foo: 'foo'}, {}, function(err, doc) {
                    doc._id += 1
                    self.c.removeObject(doc._id, {}, function(err, result) {
                      var e = undefined
                      try {
                        assert(err instanceof errors.LeafnodeObjectSetOperationError)
                        assert.equal(err.modifiedCount, 0)
                        assert.equal(err.objectCount, 1)
                      } catch (err) {
                        e = err
                      }
                      done(e)
                    })
                  })
                })
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
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'RemoveObjectNoIdAsyncTest',
            description: 'Verify removeObject throws when no id present async test',
            doTest: function(ctx, done) {
              this.c.removeObject(undefined, {}, function(err, result) {
                var e = undefined
                try {
                  assert(err.toString().match(/_id required/))
                } catch (err) {
                  e = err
                }
                done(e)
              })
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
            name: 'RemoveObjectsSimpleAsyncTest',
            description: 'Simple removeObject async test',
            doTest: function(ctx, done) {
              var self = this
              this.c.count({}, function(err, docCount) {
                self.c.insertObjects([
                  {foo: 'foo'},
                  {bar: 'bar'},
                  {baz: 'baz'}
                ], {}, function(err, docs) {
                  if (err) {
                    return done(err)
                  }
                  docsToDelete = docs.slice(0, 2)
                  async.series([
                    function(done) {
                      debugger
                      self.c.count({}, function(err, count) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.equal(count, docCount + docs.length)
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.removeObjects(_.map(docsToDelete, '_id'), {}, function(err, result) {
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.count({}, function(err, count) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.equal(count, docCount + docs.length - 2)
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.findOne({_id: docsToDelete[0]._id}, {}, function(err, result) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert(_.isNull(result))
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.findOne({_id: docsToDelete[1]._id}, {}, function(err, result) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert(_.isNull(result))
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    },
                    function(done) {
                      debugger
                      self.c.findOne({_id: docs[2]._id}, {}, function(err, result) {
                        if (err) {
                          return done(err)
                        }
                        try {
                          assert.deepEqual(result, docs[2])
                        } catch (e) {
                          err = e
                        }
                        return done(err)
                      })
                    }
                  ], function(err) {
                    return done(err)
                  })
                })
              })
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
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'RemoveObjectsNoIdAsyncTest',
            description: 'Verify removeObject throws when no id present async test',
            doTest: function(ctx, done) {
              var self = this
              this.c.insertObjects([
                {foo: 'foo'},
                {bar: 'bar'},
                {baz: 'baz'}
              ], {}, function(err, docs) {
                var _ids = _.map(docs, '_id')
                _ids[1] = undefined
                self.c.removeObjects(_ids, {}, function(err) {
                  var e = undefined
                  try {
                    assert(err.toString().match(/_ids required/))
                  } catch (err) {
                    e = err
                  }
                  done(e)
                })
              })
            }
          }),
        ]
      }),

      // -- legacy tests
      
      module.exports = o({
        _type: util.LeafnodeTestSuite,
        name: 'DistinctTests',
        description: 'distinct tests',
        colName: 'leafnode.distinct-test',
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'DistinctTest',
            description: 'distinct test',
            doTest: function() {
              var obj1 = { "a" : 1, "b" : 2 };
              var obj2 = { "a" : 2, "b" : 3 };
              var obj3 = { "a" : 3, "b" : 3 };
              
              this.c.insert(obj1);
              this.c.insert(obj2);
              this.c.insert(obj3);

              var distincts = this.c.distinct("a");
              assert.equal(distincts.length, 3);
              distincts = this.c.distinct("a", { b : 3 });
              assert.equal(distincts.length, 2);
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTestSuite,
        name: 'FindTests',
        description: 'find tests',
        colName: 'leafnode.find-test',
        setup: function() {
          util.LeafnodeTestSuite.prototype.setup.call(this)
          this.numDocs = 100
        },
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'cursorTest',
            description: 'cursor test',
            doTest: function() {
              var obj = undefined

              for (var i = 0; i < this.parent.numDocs; i++) {
                obj = this.parent.makeObj(i)
                this.c.insert(obj)
              }

              var j = 0
              var cursor = this.c.find({})
              while (obj = cursor.next()) {
                j++
              }
              assert.equal(j, this.parent.numDocs)
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'arrayTest',
            description: 'array test',
            doTest: function() {
              var obj = undefined
              for (var i = 0; i < this.parent.numDocs; i++) {
                obj = this.parent.makeObj(i)
                this.c.insert(obj)
              }
              
              var all = this.c.find().toArray()
              assert.equal(all.length, this.parent.numDocs)
              
              var o = this.parent.makeObj(0)
              for (var i in all) {
                var a = all[i]
                assert.equal(o.iField, a.iField)
                assert.equal(o.ddField, a.ddField)
                assert.equal(o.bField, a.bField)
                assert.equal(o.b2Field, a.b2Field)
                assert.equal(o.dField.getTime(), a.dField.getTime())
                assert.equal(o.nField, a.nField)
                assert.deepEqual(o.aField, a.aField)
                assert.deepEqual(o.oField, a.oField)
              }
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'findOneTest',
            description: 'findOne test',
            doTest: function() {
              var obj = {_id: 0}
              this.c.insert(obj)
              var result = this.c.findOne({_id: 0})
              assert.deepEqual(obj, result)
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTestSuite,
        name: 'InsertTests',
        description: 'insert tests',
        colName: 'leafnode.insert-test',
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'InsertTest',
            description: 'insert test',
            doTest: function() {
              var obj = undefined
              for (var i = 0; i < 100; i++) {
                obj = this.parent.makeObj(i);
                this.c.insert(obj);
              }
              
              var all = this.c.find().toArray();
              var o = this.parent.makeObj(0);
              for (var i in all) { // TODO: just de?
                var a = all[i];
                assert.equal(o.iField, a.iField);
                assert.equal(o.ddField, a.ddField);
                assert.equal(o.bField, a.bField);
                assert.equal(o.b2Field, a.b2Field);
                assert.equal(o.dField.getTime(), a.dField.getTime());
                assert.equal(o.nField, a.nField);
                assert.deepEqual(o.aField, a.aField);
                assert.deepEqual(o.oField, a.oField);
              }
            }
          }),
          o({
            _type: util.LeafnodeTest,
            name: 'BulkInsertTest',
            description: 'bulk insert test',
            doTest: function() {
              var o = {};
              this.c.insert([o]);
              assert.ok(o._id);
            }
          })
        ]
      }),
      o({
        _type: util.LeafnodeTestSuite,
        name: 'UpdateTests',
        description: 'update tests',
        colName: 'leafnode.update-test',
        tests: [
          o({
            _type: util.LeafnodeTest,
            name: 'UpdateTest',
            description: 'update test',
            doTest: function() {
              var obj1 = { "a" : 1, "b" : 2 };
              var obj2 = { "a" : 2, "b" : 3 };
              var obj3 = { "a" : 3, "b" : 3 };

              this.c.insert([obj1, obj2, obj3]);

              this.c.update({ _id : obj1._id }, { "$set" : { "a" : 0 }});

              var lookup = this.c.find({ "a" : 0 }).toArray();
              assert.equal(lookup.length, 1);    
            }
          })
        ]
      })

      // -- 
    ]
  })
})
