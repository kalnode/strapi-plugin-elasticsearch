
module.exports = ({ strapi }) => ({

    async getMapping(mappingId) {
        return await strapi.entityService.findOne('plugin::elasticsearch.mapping', mappingId, { populate: "indexes" })
    },

    async getMappings(indexId, count = 100) {

        let payload = {
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
        if (!indexId || indexId === 'undefined' || indexId === undefined || typeof indexId === "undefined") {

            delete payload.filters

        } else if (indexId || indexId != 'undefined' || indexId != undefined || typeof indexId != "undefined") {

            payload.filters['indexes'] = {
                id: {
                    $eq: indexId
                }
            }

        }

        return await strapi.entityService.findMany('plugin::elasticsearch.mapping', {...payload})

    },

    async getContentTypes() {

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
                    } else if(rawAttributes[currentAttribute]["type"] === "dynamiczone") {
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
        //const pluginStore = getPluginStore()
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


    async createMapping(mapping) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()

            let finalPayload = JSON.parse(JSON.stringify(mapping))

            finalPayload.mapping = JSON.stringify(finalPayload.mapping)

            //let work = await esInterface.createIndex(newIndexName)

            const entry = await strapi.entityService.create('plugin::elasticsearch.mapping', {
                data : {
                    ...finalPayload
                    //index_alias: 'myAlias'
                }
            })

            return entry

        } catch(err) {
            console.log('SPE - createMapping: An error was encountered')
            console.log(err)
            return err
        }

    },


    async updateMapping(mappingId, mapping) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const newIndexName = await helper.getIncrementedIndexName()
            //let work = await esInterface.createIndex(newIndexName)
            //JSON.stringify(body.data)

            let finalPayload = JSON.parse(JSON.stringify(mapping))
            let finalPayload2 = JSON.parse(JSON.stringify(finalPayload.mapping))
            finalPayload.mapping = JSON.stringify(finalPayload.mapping)
            const entry = await strapi.entityService.update('plugin::elasticsearch.mapping', mappingId, {
                data: finalPayload,
                populate: 'indexes'
            })

            console.log("Mapping entry is: ", entry)
            console.log("finalPayload2 is: ", finalPayload2)

            // EXPERIMENTAL
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


            return entry

        } catch(err) {
            console.log('SPE - updateMapping: An error was encountered')
            console.log(err)
            return err
        }

    },

    async deleteMapping(mappingIndexNumber) {

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