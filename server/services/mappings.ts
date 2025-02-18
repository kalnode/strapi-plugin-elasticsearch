import { v4 as uuidv4 } from 'uuid'

// TODO: Is there a better way to import these types? Maybe no import (set them globally), or if importing here, then a better path than using a bunch of "..\"'s ?
import { TMapping1, MappingExperimental } from "../../types"

export default ({ strapi }) => ({

    async getMapping(mappingId:string) {

        // -------------------------------------------
        const helperGetPluginStore = () => {
            return strapi.store({
                environment: '',
                type: 'plugin',
                name: 'esplugin'
            })
        }
        const pluginStore = helperGetPluginStore()         
        const mappings:Array<TMapping1> = JSON.parse(await pluginStore.get({ key: 'mappings' }))
        console.log("getMapping 000", mappings)

        //console.log("getMapping 000aaa", JSON.parse(mappings))
        //if (mappings) {
        const mappingsArray:Array<TMapping1> = JSON.parse(JSON.stringify(mappings)) //JSON.parse(mappings)

        console.log("getMapping 111 mappingsArray", mappingsArray)

        //console.log("getMapping 111aaa mappingsArray",  JSON.parse(mappingsArray))
        //console.log("getMapping 111", mappings)
       
            let work = mappings.find( (x:TMapping1) => x.uuid === mappingId)
            console.log("getMapping 111 work is: ", work)
            return work

        //}
        // -------------------------------------------

        // DB PARADIGM
        //return await strapi.entityService.findOne('plugin::esplugin.mapping', mappingId, { populate: "indexes" })
    },

    async getMappings(indexId:string, count:number = 100) {

        // TODO: Change this to use plugin store instead of db table.

        let payload:any = {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count,
            filters: { },
            populate: "indexes"
        }

        // TODO: This is really stupid, but need to figure out a better way to dynamically add "filters: {}" to the payload.
        // Right now we start with it empty, and delete or fill it. Ideally we don't have any of this and just add filters to payload.

        // TODO: Some sillyness going on here; for some reason all of these conditions are needed, and they must come first in the if-else order.
        // Simply checking !indexId doesn't seem to work.
        if (!indexId || indexId === 'undefined' || indexId === undefined || typeof indexId === 'undefined') {

            delete payload.filters

        } else if (indexId || indexId != 'undefined' || indexId != undefined || typeof indexId != 'undefined') {

            payload.filters['indexes'] = {
                id: {
                    $eq: indexId
                }
            }

        }

        // -------------------------------------------
        const helperGetPluginStore = () => {
            return strapi.store({
                environment: '',
                type: 'plugin',
                name: 'esplugin'
            })
        }
        const pluginStore = helperGetPluginStore()         
        const mappings:string = await pluginStore.get({ key: 'mappings' })
        return JSON.parse(JSON.stringify(mappings)) //JSON.parse(mappings)
        // -------------------------------------------

      

        // return await strapi.entityService.findMany('plugin::esplugin.mapping', payload)

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

    async createMapping(mapping:TMapping1) {
        // TODO: This type doesn't seem to do anything; it accepts anything.
        // For example, below, change .uuid to .uuidFoo and there's no warning.

        try {

            let finalPayload:TMapping1 = mapping
            finalPayload.mapping = JSON.stringify(finalPayload.mapping)
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

            console.log("createMapping 222 finalPayload", finalPayload)

            console.log("createMapping 333 mappings", mappings)

            if (mappings) {
                //mappings = JSON.parse(mappings)
            } else {
                mappings = []
            }

            console.log("createMapping 444", mappings)
            if (Array.isArray(mappings)) {
                mappings.push(finalPayload)
            }
            
            console.log("createMapping 555", mappings)
            await pluginStore.set({ key: 'mappings', value: mappings })
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

    async updateMapping(mappingId, mapping) {

        // Change to uuid

        const helper = strapi.plugins['esplugin'].services.helper
        const esInterface = strapi.plugins['esplugin'].services.esInterface

        try {
            let finalPayload = mapping
            finalPayload.mapping = JSON.stringify(finalPayload.mapping)

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
            if (Array.isArray(mappings)) {
                let foundMapping = mappings.find( (x:any) => x.uuid === mapping.uuid)
                foundMapping.mapping = finalPayload
            }           
            await pluginStore.set({ key: 'mappings', value: JSON.stringify(mappings) })
            // -------------------------------------------

            // UPDATE DB
            // const entry = await strapi.entityService.update('plugin::esplugin.mapping', mappingId, {
            //     data: finalPayload,
            //     populate: 'indexes'
            // })
            return finalPayload

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

    async deleteMapping(mappingUUID) {

        // TODO: Change to mappingUUID
        const helper = strapi.plugins['esplugin'].services.helper
        console.log("deleteMapping 111 ", mappingUUID)
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
            let mappings:any = await pluginStore.get({ key: 'mappings' })

            console.log("deleteMapping 222 mappings", mappings)
            if (mappings && Array.isArray(mappings)) {
                let foundMappingIndex = mappings.findIndex( (x:any) => x.uuid === mappingUUID)
                console.log("deleteMapping 333 foundMappingIndex", foundMappingIndex)
                mappings.splice(foundMappingIndex, 1)
            }           
            await pluginStore.set({ key: 'mappings', value: JSON.stringify(mappings) })
            // -------------------------------------------
            
            console.log("deleteMapping 444")
            //const entry = await strapi.entityService.delete('plugin::esplugin.mapping', mappingUUID)
            return "success"

        } catch (err) {
            console.log('SPE - deleteMapping: An error has encountered', err)
            console.log(err)
            return err
        }
    }

})