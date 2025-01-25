const configureIndexingRoutes = require('./configure-indexing')
const performSearch = require('./perform-search')
const runLog = require('./run-log')
const setupInfo = require('./setup-info')
const performIndexing = require('./perform-indexing')
const tools = require('./tools')
const indexes = require('./indexes')

module.exports = {
    config: configureIndexingRoutes,
    search: performSearch,
    runLog: runLog,
    setupInfo: setupInfo,
    performIndexing: performIndexing,
    tools: tools,
    indexes: indexes
}
