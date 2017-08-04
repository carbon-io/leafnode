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

function LeafnodeObjectSetUpdateError(message, matchedCount, modifiedCount, upsertedCount, objectCount) {
  LeafnodeObjectSetOperationError.call(this, message, modifiedCount, objectCount)
  this.matchedCount = matchedCount
  this.upsertedCount = upsertedCount
}

util.inherits(LeafnodeObjectSetUpdateError, LeafnodeObjectSetOperationError)

module.exports = {
  LeafnodeError: LeafnodeError,
  LeafnodeObjectSetOperationError: LeafnodeObjectSetOperationError,
  LeafnodeObjectSetUpdateError: LeafnodeObjectSetUpdateError
}
