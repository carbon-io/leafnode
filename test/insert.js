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
