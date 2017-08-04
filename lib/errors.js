var util = require('util')

var MongoError = require('mongodb').MongoError

function LeafnodeError(message) {
  MongoError.call(this, message)
  this.name = this.constructor.name
}

util.inherits(LeafnodeError, MongoError)

function LeafnodeObjectSetOperationError(message, objectCount) {
  LeafnodeError.call(this, message)
  this.objectCount = objectCount
}

util.inherits(LeafnodeObjectSetOperationError, LeafnodeError)

function LeafnodeObjectSetUpdateError(message, objectCount, matchedCount, modifiedCount, upsertedCount) {
  LeafnodeObjectSetOperationError.call(this, message, objectCount)
  this.modifiedCount = modifiedCount
  this.matchedCount = matchedCount
  this.upsertedCount = upsertedCount
}

util.inherits(LeafnodeObjectSetUpdateError, LeafnodeObjectSetOperationError)

function LeafnodeObjectSetDeleteError(message, objectCount, deletedCount) {
  LeafnodeObjectSetOperationError.call(this, message, objectCount)
  this.deletedCount = deletedCount
}

util.inherits(LeafnodeObjectSetDeleteError, LeafnodeObjectSetOperationError)

module.exports = {
  LeafnodeError: LeafnodeError,
  LeafnodeObjectSetDeleteError: LeafnodeObjectSetDeleteError,
  LeafnodeObjectSetOperationError: LeafnodeObjectSetOperationError,
  LeafnodeObjectSetUpdateError: LeafnodeObjectSetUpdateError
}
