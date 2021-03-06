.. class:: leafnode.Cursor
    :heading:

.. |br| raw:: html

   <br />

===============
leafnode.Cursor
===============

Instance Properties
-------------------

.. class:: leafnode.Cursor
    :noindex:
    :hidden:

    .. attribute:: cursor

       :type: xxx
       :required:

       xxx


Methods
-------

.. class:: leafnode.Cursor
    :noindex:
    :hidden:

    .. function:: count(applySkipLimit, options, options.skip, options.limit, options.maxTimeMS, options.hint, options.readPreference, cb)

        :param applySkipLimit: Should the count command apply limit and skip settings on the cursor or use the passed in options.
        :type applySkipLimit: boolean
        :param options: Optional settings.
        :type options: object
        :param options.skip: The number of documents to skip.
        :type options.skip: number
        :param options.limit: The maximum amounts to count before aborting.
        :type options.limit: number
        :param options.maxTimeMS: Number of miliseconds to wait before aborting the query.
        :type options.maxTimeMS: number
        :param options.hint: An index name hint for the query.
        :type options.hint: string
        :param options.readPreference: The preferred read preference (ReadPreference.PRIMARY, ReadPreference.PRIMARY_PREFERRED, ReadPreference.SECONDARY, ReadPreference.SECONDARY_PREFERRED, ReadPreference.NEAREST).
        :type options.readPreference: ReadPreference | string
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :returns: returns the count
        :rtype: number

        Get the count of documents for this cursor

    .. function:: limit(value)

        :param value: The limit for the cursor query.
        :type value: number
        :throws: MongoError 
        :rtype: Cursor

        Set the limit for the cursor.

    .. function:: next(cb)

        :deprecated:
        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :throws: Error 
        :returns: returns the next document or null
        :rtype: object

        Get the next available document from the cursor, returns null if no more documents are available.

    .. function:: project(value)

        :param value: field projection object.
        :type value: object
        :throws: MongoError 
        :rtype: Cursor

        Set the projection for the cursor.

    .. function:: setOption(field, value)

        :param field: The cursor option to set ['numberOfRetries', 'tailableRetryInterval'].
        :type field: string
        :param value: The field value.
        :type value: object
        :throws: MongoError 
        :rtype: Cursor

        Set a node.js specific cursor option

    .. function:: skip(value)

        :param value: The skip for the cursor query.
        :type value: number
        :throws: Error 
        :rtype: Cursor

        Set the skip for the cursor.

    .. function:: sort(keyOrList, direction)

        :param keyOrList: The key or a keys set used by the sort.
        :type keyOrList: string | array | object
        :param direction: The direction of the sorting (1 or -1).
        :type direction: number
        :throws: Error 
        :returns: xxx
        :rtype: Cursor

        Sets the sort order of the cursor query.

    .. function:: toArray(cb)

        :param cb: execute asynchronously if present (signature: cb(err, result))
        :type cb: function
        :throws: Error 
        :returns: returns array of docs
        :rtype: array

        Returns an array of documents. The caller is responsible for making sure that there is enough memory to store the results. Note that the array only contain partial results when this cursor had been previouly accessed. In that case, cursor.rewind() can be used to reset the cursor.
