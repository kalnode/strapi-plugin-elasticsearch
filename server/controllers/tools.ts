export default ({ strapi }) => {
    const helperService = strapi.plugins['esplugin'].services.helper

    const pluginSettings = async (ctx) => {
        try {
            return await helperService.getPluginSettings()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }
    
    const orphansFind = async (ctx) => {
        try {
            return await helperService.orphansFind()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const orphansDelete = async (ctx) => {
        try {
            return await helperService.orphansDelete()
        } catch (error) {
            ctx.throw(500, error)
        } 
    }

    const getContentTypes = async (ctx) => {
        try {
            return await helperService.getContentTypes()
        } catch (error) {
            ctx.throw(500, error)
        }
    }
    
    return {
        pluginSettings, orphansFind, orphansDelete, getContentTypes
    }
}