'use strict'

export default ({ strapi }) => {
    const helperService = strapi.plugins['esplugin'].services.helper
    
    const orphansFind = async (ctx) => {
        try {
            const work = await helperService.orphansFind()
            return work
        } catch (err) {
            ctx.throw(500, err)
        } 
    }

    const orphansDelete = async (ctx) => {
        try {
            const work = await helperService.orphansDelete()
            return work
        } catch (err) {
            ctx.throw(500, err)
        } 
    }
    
    return {
        orphansFind, orphansDelete
    }
}