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
    name: 'CursorTests',
    description: 'Cursor tests',
    colName: 'leafnode',
    conOptions: {
      db: {
        pkFactory: pkFactory
      }
    },
    populate: function() {
      var self = this
      this.c.insert(_.map(_.range(50), function(val) {
        return self.makeObj(val)
      }))
    },
    tests: [
      o({
        _type: util.LeafnodeTest,
        name: 'SimpleCountTest',
        description: 'Simple count test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          var curs = this.c.find({})
          assert.equal(curs.count(), 50)
          this.c.remove({i: {$gte: 25}})
          curs = this.c.find({})
          assert.equal(curs.count(), 25)
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SimpleCountAsyncTest',
        description: 'Simple count async test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function(ctx, done) {
          var self = this
          this.c.find({}, function(err, curs) {
            if (err) {
              return done(err)
            }
            curs.count(false, {}, function(err, count) { 
              if (err) {
                return done(err)
              }
              try {
                assert.equal(count, 50)
              } catch (err) {
                return done(err)
              }
              self.c.remove({i: {$gte: 25}}, {}, function(err, result) {
                if (err) {
                  return done(err)
                }
                self.c.find({}, function(err, curs) {
                  if (err) {
                    return done(err)
                  }
                  curs.count(false, {}, function(err, count) {
                    if (err) {
                      return done(err)
                    }
                    try {
                      assert.equal(count, 25)
                    } catch (e) {
                      err = e
                    }
                    return done(err)
                  })
                })
              })
            })
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SimpleNextTest',
        description: 'Simple next test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          var curs = this.c.find({})
          assert.equal(curs.next().i, 0)
          curs = this.c.find({i: {$gte: 49}})
          assert.equal(curs.next().i, 49)
          assert(_.isNil(curs.next()))
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SimpleNextAsyncTest',
        description: 'Simple next async test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function(ctx, done) {
          var self = this
          this.c.find({}, function(err, curs) {
            if (err) {
              return done(err)
            }
            curs.next(function(err, val) {
              if (err) {
                return done(err)
              }
              try {
                assert.equal(val.i, 0)
              } catch (err) {
                return done(err)
              }
              self.c.find({i: {$gte: 49}}, function(err, curs) {
                if (err) {
                  return done(err)
                }
                curs.next(function(err, val) {
                  if (err) {
                    return done(err)
                  }
                  try {
                    assert.equal(val.i, 49)
                  } catch (err) {
                    return done(err)
                  }
                  curs.next(function(err, val) {
                    if (err) {
                      return done(err)
                    }
                    try {
                      assert(_.isNil(val))
                    } catch (e) {
                      err = e
                    }
                    done(err)
                  })
                })
              })
            })
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SimpleSortTest',
        description: 'Simple sort test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          var curs = this.c.find({})
          curs.sort('i', -1)
          assert.equal(curs.next().i, 49)
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SimpleLimitTest',
        description: 'Simple limit test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          var curs = this.c.find({})
          curs.limit(25)
          assert.equal(curs.count(true), 25)
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'ToArrayTest',
        description: 'Simple toArray test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          assert.equal(this.c.find({}).count(), 50)
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'ToArrayAsyncTest',
        description: 'Simple toArray async test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function(ctx, done) {
          var self = this
          this.c.find({}, function(err, curs) {
            if (err) {
              done(err)
            }
            curs.toArray(function(err, docs) {
              if (err) {
                done(err)
              }
              try {
                assert.equal(docs.length, 50)
              } catch (e) {
                err = e
              }
              done(err)
            })
          })
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SetOptionTest',
        description: 'Simple setOption test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          var self = this
          var curs = self.c.find({})
          assert.doesNotThrow(function() {
            curs.setOption('numberOfRetries', 10)
          }, Error)
          assert.throws(function() {
            curs.setOption({'foobar': 10})
          }, Error)
        }
      }),
      o({
        _type: util.LeafnodeTest,
        name: 'SkipTest',
        description: 'Simple skip test',
        setup: function() {
          util.LeafnodeTest.prototype.setup.call(this)
          this.parent.populate()
        },
        doTest: function() {
          var self = this
          var curs = self.c.find({}).skip(25)
          assert.equal(curs.next().i, 25)
        }
      }),
    ]
  })
})

