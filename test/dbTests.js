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

var _ = require('lodash')

var o = require('@carbon-io/atom').o(module).main
var oo = require('@carbon-io/atom').oo(module)

var util = require('./util')

var dbTests = o({
  _type: util.LeafnodeTestSuite,
  name: 'dbTests',
  description: 'db tests',
  colName: 'leafnode.db-test',
  tests: [
    o({
      _type: util.LeafnodeTest,
      name: 'createCollectionTest',
      description: 'createCollection test',
      doTest: function() {
        var self = this
        var col = undefined
        try {
          assert.doesNotThrow(function() {
            col = self.db.createCollection('leafnode.createCollectionTest', {safe: true})
          }, Error)
          assert(!_.isUndefined(col))
        } finally {
          if (!_.isUndefined(col)) {
            col.drop()
            col = undefined
          }
        }
        try {
          assert.doesNotThrow(function() {
            col = self.db.createCollection('leafnode.createCollectionTest')
          }, Error)
          assert(!_.isUndefined(col))
        } finally {
          if (!_.isUndefined(col)) {
            col.drop()
            col = undefined
          }
        }
      }
    })
  ]
})


module.exports = dbTests
