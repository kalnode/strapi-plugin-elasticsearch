import pluginId from "../pluginId"

// GENERAL
export const apiGetSystemInfo = `/${pluginId}/setup-info`
export const apiGetContentConfig = `/${pluginId}/content-config/`

// SETTINGS
export const apiInstantIndexing = `/${pluginId}/instant-indexing`
export const apiToggleInstantIndexing = `/${pluginId}/toggle-instant-indexing`
export const apiIndexingEnabled = `/${pluginId}/indexing-enabled`
export const apiToggleIndexingEnabled = `/${pluginId}/toggle-indexing-enabled`


// EXPORT/IMPORT
export const apiExportContentConfig = `/${pluginId}/export-content-config/`
export const apiImportContentConfig = `/${pluginId}/import-content-config/`

// ORPHANS
export const apiOrphansFind = `/${pluginId}/orphans-find`
export const apiOrphansDelete = `/${pluginId}/orphans-delete`

// INDEXES
export const apiGetIndexes = `/${pluginId}/get-indexes`
//export const apiCreateIndex = `/${pluginId}/create-index`
export const apiCreateIndex = (indexName) => `/${pluginId}/create-index/${indexName}`
export const apiDeleteIndex = (recordIDNumber) => `/${pluginId}/delete-index/${recordIDNumber}`

// MAPPING

export const apiGetMappings = `/${pluginId}/get-mappings`
export const apiCreateMapping = `/${pluginId}/create-mapping`
export const apiDeleteMapping = (mappingIDNumber) => `/${pluginId}/delete-mapping/${mappingIDNumber}`

export const apiGetCollectionConfig = (collectionName) => `/${pluginId}/collection-config/${collectionName}`
export const apiSaveCollectionConfig = (collectionName) => `/${pluginId}/collection-config/${collectionName}`

// INDEXING
export const apiRequestCollectionIndexing = (collectionName) => `/${pluginId}/collection-reindex/${collectionName}`
export const apiForceRebuildIndex = `/${pluginId}/reindex`
export const apiTriggerIndexing = `/${pluginId}/trigger-indexing/`

// LOGS
export const apiFetchRecentIndexingRunLog = `/${pluginId}/indexing-run-log`