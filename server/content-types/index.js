'use strict'

const task = require('./tasks')
const indexingLog = require('./indexing-logs')
const registeredIndex = require('./registered-indexes')
const mapping = require('./mappings')

module.exports = {
    'task': { schema : task },
    'indexing-log': { schema: indexingLog },
    'registered-index': { schema: registeredIndex },
    'mapping': { schema: mapping }
}
