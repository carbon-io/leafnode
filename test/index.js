var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module)
var _o = require('@carbon-io/bond')._o(module)
var testtube = require('@carbon-io/test-tube')

__(function() {
  module.exports = o.main({
    _type: testtube.Test,
    name: 'LeafnodeTests',
    tests: [
      _o('./leafnode-tests'),
      _o('./DbTests'),
      _o('./CollectionTests')
    ]
  })
})

