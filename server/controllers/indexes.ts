'use strict'

export default ({ strapi }) => {
    
    const indexes = strapi.plugins['esplugin'].services.indexes
    const ESindexes = strapi.plugins['esplugin'].services.esInterface

    const getIndex = async (ctx) => {
        try {
            return await indexes.getIndex(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const getIndexes = async (ctx) => {
        try {
            return await indexes.getIndexes()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const getESIndexes = async (ctx) => {
         try {
            return await ESindexes.getIndexes()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const createIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await indexes.createIndex(body.data.indexName, body.data.addToExternalIndex)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const updateIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await indexes.updateIndex(ctx.params.indexUUID, body.data)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const toggleDynamicMappingOnIndex = async (ctx) => {
        try {
            return await indexes.toggleDynamicMappingOnIndex(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const deleteIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await indexes.deleteIndex(body.data.indexUUID, body.data.deleteIndexInElasticsearch)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const createESindex = async (ctx) => {
        try {
            return await indexes.createESindex(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const getESMapping = async (ctx) => {
        try {
            return await indexes.getESMapping(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const syncIndexWithExternal = async (ctx) => {
        try {
            return await indexes.syncIndexWithExternal(ctx.params.indexUUID)
        } catch (error) {
            ctx.throw(500, error)
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
        getESMapping,
        toggleDynamicMappingOnIndex,
        syncIndexWithExternal
    }
}