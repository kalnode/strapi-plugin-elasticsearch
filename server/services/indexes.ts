
export default ({ strapi }) => ({

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

    async createIndex(indexName, addToExternalIndex) {
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
                    active: true
                    //index_alias: 'myAlias',
                    //mapping: 'crazy mapping'
                }
            })


            // ADD TO ELASTICSEARCH:
            if (addToExternalIndex) {
                console.log("SPE - createIndex, addToExternalIndex", addToExternalIndex)
                let work = await esInterface.createIndex(indexName)
                console.log("SPE - createIndex, addToExternalIndex work: ", work)
            }

            return entry

        } catch(err) {
            console.log('SPE - createIndex: An error was encountered while creating the index.')
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

    async deleteIndex(recordIndexNumber, deleteIndexInElasticsearch) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface
        const indexesService = strapi.plugins['elasticsearch'].services.indexes
        console.log("SPE - deleteIndex, 111")
        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - deleteIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()

            //await esInterface.deleteIndex(index)
            console.log("SPE - deleteIndex, 222", recordIndexNumber)
            let work = await indexesService.getIndex(recordIndexNumber)

            // Delete mappings associated with this registered index
            if (work.mappings) {
                console.log("SPE - deleteIndex, 333")
                for (let i = 0; i < work.mappings.length; i++) {

                    // Ignore if mapping is a "preset" mapping
                    if (!work.mappings[i].preset) {
                        await strapi.entityService.delete('plugin::elasticsearch.mapping', work.mappings[i].id) 
                    }
                }
            }
            console.log("SPE - deleteIndex, 444")

            const entry = await strapi.entityService.delete('plugin::elasticsearch.registered-index', recordIndexNumber)
            console.log("SPE - deleteIndex, 444bbb", entry)

            // DELETE FROM ELASTICSEARCH:
            if (work && deleteIndexInElasticsearch) {
                console.log("SPE - deleteIndex, 555")
                console.log("SPE - deleteIndex, deleteIndexInElasticsearch", deleteIndexInElasticsearch)
                let work2 = await esInterface.deleteIndex(work.index_name)
                console.log("SPE - deleteIndex, deleteIndexInElasticsearch work: ", work2)
            }
            console.log("SPE - deleteIndex, 666")

            return entry

        } catch(err) {
            console.log('SPE - deleteIndex: An error has encountered', err)
            console.log(err)
            return err
        }

    },


    async createESindex(indexID) {
        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface
        const indexesService = strapi.plugins['elasticsearch'].services.indexes
        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - createIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            console.log('SPE - createESindex 111 - Created new index with name:', indexID)
            let index = await indexesService.getIndex(indexID)
            console.log('SPE - createESindex 222 - index:', index)
            if (index) {
                let workNewESIndex = await esInterface.createIndex(index.index_name)
                return workNewESIndex
            }

            return

        } catch(err) {
            console.log('SPE - createESindex: An error was encountered')
            console.log(err)
            return err
        }

    }


})