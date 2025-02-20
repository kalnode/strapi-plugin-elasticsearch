import pluginId from "../pluginId"

// GENERAL
export const apiGetSystemInfo = `/${pluginId}/setup-info`
export const apiGetContentConfig = `/${pluginId}/content-config`

// SETTINGS
export const apiInstantIndexing = `/${pluginId}/instant-indexing`
export const apiToggleInstantIndexing = `/${pluginId}/toggle-instant-indexing`
export const apiIndexingEnabled = `/${pluginId}/indexing-enabled`
export const apiToggleIndexingEnabled = `/${pluginId}/toggle-indexing-enabled`
export const apiToggleUseNewPluginParadigmEnabled = `/${pluginId}/toggle-usenewpluginparadigm-enabled`

// EXPORT/IMPORT
export const apiExportContentConfig = `/${pluginId}/export-content-config`
export const apiImportContentConfig = `/${pluginId}/import-content-config`

// ORPHANS
export const apiOrphansFind = `/${pluginId}/orphans-find`
export const apiOrphansDelete = `/${pluginId}/orphans-delete`

// INDEXES
export const apiGetIndexes = `/${pluginId}/get-indexes`
export const apiGetESIndexes = `/${pluginId}/get-es-indexes`
export const apiGetIndex = (indexUUID) => `/${pluginId}/get-index/${indexUUID}`
export const apiCreateIndex = `/${pluginId}/create-index`
export const apiDeleteIndex = `/${pluginId}/delete-index`
export const apiUpdateIndex = (indexUUID) => `/${pluginId}/update-index/${indexUUID}`
export const apiCreateESindex = (indexUUID) => `/${pluginId}/create-es-index/${indexUUID}`
export const apiIndexRecords = (indexUUID) => `/${pluginId}/index-records/${indexUUID}`

// MAPPING
export const apiGetMapping = (mappingUUID) => `/${pluginId}/get-mapping/${mappingUUID}`
export const apiGetMappings = (indexUUID) => indexUUID ? `/${pluginId}/get-mappings/${indexUUID}` : `/${pluginId}/get-mappings`
export const apiCreateMapping = `/${pluginId}/create-mapping`
export const apiUpdateMapping = (mappingUUID) => `/${pluginId}/update-mapping/${mappingUUID}`
export const apiDeleteMapping = (mappingUUID) => `/${pluginId}/delete-mapping/${mappingUUID}`
export const apiDetachMappingFromIndex = `/${pluginId}/detach-mapping`
export const apiGetESMapping = (indexUUID) => `/${pluginId}/get-es-mapping/${indexUUID}`
export const apiGetContentTypes = `/${pluginId}/get-content-types`




export const apiGetCollectionConfig = (collectionName) => `/${pluginId}/collection-config/${collectionName}`
export const apiSaveCollectionConfig = (collectionName) => `/${pluginId}/collection-config/${collectionName}`

// INDEXING
export const apiRequestCollectionIndexing = (collectionName) => `/${pluginId}/collection-reindex/${collectionName}`
export const apiForceRebuildIndex = `/${pluginId}/reindex`
export const apiTriggerIndexing = `/${pluginId}/trigger-indexing`

// LOGS
export const apiFetchRecentIndexingRunLog = `/${pluginId}/indexing-run-log`