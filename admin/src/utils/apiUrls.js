import { collectionName } from "../../../server/content-types/tasks"
import pluginId from "../pluginId"
export const apiGetContentConfig = `/${pluginId}/content-config/`
export const apiGetCollectionConfig = (collectionName) => `/${pluginId}/collection-config/${collectionName}`
export const apiSaveCollectionConfig = (collectionName) => `/${pluginId}/collection-config/${collectionName}`
export const apiGetElasticsearchSetupInfo = `/${pluginId}/setup-info`
export const apiFetchRecentIndexingRunLog = `/${pluginId}/indexing-run-log`
export const apiRequestReIndexing = `/${pluginId}/reindex`
export const apiRequestCollectionIndexing = (collectionName) => `/${pluginId}/collection-reindex/${collectionName}`
export const apiTriggerIndexing = `/${pluginId}/trigger-indexing/`
export const apiInstantIndexing = `/${pluginId}/instant-indexing`
export const apiToggleInstantIndexing = `/${pluginId}/toggle-instant-indexing`
export const apiIndexingEnabled = `/${pluginId}/indexing-enabled`
export const apiToggleIndexingEnabled = `/${pluginId}/toggle-indexing-enabled`

export const apiExportContentConfig = `/${pluginId}/export-content-config/`
export const apiImportContentConfig = `/${pluginId}/import-content-config/`

