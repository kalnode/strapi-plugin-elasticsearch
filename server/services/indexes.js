
module.exports = ({ strapi }) => ({

    async getIndexes(count = 50) {

        console.log('SPE - getIndexes 111')

       // return 'Dummy list indexes'
        const records = await strapi.entityService.findMany('plugin::elasticsearch.registered-index', {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count
        })
        return records
    },

    async getIndex(indexId) {
        console.log('SPE - getIndex 111', indexId)
        const record = await strapi.entityService.findOne('plugin::elasticsearch.registered-index', indexId)
        return record
    },

    async createIndex(indexName) {

        console.log('SPE - createIndex 111')

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

            console.log('SPE - createIndex 444 - Created new index with name:', entry)
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
            console.log('SPE - updateIndex 111 - indexId:', indexId)
            console.log('SPE - updateIndex 222', payload)
            //let work = await esInterface.createIndex(newIndexName)
            //JSON.stringify(body.data)

            let finalPayload = payload
           //let finalPayload = JSON.parse(JSON.stringify(payload))
            //finalPayload.mapping = JSON.stringify(finalPayload.payload)
            const entry = await strapi.entityService.update('plugin::elasticsearch.registered-index', indexId, {
                data: finalPayload
            })

            console.log('SPE - updateIndex 444 - Updated:', entry)
            return entry

        } catch(err) {
            console.log('SPE - updateIndex: An error was encountered')
            console.log(err)
            return err
        }

    },

    async deleteIndex(recordIndexNumber) {

        console.log('SPE - deleteIndex 111', recordIndexNumber)

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - deleteIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()



            //await esInterface.deleteIndex(index)

            const entry = await strapi.entityService.delete('plugin::elasticsearch.registered-index', recordIndexNumber)




            console.log('SPE - deleteIndex 333 - Created new index with name:', entry)
            return entry

        } catch(err) {
            console.log('SPE - deleteIndex: An error has encountered', err)
            console.log(err)
            return err
        }

    }


})