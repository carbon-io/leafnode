var assert = require('assert')
var sinon = require('sinon')

var _ = require('lodash')
var mongodbURI = require('mongodb-uri')

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)
var testtube = require('@carbon-io/test-tube')

var Collection = require('../lib/collection')
var leafnode = require('../lib/leafnode')

var util = require('./util')


STANDALONE_ERR_URI = 'mongodb://127.0.0.1:666'
REPL_SET_ERR_URI = 'mongodb://127.0.0.1:666,127.0.0.1:777,127.0.0.1:8888/replSet=1134'

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'LeafnodeTests',
    description: 'Leafnode tests',
    setup: function() {
      this.standAloneURI = mongodbURI.parse(util.STAND_ALONE_DB_URI)
      assert.equal(this.standAloneURI.hosts.length, 1)
      this.standAloneURI.database = util.DB_NAME
      this.standAloneURI = mongodbURI.format(this.standAloneURI)
      this.replSetURI = undefined
      this.replSetSingleNodeURI = undefined
      if (!_.isUndefined(util.REPL_SET_DB_URI)) {
        this.replSetURI = util.REPL_SET_DB_URI
        var parsedURI = mongodbURI.parse(this.replSetURI)
        parsedURI.database = util.DB_NAME
        this.replSetURI = mongodbURI.format(parsedURI)
        parsedURI.hosts.splice(1, parsedURI.hosts.length - 1)
        this.replSetSingleNodeURI = mongodbURI.format(parsedURI)
      }
    },
    _throwReplSetSkipTestError: function() {
      if (_.isUndefined(util.REPL_SET_DB_URI)) {
        throw new testtube.errors.SkipTestError(
          'repl set uri not configured (env:LEAFNODE_REPL_SET_MONGODB_URI)')
      }
    },
    tests: [
      o({
        _type: testtube.Test,
        name: 'ConnectionTest',
        description: 'connection test',
        doTest: function() {
          var con = undefined
          try {
            con = leafnode.connect(this.parent.standAloneURI)
            assert.equal(con.databaseName, util.DB_NAME)
            assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
          } finally {
            con.close()
          }
        }
      }),
      o({
        _type: testtube.Test,
        name: 'AsyncConnectionTest',
        description: 'Async connection test.',
        doTest: function(ctx, done) {
          leafnode.connect(this.parent.standAloneURI, {}, undefined, function(err, con) {
            if (!_.isNil(err)) {
              return done(err)
            }
            try {
              assert.equal(con.databaseName, util.DB_NAME)
              assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
            } catch (e) {
              err = e
            }
            con.close(true, function(e) {
              return done(err || e)
            })
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'ConnectionErrorTest',
        description: 'Connection error test',
        doTest: function() {
          assert.throws(function() {
            leafnode.connect(STANDALONE_ERR_URI)
          }, Error)
        }
      }),
      o({
        _type: testtube.Test,
        name: 'AsyncConnectionErrorTest',
        description: 'Async connection error test.',
        doTest: function(ctx, done) {
          leafnode.connect(STANDALONE_ERR_URI, {}, undefined, function(err, con) {
            var e = undefined
            try {
              assert(err instanceof Error)
              assert(_.isNil(con))
            } catch (err) {
              e = err
            }
            return done(e)
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'ReplSetConnectionTest',
        description: 'ReplSet connection test',
        doTest: function() {
          var con = undefined
          this.parent._throwReplSetSkipTestError()
          try {
            con = leafnode.connect(this.parent.replSetURI)
            assert.equal(con.databaseName, util.DB_NAME)
            assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.ReplSet)
          } finally {
            con.close()
          }
        }
      }),
      o({
        _type: testtube.Test,
        name: 'AsyncReplSetConnectionTest',
        description: 'Async replSet connection test',
        doTest: function(ctx, done) {
          try {
            this.parent._throwReplSetSkipTestError()
          } catch (e) {
            return done(e)
          }
          leafnode.connect(this.parent.replSetURI, {}, false, function(err, con) {
            if (!_.isNil(err)) {
              return done(err)
            }
            try {
              assert.equal(con.databaseName, util.DB_NAME)
              assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.ReplSet)
            } catch(e) {
              err = e
            } finally {
              con.close(true, function(e) {
                return done(err || e)
              })
            }
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'ReplSetConnectionErrrorTest',
        description: 'ReplSet connection error test',
        doTest: function() {
          assert.throws(function() {
            // setting haInterval to avoid 10 second timeout
            leafnode.connect(REPL_SET_ERR_URI, {ha: false, haInterval: 100})
          }, Error)
        }
      }),
      o({
        _type: testtube.Test,
        name: 'AsyncReplSetConnectionErrorTest',
        description: 'Async replSet connection error test',
        doTest: function(ctx, done) {
          leafnode.connect(
            // setting haInterval to avoid 10 second timeout
            REPL_SET_ERR_URI, {ha: false, haInterval: 100}, false, function(err, con) {
              var e = undefined
              try {
                assert(err instanceof Error)
                assert(_.isNil(con))
              } catch(err) {
                e = err
              }
              done(e)
            }
          )
        }
      }),
      o({
        _type: testtube.Test,
        name: 'SingleNodeConnectionTest',
        description: 'Single node connection test',
        doTest: function() {
          var self = this
          var con = undefined
          assert.doesNotThrow(function() {
            con = leafnode.connect(self.parent.standAloneURI, {}, true)
          }, Error)
          try {
            assert.equal(con.databaseName, util.DB_NAME)
            assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
          } finally {
            con.close()
          }
        }
      }),
      o({
        _type: testtube.Test,
        name: 'AsyncSingleNodeConnectionTest',
        description: 'Async single node connection test',
        doTest: function(ctx, done) {
          var self = this

          leafnode.connect(self.parent.standAloneURI, {}, true, function(err, con) {
            if (!_.isNil(err)) {
              return done(err)
            }
            try {
              assert.equal(con.databaseName, util.DB_NAME)
              assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
            } catch (e) {
              err = e
            }
            con.close(true, function(e) {
              return done(err || e)
            })
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'ReplSetSingleNodeConnectionTest',
        description: 'ReplSet single node connection test',
        doTest: function() {
          var self = this
          var con = undefined
          this.parent._throwReplSetSkipTestError()
          assert.throws(function() {
            leafnode.connect(self.parent.replSetURI, {}, true)
          }, Error)
          try {
            con = leafnode.connect(this.parent.replSetSingleNodeURI, {}, true)
            assert.equal(con.databaseName, util.DB_NAME)
            assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
          } finally {
            con.close()
          }
        }
      }),
      o({
        _type: testtube.Test,
        name: 'AsyncReplSetSingleNodeConnectionTest',
        description: 'Async replSet single node connection test',
        doTest: function(ctx, done) {
          var self = this
          try {
            this.parent._throwReplSetSkipTestError()
          } catch (e) {
            return done(e)
          }
          leafnode.connect(self.parent.replSetURI, {}, true, function(err, con) {
            try {
              assert(err instanceof Error)
            } catch (e) {
              done(e)
            }
            leafnode.connect(self.parent.replSetSingleNodeURI, {}, true, function(err, con) {
              if (!_.isNil(err)) {
                return done(err)
              }
              try {
                assert.equal(con.databaseName, util.DB_NAME)
                assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
              } catch (e) {
                err = e
              }
              con.close(true, function(e) {
                return done(err || e)
              })
            })
          })
        }
      }),
      o({
        _type: testtube.Test,
        name: 'VerifySingleNodeConnectionDatabaseOptionsHonoredTest',
        description: 'Verify that database options are honored test',
        setup: function() {
          counter = 0
          this.pkFactory = {
            createPk: function() {
              return counter++
            }
          }
        },
        doTest: function() {
          this.parent._throwReplSetSkipTestError()
          var self = this
          var con = undefined
          var col = undefined
          try {
            con = leafnode.connect(
              this.parent.standAloneURI, {db: {pkFactory: this.pkFactory}}, true)
            assert.equal(con.databaseName, util.DB_NAME)
            assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
            col = con.createCollection('foo')
            for (var i = 0; i < 10; i++) {
              col.insert({foo: i})
            }
            assert.equal(col.findOne({foo: 2})._id, 2)
            assert.equal(col.findOne({foo: 5})._id, 5)
            assert.equal(col.findOne({foo: 8})._id, 8)
          } finally {
            col.drop()
            con.close()
          }
        }
      }),
      o({
        _type: testtube.Test,
        name: 'VerifyAsyncSingleNodeConnectionDatabaseOptionsHonoredTest',
        description: 'Verify that database options are honored test (async)',
        setup: function() {
          counter = 0
          this.pkFactory = {
            createPk: function() {
              return counter++
            }
          }
        },
        doTest: function(ctx, done) {
          try {
            this.parent._throwReplSetSkipTestError()
          } catch (e) {
            return done(e)
          }
          var self = this
          var col = undefined
          
          leafnode.connect(
            this.parent.standAloneURI, {db: {pkFactory: this.pkFactory}}, true, function(err, con) {
              if (!_.isNil(err)) {
                return done(err)
              }
              try {
                assert.equal(con.databaseName, util.DB_NAME)
                assert(con._nativeDB.serverConfig instanceof leafnode.mongodb.Server)
              } catch (err) {
                con.close(true, function(e) {
                  return done(err)
                })
              }
              con.createCollection('foo', {}, function(err, col) {
                if (!_.isNil(err)) {
                  con.close(true, function(e) {
                    return done(err)
                  })
                }

                var i = -1
                var ids = [2, 5, 8]
                var insert = function(err) {
                  if (++i === 10) {
                    var id = undefined
                    var cleanup = function(err) {
                      return col.drop({}, function(e) {
                        return con.close(true, function(e1) {
                          return done(err || e || e1)
                        })
                      })
                    }
                    var check = function(err, doc) {
                      if (ids.length === 0 || err) {
                        return cleanup(err)
                      } else if (!_.isNil(id)) {
                        try {
                          assert.equal(doc._id, id)
                        } catch (e) {
                          return cleanup(e)
                        }
                      }
                      id = ids.shift()
                      col.findOne({foo: id}, {}, check)
                    }
                    return check()
                  } else {
                    col.insert({foo: i}, {}, insert)
                  }
                }
                return insert()
              })
            }
          )
        }
      })
    ]
  })
})

