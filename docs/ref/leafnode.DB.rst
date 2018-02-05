.. class:: leafnode.DB
    :heading:

.. |br| raw:: html

   <br />

===========
leafnode.DB
===========

DB class description

Instance Properties
-------------------

.. class:: leafnode.DB
    :noindex:
    :hidden:

    .. attribute:: nativeDb

       :type: xxx
       :required:

       nativeDb


Methods
-------

.. class:: leafnode.DB
    :noindex:
    :hidden:

    .. function:: authenticate(username, password, options, options.authMechanism, cb)

        :param username: The username.
        :type username: string
        :param password: The password.
        :type password: string
        :param options: Optional settings.
        :type options: object
        :param options.authMechanism: The authentication mechanism to use, GSSAPI, MONGODB-CR, MONGODB-X509, PLAIN
        :type options.authMechanism: string
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: returns true if authed, false otherwise
        :rtype: boolean

        Authenticate a user against the server.

    .. function:: close(force, cb)

        :param force: Force close, emitting no events
        :type force: boolean
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: no return value
        :rtype: undefined

        Close the db and it's underlying connections

    .. function:: command(command, options, options.readPreference, options.maxTimeMS, cb)

        :param command: The command hash
        :type command: object
        :param options: Optional settings.
        :type options: object
        :param options.readPreference: The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
        :type options.readPreference: ReadPreference | string
        :param options.maxTimeMS: Number of milliseconds to wait before aborting the query.
        :type options.maxTimeMS: number
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: returns result of the command
        :rtype: object

        Execute a command

    .. function:: createCollection(name, options, options.w, options.wtimeout, options.j, options.raw, options.pkFactory, options.readPreference, options.serializeFunctions, options.strict, options.capped, options.size, options.max, options.autoIndexId, cb)

        :param name: the collection name we wish to access.
        :type name: string
        :param options: Optional settings.
        :type options: object
        :param options.w: The write concern.
        :type options.w: number | string
        :param options.wtimeout: The write concern timeout.
        :type options.wtimeout: number
        :param options.j: Specify a journal write concern.
        :type options.j: boolean
        :param options.raw: Return document results as raw BSON buffers.
        :type options.raw: boolean
        :param options.pkFactory: A primary key factory object for generation of custom _id keys.
        :type options.pkFactory: object
        :param options.readPreference: The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
        :type options.readPreference: ReadPreference | string
        :param options.serializeFunctions: Serialize functions on any object.
        :type options.serializeFunctions: boolean
        :param options.strict: Returns an error if the collection does not exist
        :type options.strict: boolean
        :param options.capped: Create a capped collection.
        :type options.capped: boolean
        :param options.size: The size of the capped collection in bytes.
        :type options.size: number
        :param options.max: The maximum number of documents in the capped collection.
        :type options.max: number
        :param options.autoIndexId: Create an index on the _id field of the document, True by default on MongoDB 2.2 or higher off for version < 2.2.
        :type options.autoIndexId: boolean
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: returns newly created collection
        :rtype: Collection

        Creates a collection on a server pre-allocating space, need to create f.ex capped collections.

    .. function:: db(name, options, options.noListener, options.returnNonCachedInstance, cb)

        :param name: The name of the database we want to use.
        :type name: string
        :param options: Optional settings.
        :type options: object
        :param options.noListener: Do not make the db an event listener to the original connection.
        :type options.noListener: boolean
        :param options.returnNonCachedInstance: Control if you want to return a cached instance or have a new one created
        :type options.returnNonCachedInstance: boolean
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :rtype: DB

        Create a new Db instance sharing the current socket connections. Be aware that the new db instances are related in a parent-child relationship to the original instance so that events are correctly emitted on child db instances. Child db instances are cached so performing db('db1') twice will return the same instance. You can control these behaviors with the options noListener and returnNonCachedInstance.

    .. function:: getCollection(name, options, options.w, options.wtimeout, options.j, options.raw, options.pkFactory, options.readPreference, options.serializeFunctions, options.strict, cb)

        :param name: the collection name we wish to access.
        :type name: string
        :param options: Optional settings.
        :type options: object
        :param options.w: The write concern.
        :type options.w: number | string
        :param options.wtimeout: The write concern timeout.
        :type options.wtimeout: number
        :param options.j: Specify a journal write concern.
        :type options.j: boolean
        :param options.raw: Return document results as raw BSON buffers.
        :type options.raw: boolean
        :param options.pkFactory: A primary key factory object for generation of custom _id keys.
        :type options.pkFactory: object
        :param options.readPreference: The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
        :type options.readPreference: ReadPreference | string
        :param options.serializeFunctions: Serialize functions on any object.
        :type options.serializeFunctions: boolean
        :param options.strict: Returns an error if the collection does not exist
        :type options.strict: boolean
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: return the new Collection instance if not in strict mode
        :rtype: Collection

        Fetch a specific collection (containing the actual collection information).

    .. function:: getCollectionNames(cb)

        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: returns an array of objects containing collection info
        :rtype: array

        Fetch all collection names for the current db.

    .. function:: getCollections(cb)

        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: returns an array of objects containing collection info
        :rtype: array

        Fetch all collections for the current db.

    .. function:: stats(options, options.scale, cb)

        :param options: Optional settings.
        :type options: object
        :param options.scale: Divide the returned sizes by scale value.
        :type options.scale: number
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: see: http://mongodb.github.io/node-mongodb-native/2.2/api/Db.html#~resultCallback
        :rtype: object

        Get all the db statistics.
