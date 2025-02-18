'use strict'

export default ({ strapi }) => {
    
    const mappings = strapi.plugins['esplugin'].services.mappings

    const getMapping = async (ctx) => {
        try {
            return await mappings.getMapping(ctx.params.mappingUUID)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const getMappings = async (ctx) => {
        try {
            return await mappings.getMappings()
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const getContentTypes = async (ctx) => {
        try {
            return await mappings.getContentTypes()
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const createMapping = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.createMapping(body.data)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const updateMapping = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.updateMapping(body.data)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const deleteMapping = async (ctx) => {
        try {
            return await mappings.deleteMapping(ctx.params.mappingUUID)
        } catch (err) {
            ctx.throw(500, err)
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