
export default ({ strapi }) => {

    const logIndexingService = strapi.plugins['esplugin'].services.logIndexing

    const fetchRecentRunsLog = async (ctx) => {
        try {
            return await logIndexingService.fetchIndexingLogs()
        } catch (error) {
            ctx.throw(500, error)
        }
    }

    return {
        fetchRecentRunsLog
    }
}
