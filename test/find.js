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

var util = require('./util')

var numDocs = 100

var findTests = o({
  _type: util.LeafnodeTestSuite,
  name: 'FindTests',
  description: 'find tests',
  colName: 'leafnode.find-test',
  tests: [
    o({
      _type: util.LeafnodeTest,
      name: 'cursorTest',
      description: 'cursor test',
      doTest: function() {
        var obj = undefined

        for (var i = 0; i < numDocs; i++) {
          obj = this.parent.makeObj(i)
          this.c.insert(obj)
        }

        var j = 0
        var cursor = this.c.find({})
        while (obj = cursor.next()) {
          j++
        }
        assert.equal(j, numDocs)
      }
    }),
    o({
      _type: util.LeafnodeTest,
      name: 'arrayTest',
      description: 'array test',
      doTest: function() {
        var obj = undefined
        for (var i = 0; i < numDocs; i++) {
          obj = this.parent.makeObj(i)
          this.c.insert(obj)
        }
        
        var all = this.c.find().toArray()
        assert.equal(all.length, numDocs)
        
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
})

module.exports = findTests

