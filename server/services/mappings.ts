import { v4 as uuidv4 } from 'uuid'
import { Mapping, RegisteredIndex } from "../../types"

export default ({ strapi }) => ({

    async getMapping(mappingUUID:string) {

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

            if (mappingUUID) {
                if (mappings && Array.isArray(mappings)) {
                    let work = mappings.find( (x:Mapping) => x.uuid === mappingUUID)
                    if (work) {
                        return work
                    } else {
                        throw "No mapping found"
                    }
                }
            } else {
                throw "No mapping UUID provided"
            }

            // --------------------------
            // EARLY DEV: DB PARADIGM
            // return await strapi.entityService.findOne('plugin::esplugin.mapping', mappingId, { populate: "indexes" })
            // --------------------------

        } catch(error) {
            console.error('SERVICE mappings getMapping - error:', error)
            return error
        }
        
    },

    async getMappings(indexUUID?:string) {

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
            let mappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })
    
            if (mappings) {
                if (indexUUID) {
    
                    // TODO: QUERY PLUGIN CACHE instead; one less db call. Or is it risky?
                    const indexesService = strapi.plugins['esplugin'].services.indexes
                    const index:RegisteredIndex = await indexesService.getIndex(indexUUID)
    
                    if (index && index.mappings) {
                        mappings = mappings.filter( (x:Mapping) => x.uuid && index.mappings && index.mappings.includes(x.uuid))
                    }
    
                }
    
                return mappings

            } else {
                throw "No mappings found" 
            }
    
            // --------------------------
            // EARLY DEV: DB PARADIGM
    
            // let payload:any = {
            //     sort: { createdAt: 'DESC' },
            //     start: 0,
            //     limit: 100,
            //     filters: { },
            //     populate: "indexes"
            // }
    
            // // TODO: This is really stupid, but need to figure out a better way to dynamically add "filters: {}" to the payload.
            // // Right now we start with it empty, and delete or fill it. Ideally we don't have any of this and just add filters to payload.
    
            // // TODO: Some sillyness going on here; for some reason all of these conditions are needed, and they must come first in the if-else order.
            // // Simply checking !indexId doesn't seem to work.
            // if (!indexId || indexId === 'undefined' || indexId === undefined || typeof indexId === 'undefined') {
    
            //     delete payload.filters
    
            // } else if (indexId || indexId != 'undefined' || indexId != undefined || typeof indexId != 'undefined') {
    
            //     payload.filters['indexes'] = {
            //         id: {
            //             $eq: indexId
            //         }
            //     }
    
            // }
    
            // return await strapi.entityService.findMany('plugin::esplugin.mapping', payload)
            // --------------------------


        } catch(error) {
            console.error('SERVICE mappings getMappings - error:', error)
            return error
        }      

    },

    async createMapping(mapping:Mapping) {

        try {

            const finalPayload:Mapping = {
                ...mapping,
                uuid: uuidv4()
            }

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()

            // TODO: Change this to get from store cache instead? One less db call. Or is it risky?
            let mappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })

            if (!mappings) {
                mappings = []
            }

            mappings.push(finalPayload)
            await pluginStore.set({ key: 'mappings', value: mappings })

            if (finalPayload.indexes && finalPayload.uuid) {
                await this.attachMapping(finalPayload.indexes[0], finalPayload.uuid)
            }

            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const entry = await strapi.entityService.create('plugin::esplugin.mapping', {
            //     data: finalPayload
            // })
            // --------------------------

            return finalPayload

        } catch(error) {
            console.error('SERVICE mappings createMapping - error:', error)
            return error
        }

    },

    async updateMapping(mapping:Mapping) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()

            // TODO: Change this to get from store cache instead? One less db call. Or is it risky?
            let mappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })

            if (mappings && Array.isArray(mappings)) {

                // TODO: Probably a more elegant way to do this.
                const foundIndex:number = mappings.findIndex( (x:Mapping) => x.uuid === mapping.uuid)
                if (foundIndex >= 0) {
                    mappings[foundIndex] = mapping
                    await pluginStore.set({ key: 'mappings', value: mappings })
                } else {
                    return "Cannot find mapping to update"
                }

            } else {
                throw "No mappings found; cannot update"
            }

            // --------------------------
            // SYNC INDEXS WITH ES, if mapping applies
            // let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
            // indexes = indexes.filter( (x:RegisteredIndex) => x.mappings && mapping.uuid && x.mappings.includes(mapping.uuid))
            // const indexesService = strapi.plugins['esplugin'].services.indexes
            // indexes.forEach( async (x:RegisteredIndex) => {
            //     console.log("updateMapping 444")
            //     await indexesService.syncIndexWithExternal(x.uuid)
            // })
            // --------------------------


            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const entry = await strapi.entityService.update('plugin::esplugin.mapping', mappingId, {
            //     data: finalPayload,
            //     populate: 'indexes'
            // })
            // --------------------------

        } catch(error) {
            console.error('SERVICE mappings updateMapping - error:', error)
            return error
        }

    },

    async updateMappings(mappings:Array<Mapping>) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()

            // TODO: Change this to get from store cache instead? One less db call. Or is it risky?
            let existingMappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })

            if (existingMappings && Array.isArray(existingMappings)) {
                for (let i = 0; i < mappings.length; i++) {
                    let mapping:Mapping = mappings[i]
                    let foundIndex:number = existingMappings.findIndex( (x:Mapping) => x.uuid === mapping.uuid)
                    if (foundIndex >= 0) {
                        existingMappings[foundIndex] = mapping
                    } else {
                        throw "Cannot find mapping to update"
                    }
                }
            } else {
                throw "Cannot find mappings"
            }

            await pluginStore.set({ key: 'mappings', value: existingMappings })

            return "Success - mappings updated"

            // --------------------------
            // SYNC INDEXS WITH ES, if mapping applies
            // let indexes:Array<RegisteredIndex> = await pluginStore.get({ key: 'indexes' })
            // if (existingMappings) {
            //     existingMappings.forEach( (x:Mapping) => {
            //         let matchedIndexes = indexes.filter( (y:RegisteredIndex) => y.mappings && x.uuid && y.mappings.includes(x.uuid))
            //         const indexesService = strapi.plugins['esplugin'].services.indexes
            //         matchedIndexes.forEach( async (x:RegisteredIndex) => {
            //             console.log("updateMapping 444")
            //             await indexesService.syncIndexWithExternal(x.uuid)
            //         })
            //     })
            // }
            // --------------------------
            
            // --------------------------
            // EARLY DEV: DB PARADIGM
            // const entry = await strapi.entityService.update('plugin::esplugin.mapping', mappingId, {
            //     data: finalPayload,
            //     populate: 'indexes'
            // })
            // --------------------------

        } catch(error) {
            console.error('SERVICE mappings updateMappings - error:', error)
            return error
        }

    },

    async attachMapping(indexUUID:string, mappingUUID:string) {
        try {
            if (indexUUID && mappingUUID) {
                const indexesService = strapi.plugins['esplugin'].services.indexes
                let index:RegisteredIndex = await indexesService.getIndex(indexUUID)
                if (index.mappings) {
                    if (index.mappings.includes(mappingUUID)) {
                        throw "Mapping already attached"
                    }
                } else {
                    index.mappings = []
                }                  
                index.mappings.push(mappingUUID)
                await indexesService.updateIndex(indexUUID, index)
                return "Success - Mapping attached to index"
            } else {
                throw "Need indexUUID & mappingUUID"
            }
        } catch(error) {
            console.error('SERVICE mappings attachMapping - error:', error)
            return error
        }
    },

    async detachMapping(indexUUID:string, mappingUUID:string) {
        try {
            const indexesService = strapi.plugins['esplugin'].services.indexes
            const index:RegisteredIndex = await indexesService.getIndex(indexUUID)
            if (index && index.mappings) {
                index.mappings = index.mappings.filter( (x:string) => x !== mappingUUID)
                await indexesService.updateIndex(indexUUID, index)
                return "Success - Mapping detached from index"
            } else {
                throw "Fail - No index found"
            }
        } catch(error) {
            console.error('SERVICE mappings detachMapping - error:', error)
            return error
        }
    },

    async deleteMapping(mappingUUID:string) {

        try {

            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()

            // TODO: Change this to get from store cache instead? One less db call. Or is it risky?
            let mappings:Array<Mapping> = await pluginStore.get({ key: 'mappings' })

            if (mappings && Array.isArray(mappings)) {
                const foundIndex:number = mappings.findIndex( (x:Mapping) => x.uuid === mappingUUID)
                if (foundIndex >= 0) {
                    const mapping:Mapping = mappings[foundIndex]
                    const indexesService = strapi.plugins['esplugin'].services.indexes
                    let indexes:Array<RegisteredIndex> = await indexesService.getIndexes()
                    if (indexes && Array.isArray(indexes) && indexes.length > 0) {
                        indexes = indexes.filter( (x:RegisteredIndex) => x.mappings && mapping.uuid && x.mappings.includes(mapping.uuid))
                        if (indexes) {
                            for (let i = 0; i < indexes.length; i++) {
                                await this.detachMapping(indexes[i].uuid, mapping.uuid)
                            }
                        }
                    }
                    mappings.splice(foundIndex, 1)
                }
            }

            // TODO: Add check whether mappings actually updated; if not, avoid this transaction
            await pluginStore.set({ key: 'mappings', value: mappings.length ? mappings : null })

            // --------------------------
            // EARLY DEV: DB PARADIGM
            //const entry = await strapi.entityService.delete('plugin::esplugin.mapping', mappingUUID)
            // --------------------------
            
            return "Success - Mapping deleted"

        } catch(error) {
            console.error('SERVICE mappings deleteMapping - error:', error)
            return error
        }
    }

})