export default ({ strapi }) => ({

    async addFullSiteIndexingTask () {
        return await strapi.entityService.create('plugin::esplugin.task', {
            data: {
                collection_name: '',
                indexing_status: 'to-be-done',
                full_site_indexing: true,
                indexing_type: "add-to-index" 
            }
        })
    },

    async addCollectionToIndex(params: { collectionUid:string, indexName?:string }) {
        return await strapi.entityService.create('plugin::esplugin.task', {
            data: {
                index_name: params.indexName,
                collection_name: params.collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "add-to-index" 
            }
        })
    },

    async addOrUpdateItemToIndex(params: { collectionUid:string, recordId:string, indexName?:string }) {
        console.log("addOrUpdateItemToIndex 111", params)
        return await strapi.entityService.create('plugin::esplugin.task', {
            data: {
                index_name: params.indexName,
                item_id: params.recordId, 
                collection_name: params.collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "add-to-index" 
            }
        })
    },

    async removeItemFromIndex(params: { collectionUid:string, recordId:string, indexName?:string }) {
        return await strapi.entityService.create('plugin::esplugin.task', {
            data: {
                index_name: params.indexName,
                item_id: params.recordId, 
                collection_name: params.collectionUid,
                indexing_status: 'to-be-done',
                full_site_indexing: false,
                indexing_type: "remove-from-index"
            }
        })
    },

    async getItemsPendingToBeIndexed() {
        return await strapi.entityService.findMany('plugin::esplugin.task', {
            filters: { indexing_status: 'to-be-done'}
        })
    },

    async markIndexingTaskComplete(taskId) {
        return await strapi.entityService.update('plugin::esplugin.task', taskId, {
            data: { 'indexing_status': 'done' }
        })
    }

})