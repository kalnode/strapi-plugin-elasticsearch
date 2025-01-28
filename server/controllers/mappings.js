'use strict'

module.exports = ({ strapi }) => {
    
    const mappings = strapi.plugins['elasticsearch'].services.mappings

    const getMappings = async (ctx) => {
        return await mappings.getMappings()
    }

    const getContentTypes = async (ctx) => {
        return await mappings.getContentTypes()
    }

    const createMapping = async (ctx) => {
        console.log("Controller createMapping 343434", ctx)
        const { body } = ctx.request
        try {
            const work = await mappings.createMapping(body.data)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const deleteMapping = async (ctx) => {
        console.log("Controller deleteMapping 343434", ctx)
        if (ctx.params.mappingIndexNumber) {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            return await mappings.deleteMapping(ctx.params.mappingIndexNumber)
        } else {
            return null
        }
    }

    return {
        getMappings,
        getContentTypes,
        createMapping,
        deleteMapping
    }
}