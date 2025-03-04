export default ({ strapi }) => {
    const indexerService = strapi.plugins['esplugin'].services.performIndexing
    const scheduleIndexingService = strapi.plugins['esplugin'].services.scheduleIndexing

    const rebuildIndex = async (ctx) => {
        try {
            return await indexerService.rebuildIndex()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const indexCollection = async (ctx) => {
        try {
            return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const triggerIndexingTask = async (ctx) => {
        try {
            return await indexerService.indexPendingData()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const indexRecordsNEW = async (ctx) => {
        try {
            return await indexerService.indexRecordsNEW(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        rebuildIndex,
        indexCollection,
        triggerIndexingTask,
        indexRecordsNEW
    }
}