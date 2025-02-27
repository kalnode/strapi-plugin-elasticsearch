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
            return await mappings.getMappings(ctx.params.indexUUID)
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

    const updateMappings = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.updateMappings(body.data)
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    const detachMapping = async (ctx) => {
        const { body } = ctx.request
        try {
            return await mappings.detachMapping(body.data.indexUUID, body.data.mappingUUID)
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
        updateMappings,
        deleteMapping,
        detachMapping
    }
}