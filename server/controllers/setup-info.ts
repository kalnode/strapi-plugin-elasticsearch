export default ({ strapi }) => {
    const helperService = strapi.plugins['esplugin'].services.helper

    const getElasticsearchInfo = async (ctx) => {
        return helperService.getElasticsearchInfo()
    }

    const setPluginConfig = async (ctx) => {
        const { body } = ctx.request
        try {
            const updatedConfig = await helperService.storeToggleSettingInstantIndex() //({config: body})
            return updatedConfig
        } catch (error) {
            ctx.throw(500, error)
        }    
    }
    
    const getPluginConfig = async (ctx) => {
        try {
            const pluginConfig = await helperService.storeSettingInstantIndex()
            return pluginConfig
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const toggleIndexingEnabled = async (ctx) => {
        const { body } = ctx.request
        try {
            const updatedConfig = await helperService.storeSettingToggleInstantIndexing() //({config: body})
            return updatedConfig
        } catch (error) {
            ctx.throw(500, error)
        }    
    }

    const toggleUseNewPluginParadigm = async (ctx) => {
        try {
            return await helperService.storeSettingToggleUseNewPluginParadigm()
        } catch (error) {
            ctx.throw(500, error)
        }    
    }
    
    const getIndexingEnabled = async (ctx) => {
        try {
            const pluginConfig = await helperService.storeSettingIndexingEnabled()
            return pluginConfig
        } catch (error) {
            ctx.throw(500, error)
        } 
    }
    

    return {
        getElasticsearchInfo,
        setPluginConfig,
        getPluginConfig,
        toggleIndexingEnabled,
        getIndexingEnabled,
        toggleUseNewPluginParadigm
    }
}