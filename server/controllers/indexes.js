'use strict'

module.exports = ({ strapi }) => {
    
    const indexes = strapi.plugins['elasticsearch'].services.indexes

    const getIndexes = async (ctx) => {
        return await indexes.getIndexes()
    }

    const createIndex = async (ctx) => {
        console.log("Controller deleteIndex 343434", ctx)
        if (ctx.params.indexName) {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            return await indexes.createIndex(ctx.params.indexName)
        } else {
            return null
        }
    }

    const deleteIndex = async (ctx) => {
        console.log("Controller deleteIndex 343434", ctx)
        if (ctx.params.recordIndexNumber) {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            return await indexes.deleteIndex(ctx.params.recordIndexNumber)
        } else {
            return null
        }
    }

    return {
        getIndexes,
        createIndex,
        deleteIndex
    }
}