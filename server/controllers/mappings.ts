'use strict'

export default ({ strapi }) => {
    
    const mappings = strapi.plugins['elasticsearch'].services.mappings

    const getMapping = async (ctx) => {
        try {
            const work = await mappings.getMapping(ctx.params.mappingId)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const getMappings = async (ctx) => {
        try {
            const work = await mappings.getMappings(ctx.params.indexId)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const getContentTypes = async (ctx) => {
        return await mappings.getContentTypes()
    }

    const createMapping = async (ctx) => {
        //console.log("Controller createMapping 343434", ctx)
        const { body } = ctx.request
        try {
            const work = await mappings.createMapping(body.data)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }

    const updateMapping = async (ctx) => {
        console.log("Controller updateMapping 343434", ctx.params.mappingId)
        const { body } = ctx.request
        try {
            const work = await mappings.updateMapping(ctx.params.mappingId, body.data)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }



    const deleteMapping = async (ctx) => {
        //console.log("Controller deleteMapping 343434", ctx)
        if (ctx.params.mappingIndexNumber) {
            //return await scheduleIndexingService.addCollectionToIndex({collectionUid: ctx.params.collectionname})
            return await mappings.deleteMapping(ctx.params.mappingIndexNumber)
        } else {
            return null
        }
    }

    return {
        getMapping,
        getMappings,
        getContentTypes,
        createMapping,
        updateMapping,
        deleteMapping
    }
}