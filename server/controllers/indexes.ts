'use strict'

export default ({ strapi }) => {
    
    const indexes = strapi.plugins['elasticsearch'].services.indexes
    const ESindexes = strapi.plugins['elasticsearch'].services.esInterface
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

    const getIndexes = async () => {
        return await indexes.getIndexes()
    }

    const getESIndexes = async () => {
        console.log("getESIndexes 111")
        return await ESindexes.getIndexes()
    }

    const createIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            const work = await indexes.createIndex(body.data.indexName, body.data.addToExternalIndex)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
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
        const { body } = ctx.request
        try {
            const work = await indexes.deleteIndex(body.data.indexId, body.data.deleteIndexInElasticsearch)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const createESindex = async (ctx) => {
        const { body } = ctx.request
        try {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            const work = await indexes.createESindex(ctx.params.indexId)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    return {
        getIndex,
        getIndexes,
        getESIndexes,
        createIndex,
        deleteIndex,
        updateIndex,
        createESindex
    }
}