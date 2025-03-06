import { v4 as uuidv4 } from 'uuid'
import { RegisteredIndex, Mapping, MappingField } from "../../types"
import { removeUndefineds, convertMappingsToESMappings } from "../../scripts"

export default ({ strapi }) => ({

    async getIndex(indexUUID:string) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()
            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (indexes && Array.isArray(indexes)) {
                let work = indexes.find( (x:RegisteredIndex) => x.uuid === indexUUID)
                if (work) {
                    return work
                } else {
                    throw "No index found"
                }
            }

            // --------------------------
            // EARLY DEV: DB PARADIGM
            // return await strapi.entityService.findOne('plugin::esplugin.registered-index', indexUUID, {
            //     populate: "mappings"
            // })
            // --------------------------

        } catch(error) {
            console.error('SERVICE indexes getIndex - error:', error)
            throw error
        }

    },

    async getIndexes() {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()
            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
            if (indexes) {
                return indexes
            } else {
                throw "No indexes found"
            }

            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const records = await strapi.entityService.findMany('plugin::esplugin.registered-index', {
            //     sort: { createdAt: 'DESC' },
            //     start: 0,
            //     limit: count,
            //     populate: "mappings"
            // })
            // return records
            // --------------------------

        } catch(error) {
            console.error('SERVICE indexes getIndexes - error:', error)
            throw error
        }

    },

    async createIndex(indexName:string, addToExternalIndex:boolean) {

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

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()
            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (!indexes) {
                indexes = []
            }

            indexes.push(finalPayload)

            await pluginStore.set({ key: 'indexes', value: indexes })

            // ADD TO ELASTICSEARCH
            if (addToExternalIndex) {
                const esInterface = strapi.plugins['esplugin'].services.esInterface
                await esInterface.createIndex(indexName)
            }

            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const entry = await strapi.entityService.create('plugin::esplugin.registered-index', {
            //     data: {
            //         uuid: uuidv4(),
            //         index_name: indexName,
            //         active: true
            //         //index_alias: 'myAlias',
            //         //mapping: 'crazy mapping'
            //     }
            // })
            // --------------------------

            return finalPayload

        } catch(error) {
            console.error('SERVICE indexes createIndex - error:', error)
            throw error
        }

    },

    // async toggleDynamicMappingOnIndex(indexUUID:string) {

    //     try {

    //         const helperGetPluginStore = () => {
    //             return strapi.store({
    //                 environment: '',
    //                 type: 'plugin',
    //                 name: 'esplugin'
    //             })
    //         }
    //         const pluginStore = helperGetPluginStore()
    //         // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
    //         let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
    //         console.log("Hello toggleDynamicMappingOnIndex oh 111????")
    //         if (indexes && Array.isArray(indexes)) {
    //             let foundIndexNumber:number = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)
    //             console.log("Hello toggleDynamicMappingOnIndex oh 222????")
    //             if (foundIndexNumber >= 0) {
    //                 indexes[foundIndexNumber].mapping_type = !indexes[foundIndexNumber].mapping_type
    //                 await pluginStore.set({ key: 'indexes', value: indexes })
    //                 console.log("Hello toggleDynamicMappingOnIndex oh 333????")
    //                 console.log("Hello toggleDynamicMappingOnIndex oh 444????")
    //                 const esInterface = strapi.plugins['esplugin'].services.esInterface
    //                 await esInterface.toggleDynamicMapping(indexes[foundIndexNumber].index_name)
    //                 console.log("Hello toggleDynamicMappingOnIndex oh 555????")
    //             }
    //         } else {
    //             throw "No index found"
    //         }

    //     } catch(error) {
    //         console.error('SERVICE indexes toggleDynamicMappingOnIndex - error:', error)
    //         throw error
    //     }

    // },
    

    async updateIndex(indexUUID:string, payload:RegisteredIndex) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()
            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
            let foundIndexNumber:number = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)

            if (foundIndexNumber >= 0 && indexes[foundIndexNumber] != payload) {
                indexes[foundIndexNumber] = { ...indexes[foundIndexNumber], ...payload }
                await pluginStore.set({ key: 'indexes', value: indexes })
                return indexes[foundIndexNumber]
            } else {
                throw "No index found"
            }
            
            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const entry = await strapi.entityService.update('plugin::esplugin.registered-index', indexUUID, {
            //     data: payload
            // })
            // --------------------------

        } catch(error) {
            console.error('SERVICE indexes updateIndex - error:', error)
            throw error
        }

    },

    async syncMappingsWithExternal() {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()
            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            const mappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })
            const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
    
            if (mappings && indexes) {
                mappings.forEach( (x:Mapping) => {
                    const matchedIndexes:Array<RegisteredIndex> = indexes.filter( (y:RegisteredIndex) => y.mappings && x.uuid && y.mappings.includes(x.uuid))
                    matchedIndexes.forEach( async (x:RegisteredIndex) => {
                        const indexesService = strapi.plugins['esplugin'].services.indexes
                        await indexesService.syncIndexWithExternal(x.uuid)
                    })
                })
            }

        } catch(error) {
            console.error('SERVICE indexes syncMappingsWithExternal - error:', error)
            throw error
        }

    },


    async syncIndexWithExternal(indexUUID:string) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()

            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            const indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            const index = indexes.find( (x:RegisteredIndex) => x.uuid === indexUUID)
    
            if (index) {

                // 1. Check overall settings
                // 2. Check mappings

                const esInterface = strapi.plugins['esplugin'].services.esInterface
                // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
                let mappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })
                //const externalMappings = await esInterface.getMapping(index.index_name)
                let mappingFieldsFinal:MappingField = {}

                if (mappings) {
                    mappings = mappings.filter( (x:Mapping) => x.uuid && index.mappings && index.mappings.includes(x.uuid))
                    
                    mappingFieldsFinal = convertMappingsToESMappings(mappings)
                }
                
                // REMOVED UNDEFINED PROPERTIES
                // TODO: This step seems silly; perhaps we can simply not create the item if it has no type.
                // TODO: This is not recursive for nested properties; look into it.
                removeUndefineds(mappingFieldsFinal)
                //Object.keys(mappingFieldsFinal).forEach(key => mappingFieldsFinal[key] === undefined && delete mappingFieldsFinal[key])

                // "properties": {
                //     "pin": {
                //         type: "geo_point",
                //         index: true
                //     },
                //     "Participants": {
                //         type: "nested"
                //     },
                //     "Organizers": {
                //         type: "nested"
                //     },
                //     "child_terms": {
                //         type: "nested"
                //     },                            
                //     // "uuid": {
                //     //     type: "string",
                //     //     index: "not_analyzed"
                //     // }
                // }

                // "mappings": {
                //     "dynamic": false, 
                //     "properties": {
                //       "user": { 
                //         "properties": {
                //           "name": {
                //             "type": "text"
                //           },
                //           "social_networks": {
                //             "dynamic": true, 
                //             "properties": {}
                //           }
                //         }
                //       }
                //     }
                //   }

                // TODO: Apply ES typing here
                let finalPayload:any = {}

                // TODO: Add enum typing here?
                if (index.mapping_type != undefined) {
                    finalPayload.dynamic = index.mapping_type // ? 'true' : 'runtime'
                }

                if (mappingFieldsFinal && Object.keys(mappingFieldsFinal).length > 0) {
                    finalPayload.properties = mappingFieldsFinal
                }

                await esInterface.updateMapping({indexName: index.index_name, mapping: finalPayload})

                return "Success - Index syncd with external ES"

                
            }

        } catch(error) {
            console.error('SERVICE indexes syncIndexWithExternal - error:', error)
            throw error
        }

    },

    async deleteIndex(indexUUID:string, deleteIndexInElasticsearch:boolean) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()
            
            // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
            let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })

            if (indexes && Array.isArray(indexes)) {
                let foundIndexNumber:number = indexes.findIndex( (x:RegisteredIndex) => x.uuid === indexUUID)

                if (foundIndexNumber >= 0) {

                    indexes.splice(foundIndexNumber, 1)

                    // DELETE FROM ELASTICSEARCH
                    if (indexes[foundIndexNumber] && deleteIndexInElasticsearch) {
                        const esInterface = strapi.plugins['esplugin'].services.esInterface
                        await esInterface.deleteIndex(indexes[foundIndexNumber].index_name)
                    }

                }
            }
            if (indexes.length === 0) {
                indexes = []
            }
            await pluginStore.set({ key: 'indexes', value: indexes.length ? indexes : null })

            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const entry = await strapi.entityService.delete('plugin::esplugin.registered-index', indexUUID)
            // --------------------------

            return "Success - Index deleted"

        } catch(error) {
            console.error('SERVICE indexes deleteIndex - error:', error)
            throw error
        }

    },

    async createESindex(indexUUID:string) {

        try {

            const esInterface = strapi.plugins['esplugin'].services.esInterface
            const indexesService = strapi.plugins['esplugin'].services.indexes

            let index = await indexesService.getIndex(indexUUID)
            if (index) {

                try {
                    await esInterface.createIndex(index.index_name)
                } catch(error) {
                    throw error
                }

                try {
                    await this.syncIndexWithExternal(indexUUID)
                } catch(error) {
                    return "Success - Created ES index, however no mappings were applied since they're empty."
                }

                return "Success - Created ES index and sync'd"

            } else {
                throw "No registered index found"
            }

        } catch(error) {
            console.error('SERVICE indexes createESindex - error:', error)
            throw error
        }

    },

    async getESMapping(indexUUID:string) {

        try {
            const esInterface = strapi.plugins['esplugin'].services.esInterface
            const indexesService = strapi.plugins['esplugin'].services.indexes
            let index:RegisteredIndex = await indexesService.getIndex(indexUUID)
            if (index) {
                return await esInterface.getMapping(index.index_name)
            } else {
                throw "No index found"
            }

        } catch(error) {
            console.error('SERVICE indexes getESMapping - error:', error)
            throw error
        }

    }

})