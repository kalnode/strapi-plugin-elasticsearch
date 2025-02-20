'use strict'

export default ({ strapi }) => {

    const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing

    const getContentConfig = async (ctx) => {
        return configureIndexingService.getContentConfig()
    }

    const setContentConfig = async (ctx) => {
        const { body } = ctx.request
        try {
            const updatedConfig = await configureIndexingService.setContentConfig({config: body})
            return updatedConfig
        } catch (err) {
            ctx.throw(500, err)
        }    
    }

    const exportContentConfig = async (ctx) => {
        return configureIndexingService.getContentConfig()
    }

    const importContentConfig = async (ctx) => {
        const { body } = ctx.request
        try {
            if (body['data']) {
                const updatedConfig = await configureIndexingService.importContentConfig({config: body['data']})
                return updatedConfig
            } else {
                ctx.throw(400, 'Invalid parameters')
            }
        } catch (err) {
            ctx.throw(500, err)
        }    
    }

    const getCollectionConfig = async (ctx) => {
        if (ctx.params.collectionname) {
            return configureIndexingService.getCollectionConfig({collectionName: ctx.params.collectionname})
        } else {
            return null
        }
    }

    const saveCollectionConfig = async (ctx) => {
        const { body } = ctx.request
        try {
            const updatedConfig = await configureIndexingService.setContentConfig({collection: ctx.params.collectionname, config: body.data})
            return updatedConfig
        } catch (err) {
            ctx.throw(500, err)
        }
    }

    return {
        getContentConfig,
        setContentConfig,
        exportContentConfig, 
        importContentConfig,
        getCollectionConfig,
        saveCollectionConfig
    }
}
