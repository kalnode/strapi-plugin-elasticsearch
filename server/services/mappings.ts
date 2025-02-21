import { v4 as uuidv4 } from 'uuid'

// TODO: Is there a better way to import these types? Maybe no import (set them globally), or if importing here, then a better path than using a bunch of "..\"'s ?
import { TMapping1, MappingExperimental } from "../../types"

export default ({ strapi }) => ({

    async getMapping(mappingUUID:string) {

        // -------------------------------------------
        const helperGetPluginStore = () => {
            return strapi.store({
                environment: '',
                type: 'plugin',
                name: 'esplugin'
            })
        }
        const pluginStore = helperGetPluginStore()         
        const mappings:Array<TMapping1> = await pluginStore.get({ key: 'mappings' })
        if (mappings && Array.isArray(mappings)) {
            let work = mappings.find( (x:TMapping1) => x.uuid === mappingUUID)
            if (work) {
                return work
            }
        }
        return "No mapping found"
        // -------------------------------------------

        // DB PARADIGM
        //return await strapi.entityService.findOne('plugin::esplugin.mapping', mappingId, { populate: "indexes" })
    },

    async getMappings(indexUUID:string) {

        // -------------------------------------------
        const helperGetPluginStore = () => {
            return strapi.store({
                environment: '',
                type: 'plugin',
                name: 'esplugin'
            })
        }
        const pluginStore = helperGetPluginStore()

        // TODO: CHANGE TO PLUGINCACHE
        const mappings:Array<any> = await pluginStore.get({ key: 'mappings' })


        if (mappings) {
            if (indexUUID) {

                // TODO: CHANGE TO PLUGINCACHE
                const indexesService = strapi.plugins['esplugin'].services.indexes
                const index = await indexesService.getIndex(indexUUID)

                if (index && index.mappings) {
                    const specificMappings = mappings.filter( (x:any) => index.mappings.includes(x.uuid))
                    return specificMappings
                }

            } else {

                // console.log("getMappings 333", indexUUID)
                // if (indexUUID) {
                //     let work = mappings.filter( (x:any) => x.indexes && x.indexes.includes(indexUUID) ) //JSON.parse(mappings) //JSON.parse(JSON.stringify(mappings))
                //     console.log("getMappings 444 ", work)
                //     return work
                // }

                return mappings

            }
        }

        console.log("getMappings 555")
        return "No mappings found"
        
        // -------------------------------------------


        // DB paradigm

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

    },

    async createMapping(mapping:TMapping1) {
        // TODO: This type doesn't seem to do anything; it accepts anything.
        // For example, below, change .uuid to .uuidFoo and there's no warning.

        try {

            let finalPayload:TMapping1 = mapping
            finalPayload.mappingRaw = JSON.stringify(finalPayload.mappingRaw)
            finalPayload.uuid = uuidv4()

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
            let mappings:any = await pluginStore.get({ key: 'mappings' })

            if (!mappings) {
                mappings = []
            }

            mappings.push(finalPayload)
            
            await pluginStore.set({ key: 'mappings', value: mappings })

            if (finalPayload.indexes) {
                let work444 = await this.attachMapping({indexUUID: finalPayload.indexes[0], mappingUUID: finalPayload.uuid})
            }
            // -------------------------------------------

            // const entry = await strapi.entityService.create('plugin::esplugin.mapping', {
            //     data: finalPayload
            // })
            return finalPayload

        } catch (err) {
            console.log('SPE - createMapping: An error was encountered')
            console.log(err)
            return err
        }

    },

    async updateMapping(mapping:TMapping1) {

        try {

            // TODO: Is this extra variable necessary?
            //let finalPayload:TMapping1 = mapping
            //finalPayload.mappingRaw = JSON.stringify(finalPayload.mappingRaw)

            // console.log("updateMapping 222: ", finalPayload)

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
            let mappings:any = await pluginStore.get({ key: 'mappings' })

            if (mappings && Array.isArray(mappings)) {
                let foundIndex = mappings.findIndex( (x:any) => x.uuid === mapping.uuid)
                mappings[foundIndex].mappingRaw = JSON.stringify(mapping.mappingRaw)
            } else {
                console.log("Cannot find mapping to update")
            }
            await pluginStore.set({ key: 'mappings', value: mappings })
            // -------------------------------------------

            // UPDATE DB
            // const entry = await strapi.entityService.update('plugin::esplugin.mapping', mappingId, {
            //     data: finalPayload,
            //     populate: 'indexes'
            // })
            return mapping

            // EXPERIMENTAL
            // TODO: PROBABLY REMOVE... ES basically cannot accept updates to mappings
            // Updating mappings on existing index; basically not possible however you can 1. add new mappings to an existing index, or 2. change the secondary properties (?) of an existing mapping.
            // if (entry.indexes) {
            //     // 1 - Loop through indexes, updateMapping for each
            //     for (i = 0; i < entry.indexes.length; i++) {
            //         let index = entry.indexes[i]
            //         console.log("ESwork index is:", index)
            //         let ESwork = await esInterface.updateMapping({indexName: index.index_name, mapping: finalPayload2})
            //         console.log("ESwork after work is: ", ESwork)
            //     }
            // }

        } catch (err) {
            console.log('SPE - updateMapping: An error was encountered')
            console.log(err)
            return err
        }

    },


    async attachMapping(payload) {

        try {

            const indexesService = strapi.plugins['esplugin'].services.indexes
            const index = await indexesService.getIndex(payload.indexUUID)
            const mappingIndexNumber = index.mappings.findIndex( (x:any) => x === payload.mappingUUID)
            
            if (mappingIndexNumber === -1) {
                index.mappings.push(payload.mappingUUID)
            }
            const work = await indexesService.updateIndex(payload.indexUUID, index)

            return "Attachment success"

        } catch (err) {
            console.log('SPE - attachMapping: An error was encountered')
            console.log(err)
            return err
        }

    },

    async detachMapping({ indexUUID, mappingUUID }) {

        try {

            const indexesService = strapi.plugins['esplugin'].services.indexes
            const index = await indexesService.getIndex(indexUUID)

            const mappingIndexNumber = index.mappings.findIndex( (x:any) => x === mappingUUID)

            //index.mappings = index.mappings.splice(mappingIndexNumber, 1)
            index.mappings = index.mappings.filter( (x:any) => x !== mappingUUID)

            const work = await indexesService.updateIndex(indexUUID, index)
            return "Detachment success"

        } catch (err) {
            console.log('SPE - detachMapping: An error was encountered')
            console.log(err)
            return err
        }

    },

    async deleteMapping(mappingUUID) {

        try {

            // -------------------------------------------
            const helperGetPluginStore = () => {
                return strapi.store({
                    environment: '',
                    type: 'plugin',
                    name: 'esplugin'
                })
            }
            const pluginStore = helperGetPluginStore()         
            let mappings:any = await pluginStore.get({ key: 'mappings' })

            if (mappings && Array.isArray(mappings)) {

                const foundMappingIndex = mappings.findIndex( (x:any) => x.uuid === mappingUUID)
                const mapping = mappings[foundMappingIndex]

                const indexesService = strapi.plugins['esplugin'].services.indexes
                const indexes = await indexesService.getIndexes()

                if (indexes) {

                    const indexesWithMatchingMappings = indexes.filter( (x:any) => x.mappings && x.mappings.includes(mapping.uuid))

                    if (indexesWithMatchingMappings) {
                        for (let i = 0; i < indexesWithMatchingMappings.length; i++) {
                            let work2 = await this.detachMapping({ indexUUID: indexesWithMatchingMappings[i].uuid, mappingUUID: mapping.uuid })
                        }
                        //let work1 = await this.detachMapping({ indexUUID: mapping.indexes[0], mappingUUID: mapping.uuid })
                        //console.log("deleteMapping 333", work1)
                    }
                }

                mappings.splice(foundMappingIndex, 1)
            }
            if (mappings.length === 0) {
                mappings = null
            }
            await pluginStore.set({ key: 'mappings', value: mappings })
            // -------------------------------------------
            
            // DB paradigm
            //const entry = await strapi.entityService.delete('plugin::esplugin.mapping', mappingUUID)
            return "Delete mapping success"

        } catch (err) {
            console.log('SPE - deleteMapping: An error has encountered', err)
            console.log(err)
            return err
        }
    },




    async getContentTypes() {

        // TODO: Change this to use plugin store instead of db table.

        const contentTypes = strapi.contentTypes
        
        // TODO: Use the below array in filteredContentTypes .filter(), instead of having so many "c.includes"
        // allowedContentTypes = ['api::', 'plugin::users-permissions.user']
        
        const filteredContentTypes = Object.keys(contentTypes).filter((c) => c.includes('api::') || c.includes('plugin::users-permissions.user'))
        const fieldsToExclude = ['createdAt', 'createdBy', 'publishedAt', 'publishedBy', 'updatedAt', 'updatedBy']

        const finalOutput = {}

        for (let r = 0; r < filteredContentTypes.length; r++) {

            finalOutput[filteredContentTypes[r]] = {}

            const rawAttributes = contentTypes[filteredContentTypes[r]].attributes

            // Filter out fields we don't want (fieldsToExclude)
            const filteredAttributes = Object.keys(rawAttributes).filter((i) => !fieldsToExclude.includes(i))

            for (let k = 0; k < filteredAttributes.length; k++) {
                const currentAttribute = filteredAttributes[k]
                let attributeType = "regular"
                if (typeof rawAttributes[currentAttribute]["type"] !== "undefined" && rawAttributes[currentAttribute]["type"] !== null) {

                    // TODO: Scrutinize strapi field types "component" and "dynamiczone"; I know nothing of them and how we'd want to handle them.
                    if (rawAttributes[currentAttribute]["type"] === "component") {
                        attributeType = "component"
                    } else if (rawAttributes[currentAttribute]["type"] === "dynamiczone") {
                        attributeType = "dynamiczone"
                    }
                }

                finalOutput[filteredContentTypes[r]][filteredAttributes[k]] = {
                    raw_type: rawAttributes[currentAttribute]["type"],
                    field_type: attributeType
                }
            }                
        }

        return finalOutput


        // LEGACY CODE; still may need this if we need to interact with the plugin store.
        //const pluginStore = helper.getPluginStore()
        //const settings = await pluginStore.get({ key: 'configsettings' })

        // if (settings) {
        //     const objSettings = JSON.parse(settings)
        //     if (Object.keys(objSettings).includes('contentConfig')) {
        //         const collections = Object.keys(finalOutput)
        //         for (let r = 0; r < collections.length; r++) {
        //             if (Object.keys(objSettings['contentConfig']).includes(collections[r])) {
        //                 const attribsForCollection = Object.keys(finalOutput[collections[r]])
        //                 for (let s = 0; s < attribsForCollection.length; s++) {
        //                     if (!Object.keys(objSettings['contentConfig'][collections[r]]).includes(attribsForCollection[s])) {
        //                         objSettings['contentConfig'][collections[r]][attribsForCollection[s]] = {index: false, 
        //                         type: finalOutput[collections[r]][attribsForCollection[s]].type}
        //                     } else {
        //                         if (!Object.keys(objSettings['contentConfig'][collections[r]][attribsForCollection[s]]).includes('type')) {
        //                             objSettings['contentConfig'][collections[r]][attribsForCollection[s]]['type'] = finalOutput[collections[r]][attribsForCollection[s]].type
        //                         }
        //                     }
        //                 }
        //             } else {
        //                 objSettings['contentConfig'][collections[r]] = finalOutput[collections[r]]
        //             }
        //             return objSettings['contentConfig']
        //         }
        //     } else {
        //         return finalOutput
        //     }
        // } else {
        //     return finalOutput
        // }
    },

})