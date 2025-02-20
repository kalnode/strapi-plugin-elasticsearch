'use strict'

export default ({ strapi }) => {
    
    const indexes = strapi.plugins['esplugin'].services.indexes
    const ESindexes = strapi.plugins['esplugin'].services.esInterface

    const getIndex = async (ctx) => {
        try {
            return await indexes.getIndex(ctx.params.indexUUID)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const getIndexes = async (ctx) => {
        try {
            return await indexes.getIndexes()
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const getESIndexes = async (ctx) => {
         try {
            return await ESindexes.getIndexes()
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const createIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await indexes.createIndex(body.data.indexName, body.data.addToExternalIndex)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const updateIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await indexes.updateIndex(ctx.params.indexUUID, body.data)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const deleteIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await indexes.deleteIndex(body.data.indexUUID, body.data.deleteIndexInElasticsearch)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const createESindex = async (ctx) => {
        try {
            return await indexes.createESindex(ctx.params.indexUUID)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const getESMapping = async (ctx) => {
        try {
            return await indexes.getESMapping(ctx.params.indexUUID)
        } catch (err) {
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
        createESindex,
        getESMapping
    }
}