'use strict'

module.exports = ({ strapi }) => {
    
    const indexes = strapi.plugins['elasticsearch'].services.indexes

    const createIndex = async (ctx) => {
        return await indexes.createIndex()
    }

    const deleteIndex = async (ctx) => {
        return await indexes.deleteIndex(ctx.params.indexName)
    }

    return {
        createIndex,
        deleteIndex
    }
}