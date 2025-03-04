import indexes from "./indexes"
import mappings from "./mappings"
import configureIndexingRoutes from "./configure-indexing"
import performSearch from "./perform-search"
import runLog from "./run-log"
import setupInfo from "./setup-info"
import esInterface from "./es-interface"
import performIndexing from "./perform-indexing"
import tools from "./tools"


export default {
    indexes: indexes,
    mappings: mappings,
    esInterface: esInterface,
    config: configureIndexingRoutes,
    search: performSearch,
    runLog: runLog,
    setupInfo: setupInfo,
    performIndexing: performIndexing,
    tools: tools
}
