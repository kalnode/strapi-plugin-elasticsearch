
module.exports = ({ strapi }) => ({

    async getIndexes(count = 50) {
        const records = await strapi.entityService.findMany('plugin::elasticsearch.registered-index', {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count,
            populate: "mappings"
        })
        return records
    },

    async getIndex(indexId) {
        console.log('SPE - getIndex 111', indexId)
        const record = await strapi.entityService.findOne('plugin::elasticsearch.registered-index', indexId, {
            populate: "mappings"
        })
        return record
    },

    async createIndex(indexName) {
        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - createIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            console.log('SPE - createIndex 333 - Created new index with name:', indexName)


            //let work = await esInterface.createIndex(newIndexName)
            const entry = await strapi.entityService.create('plugin::elasticsearch.registered-index', {
                data : {
                    index_name: indexName,
                    //index_alias: 'myAlias',
                    //mapping: 'crazy mapping'
                }
            })

            return entry

        } catch(err) {
            console.log('SPE - createIndex: An error was encountered while re-indexing.')
            console.log(err)
            return err
        }

    },

    async updateIndex(indexId, payload) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - updateIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()

            //let work = await esInterface.createIndex(newIndexName)
            //JSON.stringify(body.data)

            let finalPayload = payload
           //let finalPayload = JSON.parse(JSON.stringify(payload))
            //finalPayload.mapping = JSON.stringify(finalPayload.payload)
            const entry = await strapi.entityService.update('plugin::elasticsearch.registered-index', indexId, {
                data: finalPayload
            })

            return entry

        } catch(err) {
            console.log('SPE - updateIndex: An error was encountered')
            console.log(err)
            return err
        }

    },

    async deleteIndex(recordIndexNumber) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface
        const indexes = strapi.plugins['elasticsearch'].services.indexes

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - deleteIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()

            //await esInterface.deleteIndex(index)

            let work = await indexes.getIndex(recordIndexNumber)

            // Delete mappings associated with this registered index
            if (work.mappings) {

                for (i = 0; i < work.mappings.length; i++) {

                    // Ignore if mapping is a "preset" mapping
                    if (!work.mappings[i].preset) {
                        await strapi.entityService.delete('plugin::elasticsearch.mapping', work.mappings[i].id) 
                    }
                }
            }

            const entry = await strapi.entityService.delete('plugin::elasticsearch.registered-index', recordIndexNumber)
            return entry

        } catch(err) {
            console.log('SPE - deleteIndex: An error has encountered', err)
            console.log(err)
            return err
        }

    }


})