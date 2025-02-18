'use strict'

export default ({ strapi }) => {
    
    const mappings = strapi.plugins['esplugin'].services.mappings

    const getMapping = async (ctx) => {
        try {
            const work = await mappings.getMapping(ctx.params.mappingUUID)
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
        console.log("Controller updateMapping 343434", ctx.params.mappingUUID)
        const { body } = ctx.request
        try {
            const work = await mappings.updateMapping(ctx.params.mappingUUID, body.data)
            return work
        } catch (err) {
            //return null ???
            ctx.throw(500, err)
        }
    }



    const deleteMapping = async (ctx) => {
        if (ctx.params.mappingUUID) {
            return await mappings.deleteMapping(ctx.params.mappingUUID)
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