'use strict'

import { estypes } from '@elastic/elasticsearch'

export default ({ strapi }) => {
    
    const indexes = strapi.plugins['esplugin'].services.indexes
    const ESindexes = strapi.plugins['esplugin'].services.esInterface

    const deleteIndex = async (ctx) => {
        console.log("Controller ES deleteIndex 111", ctx.params.indexName)
        try {
            return await ESindexes.deleteIndex(ctx.params.indexName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    // const createIndex = async (ctx) => {
    //     const { body } = ctx.request
    //     try {
    //         return await indexes.createIndex(body.data.indexName, body.data.addToExternalIndex)
    //     } catch (error) {
    //         ctx.throw(500, error)
    //     }
    // }

    


    return {
        deleteIndex
    }
}