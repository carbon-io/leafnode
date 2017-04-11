var assert = require('assert');

var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module).main
var oo = require('@carbon-io/atom').oo(module)

var util = require('./util')

__(function() {
  module.exports = o({
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
})
