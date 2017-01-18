var util = require('util')

var MongoError = require('mongodb').MongoError

function LeafnodeError(message) {
  MongoError.call(this, message)
  this.name = this.constructor.name
}

util.inherits(LeafnodeError, MongoError)

function LeafnodeObjectSetOperationError(message, modifiedCount, objectCount) {
  LeafnodeError.call(this, message)
  this.modifiedCount = modifiedCount
  this.objectCount = objectCount
}

util.inherits(LeafnodeObjectSetOperationError, LeafnodeError)

module.exports = {
  LeafnodeError: LeafnodeError,
  LeafnodeObjectSetOperationError: LeafnodeObjectSetOperationError
}
