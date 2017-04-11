var __ = require('@carbon-io/fibers').__(module)
var o = require('@carbon-io/atom').o(module).main
var _o = require('@carbon-io/bond')._o(module)
var testtube = require('@carbon-io/test-tube')

__(function() {
  module.exports = o({
    _type: testtube.Test,
    name: 'LeafnodeTests',
    tests: [
      _o('./leafnodeTests'),
      _o('./dbTests'),
      _o('./collectionTests'),
      _o('./find'),
      _o('./insert'),
      _o('./update'),
      _o('./distinct')
    ]
  })
})

