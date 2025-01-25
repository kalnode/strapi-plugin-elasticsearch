'use strict'

const task = require('./tasks')
const indexingLog = require('./indexing-logs')
const registeredIndex = require('./registered-indexes')

module.exports = {
    'task': { schema : task },
    'indexing-log': { schema: indexingLog },
    'registered-index': { schema: registeredIndex }
}
