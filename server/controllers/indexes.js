'use strict'

module.exports = ({ strapi }) => {
    
    const indexes = strapi.plugins['elasticsearch'].services.indexes

    const getIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            const work = await indexes.getIndex(ctx.params.indexId)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const getIndexes = async (ctx) => {
        return await indexes.getIndexes()
    }

    const createIndex = async (ctx) => {
        if (ctx.params.indexName) {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            return await indexes.createIndex(ctx.params.indexName)
        } else {
            return null
        }
    }

    const updateIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            const work = await indexes.updateIndex(ctx.params.indexId, body.data)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const deleteIndex = async (ctx) => {
        if (ctx.params.recordIndexNumber) {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            return await indexes.deleteIndex(ctx.params.recordIndexNumber)
        } else {
            return null
        }
    }

    return {
        getIndex,
        getIndexes,
        createIndex,
        deleteIndex,
        updateIndex
    }
}