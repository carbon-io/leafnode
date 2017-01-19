var assert = require('assert');

var o = require('@carbon-io/atom').o(module).main
var oo = require('@carbon-io/atom').oo(module)
var _o = require('@carbon-io/bond')._o(module)

var util = require('./util')

var insertTests = o({
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
})

module.exports = insertTests
