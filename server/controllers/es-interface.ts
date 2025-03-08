export default ({ strapi }) => {
    
    const ESindexes = strapi.plugins['esplugin'].services.esInterface

    const getESIndexes = async (ctx) => {
        try {
           return await ESindexes.getIndexes()
       } catch (error) {
           ctx.throw(500, error)
       }
    }

    const deleteIndex = async (ctx) => {
        try {
            return await ESindexes.deleteIndex(ctx.params.indexName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    const cloneIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await ESindexes.cloneIndex(body.data.indexName, body.data.targetName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }
    
    const reindexIndex = async (ctx) => {
        const { body } = ctx.request
        try {
            return await ESindexes.reindexIndex(body.data.indexName, body.data.targetName)
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        getESIndexes,
        deleteIndex,
        cloneIndex,
        reindexIndex
    }
}