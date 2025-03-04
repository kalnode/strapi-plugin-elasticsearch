import qs from "qs"

export default ({ strapi }) => ({
    search: async (ctx) => {
        try {
            const esInterface = strapi.plugins['esplugin'].services.esInterface
            if (ctx.query.query) {
                const query = qs.parse(ctx.query.query)
                const resp = await esInterface.searchData(query)
                if (resp?.hits?.hits) {
                    const filteredData = resp.hits.hits.filter(dt => dt._source !== null)
                    const filteredMatches = filteredData.map((dt) => dt['_source'])
                    ctx.body = filteredMatches
                } else {
                    ctx.body = {}
                }
            } else {
                ctx.body = {}
            }
        } catch (error) {
            console.error('An error was encountered while processing the search request.', error)
            ctx.throw(500, error)
        }
    }
})
