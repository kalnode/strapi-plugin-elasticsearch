
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