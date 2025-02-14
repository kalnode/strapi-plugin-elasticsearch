
export default ({ strapi }) => {

    const logIndexingService = strapi.plugins['esplugin'].services.logIndexing

    const fetchRecentRunsLog = async (ctx) => {
        return await logIndexingService.fetchIndexingLogs()
    }

    return {
        fetchRecentRunsLog
    }
}
