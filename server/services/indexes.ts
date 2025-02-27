import { v4 as uuidv4 } from 'uuid'
import { RegisteredIndex } from "../../types"

export default ({ strapi }) => ({

    async getIndex(indexUUID:string) {
        // -------------------------------------------
        const helperGetPluginStore = () => {
            return strapi.store({
                environment: '',
                type: 'plugin',
                name: 'esplugin'
            })
        }
        const pluginStore = helperGetPluginStore()         
        const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
        if (indexes && Array.isArray(indexes)) {
            let work = indexes.find( (x:RegisteredIndex) => x.uuid === indexUUID)
            if (work) {
                return work
            }
        }
        return "No index found"
        // -------------------------------------------

        // DB PARADIGM
        // return await strapi.entityService.findOne('plugin::esplugin.registered-index', indexUUID, {
        //     populate: "mappings"
        // })

    },

    async getIndexes() {

        // -------------------------------------------
        const helperGetPluginStore = () => {
            return strapi.store({
                environment: '',
                type: 'plugin',
                name: 'esplugin'
            })
        }
        const pluginStore = helperGetPluginStore()         
        const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
        if (indexes) {
            return indexes
        } else {
            return "No indexes found"
        }
        // -------------------------------------------

        // DB paradigm
        // const records = await strapi.entityService.findMany('plugin::esplugin.registered-index', {
        //     sort: { createdAt: 'DESC' },
        //     start: 0,
        //     limit: count,
        //     populate: "mappings"
        // })
        // return records
    },

    async createIndex(indexName:string, addToExternalIndex:boolean) {

        const esInterface = strapi.plugins['esplugin'].services.esInterface

        try {

            // TODO: Look at legacy name incrementing and whether it's still useful
            //const oldIndexName = await helper.getCurrentIndexName()
            //const newIndexName = await helper.getIncrementedIndexName()

            const finalPayload:RegisteredIndex = {
                uuid: uuidv4(),
                index_name: indexName,
                active: true,
                mappings: []
            }

            // ------------------------------------------
            // ADD TO PLUGIN STORE
            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()         
            let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (!indexes) {
                indexes = []
            }

            indexes.push(finalPayload)

            await pluginStore.set({ key: 'indexes', value: indexes })
            // -------------------------------------------

            // DB paradigm
            // const entry = await strapi.entityService.create('plugin::esplugin.registered-index', {
            //     data: {
            //         uuid: uuidv4(),
            //         index_name: indexName,
            //         active: true
            //         //index_alias: 'myAlias',
            //         //mapping: 'crazy mapping'
            //     }
            // })


            // ADD TO ELASTICSEARCH:
            if (addToExternalIndex) {
                await esInterface.createIndex(indexName)
            }

            return finalPayload

        } catch(err) {
            console.log('SPE - createIndex: An error was encountered while creating the index.')
            console.log(err)
            return err
        }

    },

    async updateIndex(indexUUID:string, payload:RegisteredIndex) {

        try {

            // -------------------------------------------
            // UPDATE THE PLUGIN STORE
            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()         
            let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (indexes && Array.isArray(indexes)) {
                let foundIndex = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)
                if (foundIndex >= 0) {
                    indexes[foundIndex] = { ...indexes[foundIndex], ...payload}
                }
            } else {
                console.log("Cannot find index to update")
            }

            await pluginStore.set({ key: 'indexes', value: indexes })
            // -------------------------------------------

            // DB paradigm
            // const entry = await strapi.entityService.update('plugin::esplugin.registered-index', indexUUID, {
            //     data: payload
            // })

            return payload

        } catch(err) {
            console.log('SPE - updateIndex: An error was encountered')
            console.log(err)
            return err
        }

    },

    async deleteIndex(indexUUID:string, deleteIndexInElasticsearch:boolean) {

        const esInterface = strapi.plugins['esplugin'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - deleteIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()

            //await esInterface.deleteIndex(index)

            //let work = await indexesService.getIndex(indexUUID)

            // Delete mappings associated with this registered index
            // if (work.mappings) {
            //     console.log("SPE - deleteIndex, 333")
            //     for (let i = 0; i < work.mappings.length; i++) {

            //         // Ignore if mapping is a "preset" mapping
            //         if (!work.mappings[i].preset) {
            //             await strapi.entityService.delete('plugin::esplugin.mapping', work.mappings[i].uuid) 
            //         }
            //     }
            // }


            // -------------------------------------------
            // UPDATE THE PLUGIN STORE
            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()         
            let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
            if (indexes && Array.isArray(indexes)) {
                let foundIndexNumber = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)

                if (foundIndexNumber >= 0) {
                    // DELETE FROM ELASTICSEARCH:
                    if (indexes[foundIndexNumber] && deleteIndexInElasticsearch) {
                        await esInterface.deleteIndex(indexes[foundIndexNumber].index_name)
                    }

                    indexes.splice(foundIndexNumber, 1)
                }
            }
            if (indexes.length === 0) {
                indexes = []
            }
            await pluginStore.set({ key: 'indexes', value: indexes.length ? indexes : null })
            // -------------------------------------------

            // DB paradigm
            // const entry = await strapi.entityService.delete('plugin::esplugin.registered-index', indexUUID)

            
            // if (work && deleteIndexInElasticsearch) {
            //     console.log("SPE - deleteIndex, 555")
            //     console.log("SPE - deleteIndex, deleteIndexInElasticsearch", deleteIndexInElasticsearch)
            //     let work2 = await esInterface.deleteIndex(work.index_name)
            //     console.log("SPE - deleteIndex, deleteIndexInElasticsearch work: ", work2)
            // }
            // console.log("SPE - deleteIndex, 666")

            return "Done"

        } catch(err) {
            console.log('SPE - deleteIndex: An error has encountered', err)
            console.log(err)
            return err
        }

    },


    async createESindex(indexUUID:string) {
        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const indexesService = strapi.plugins['esplugin'].services.indexes
        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - createIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            let index = await indexesService.getIndex(indexUUID)
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

    },


    async getESMapping(indexUUID:string) {
        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const indexesService = strapi.plugins['esplugin'].services.indexes
        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - createIndex 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            let index = await indexesService.getIndex(indexUUID)
            if (index) {
                let work = await esInterface.getMapping(index.index_name)
                //if (work) {
                    return work
                //}
            }

            return 'No index found'

        } catch(err) {
            console.log('SPE - getESMapping: An error was encountered')
            console.log(err)
            return err
        }

    }


})