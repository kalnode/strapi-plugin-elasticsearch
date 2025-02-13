'use strict'

export default ({ strapi }) => {
    const helperService = strapi.plugins['elasticsearch'].services.helper

    const getElasticsearchInfo = async (ctx) => {
        return helperService.getElasticsearchInfo()
    }

    const setPluginConfig = async (ctx) => {
        const { body } = ctx.request
        try {
            const updatedConfig = await helperService.storeToggleSettingInstantIndex() //({config : body})
            return updatedConfig
        } catch (err) {
            ctx.throw(500, err)
        }    
    }
    
    const getPluginConfig = async (ctx) => {
        try {
            const pluginConfig = await helperService.storeSettingInstantIndex()
            return pluginConfig
        } catch (err) {
            ctx.throw(500, err)
        } 
    }

    const toggleIndexingEnabled = async (ctx) => {
        const { body } = ctx.request
        try {
            const updatedConfig = await helperService.storeSettingToggleInstantIndexing() //({config : body})
            return updatedConfig
        } catch (err) {
            ctx.throw(500, err)
        }    
    }
    
    const getIndexingEnabled = async (ctx) => {
        try {
            const pluginConfig = await helperService.storeSettingIndexingEnabled()
            return pluginConfig
        } catch (err) {
            ctx.throw(500, err)
        } 
    }
    

    return {
        getElasticsearchInfo, setPluginConfig, getPluginConfig, toggleIndexingEnabled, getIndexingEnabled
    }
}