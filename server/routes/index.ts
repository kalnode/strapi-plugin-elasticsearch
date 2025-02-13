import configureIndexingRoutes from "./configure-indexing"
import performSearch from "./perform-search"
import runLog from "./run-log"
import setupInfo from "./setup-info"
import performIndexing from "./perform-indexing"
import tools from "./tools"
import indexes from "./indexes"
import mappings from "./mappings"

export default {
    config: configureIndexingRoutes,
    search: performSearch,
    runLog: runLog,
    setupInfo: setupInfo,
    performIndexing: performIndexing,
    tools: tools,
    indexes: indexes,
    mappings: mappings
}
