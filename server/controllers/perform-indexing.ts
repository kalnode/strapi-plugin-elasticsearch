'use strict'

export default ({ strapi }) => {
    const indexerService = strapi.plugins['esplugin'].services.performIndexing
    const scheduleIndexingService = strapi.plugins['esplugin'].services.scheduleIndexing

    const rebuildIndex = async (ctx) => {
        return await indexerService.rebuildIndex()
    }

    const indexCollection = async (ctx) => {
        if (ctx.params.collectionname)
            return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
        else
            return null
    }

    const triggerIndexingTask = async (ctx) => {
        return await indexerService.indexPendingData()
    }


    const indexRecordsNEW = async (ctx) => {
        const { body } = ctx.request
        try {
            const work = await indexerService.indexRecordsNEW(ctx.params.indexId)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    return {
        rebuildIndex,
        indexCollection,
        triggerIndexingTask,
        indexRecordsNEW
    }
}