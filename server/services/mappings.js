
module.exports = ({ strapi }) => ({

    async getMappings(count = 50) {

        console.log('SPE - getMappings 111')

        const records = await strapi.entityService.findMany('plugin::elasticsearch.mapping', {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count
        })
        return records
    },

    async createMapping(mapping) {

        console.log('SPE - createMapping 111', mapping)

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - createMapping 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            console.log('SPE - createMapping 333 - Created new index with name:', mapping)


            //let work = await esInterface.createIndex(newIndexName)
            const entry = await strapi.entityService.create('plugin::elasticsearch.mapping', {
                data : {
                    ...mapping
                    //index_alias: 'myAlias',
                    //mapping: 'crazy mapping'
                }
            })

            console.log('SPE - createMapping 444 - Created new mapping:', entry)
            return entry

        } catch(err) {
            console.log('SPE - createMapping: An error was encountered')
            console.log(err)
            return err
        }

    },

    async deleteMapping(mappingIndexNumber) {

        console.log('SPE - deleteMapping 111', mappingIndexNumber)

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //await esInterface.deleteIndex(index)

            const entry = await strapi.entityService.delete('plugin::elasticsearch.mapping', mappingIndexNumber)




            console.log('SPE - deleteMapping 333', entry)
            return entry

        } catch(err) {
            console.log('SPE - deleteMapping: An error has encountered', err)
            console.log(err)
            return err
        }

    }


})