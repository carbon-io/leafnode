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

var distinctTests = o({
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
})

module.exports = distinctTests
