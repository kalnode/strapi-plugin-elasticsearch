
module.exports = ({ strapi }) => ({

    async createIndex() {

        console.log('SPE - createIndex 111')

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            const oldIndexName = await helper.getCurrentIndexName()
            console.log('SPE - createIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            const newIndexName = await helper.getIncrementedIndexName()
            console.log('SPE - createIndex 333 - Created new index with name:', newIndexName)
            let work = await esInterface.createIndex(newIndexName)
            console.log('SPE - createIndex 444 - Created new index with name:', work)
            return newIndexName

        } catch(err) {
            console.log('SPE - createIndex: An error was encountered while re-indexing.')
            console.log(err)
            return err
        }

    },

    async deleteIndex(index) {

        console.log('SPE - deleteIndex 111', index)

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - deleteIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            await esInterface.deleteIndex(index)
            //console.log('SPE - deleteIndex 333 - Created new index with name:', oldIndexName)
            return 'Success'

        } catch(err) {
            console.log('SPE - deleteIndex: An error has encountered', err)
            console.log(err)
            return err
        }

    }


})