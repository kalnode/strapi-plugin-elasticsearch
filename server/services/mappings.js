
module.exports = ({ strapi }) => ({

    async getMapping(mappingId) {
        const record = await strapi.entityService.findOne('plugin::elasticsearch.mapping', mappingId, {
            populate: "indexes"
        })
        return record
    },

    async getMappings(indexId, count = 50) {

        let payload = {
            sort: { createdAt: 'DESC' },
            start: 0,
            limit: count,
            filters: { },
            populate: "indexes"
        }

        // console.log("indexId is: ", indexId)
        // console.log("indexId type: ", typeof indexId)
        // TODO: This is really stupid, but need to figure out a better way to dynamically add "filters: {}" to the payload.
        // Right now we start with it empty, and delete or fill it. Ideally we don't have any of this and just add filters to payload.

        // TODO: Some sillyness going on here; for some reason all of these conditions are needed, and they must come first in the if-else order.
        // Simply checking !indexId doesn't seem to work.
        if (!indexId || indexId === 'undefined' || indexId === undefined || typeof indexId === "undefined") {

            delete payload.filters

        } else if (indexId || indexId != 'undefined' || indexId != undefined || typeof indexId != "undefined") {
            
            // OLD WAY
            // payload.filters.registered_index = {
            //     $in: indexId,
            // }

            // payload.filters.indexes = {
            //     id: {
            //         $eq: indexId
            //     }
            // }

            // payload.filters.indexes = {
            //     id: indexId
            // }

            payload.filters['indexes'] = {
                id: {
                    $eq: indexId
                }
            }

            // filters: {
            //     $or: [
            //       { author: { id: user.id }},
            //       { reviewers: { user: { id: user.id }}},
            //     ],  		
            //   },\
            
            // where: {
            //     $or: [{[relationship]: {id: {$null: true}}}],
            //   },


            //const fullEvent = await strapi.entityService.findOne('api::event.event', eventID, { populate: "Participants" })


        }

        //console.log("Payload is: ", payload)
        const records = await strapi.entityService.findMany('plugin::elasticsearch.mapping', {...payload})
        return records
    },


    async getContentTypesEarly() {

        // let contentTypes = []
        // Object.values(strapi.contentTypes).map(contentType => {
        //   if ((contentType.kind === "collectionType" || contentType.kind === "singleType") && !contentType.plugin) {
        //     contentTypes.push(contentType);
        //   }
        // })
        let work = strapi.contentTypes

        return work
                // axiosInstance.get('/content-type-builder/content-types')
        //     .then((response) => {
        //         console.log("PAGE getContentTypes response: ", response)
        //     })
        //     .catch((error) => {
        //         console.log("PAGE getContentTypes ERROR: ", error)
        //     })

        // const records = await strapi.entityService.findMany('plugin::elasticsearch.mapping', {
        //     sort: { createdAt: 'DESC' },
        //     start: 0,
        //     limit: count
        // })
        // return records
    },




    async getContentTypes() {
        //const pluginStore = getPluginStore()
        //const settings = await pluginStore.get({ key: 'configsettings' })

        const contentTypes = strapi.contentTypes
        // TODO: Use the below array in filteredContentTypes:
        // allowedContentTypes = ['api::', 'plugin::users-permissions.user']
        const filteredContentTypes = Object.keys(contentTypes).filter((c) => c.includes('api::') || c.includes('plugin::users-permissions.user'))
        const fieldsToExclude = ['createdAt', 'createdBy', 'publishedAt', 'publishedBy', 'updatedAt', 'updatedBy']

        const finalOutput = {}

        for (let r = 0; r < filteredContentTypes.length; r++) {
            finalOutput[filteredContentTypes[r]] = {}
            const rawAttributes = contentTypes[filteredContentTypes[r]].attributes
            const filteredAttributes = Object.keys(rawAttributes).filter((i) => fieldsToExclude.includes(i) === false)

            for (let k = 0; k < filteredAttributes.length; k++) {
                const currentAttribute = filteredAttributes[k]
                let attributeType = "regular"
                if (typeof rawAttributes[currentAttribute]["type"] !== "undefined" && rawAttributes[currentAttribute]["type"] !== null) {
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

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - createMapping 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            console.log('SPE - createMapping 333 - Created new index with name:', mapping)

            let finalPayload = JSON.parse(JSON.stringify(mapping))

            finalPayload.mapping = JSON.stringify(finalPayload.mapping)
            //let work = await esInterface.createIndex(newIndexName)
            const entry = await strapi.entityService.create('plugin::elasticsearch.mapping', {
                data : {
                    ...finalPayload
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



    async updateMapping(mappingId, mapping) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

        try {

            //const oldIndexName = await helper.getCurrentIndexName()
            //console.log('SPE - updateMapping 222 - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            //const newIndexName = await helper.getIncrementedIndexName()
            console.log('SPE - updateMapping 111 - mappingId:', mappingId)
            console.log('SPE - updateMapping 222', mapping)
            //let work = await esInterface.createIndex(newIndexName)
            //JSON.stringify(body.data)
            let finalPayload = JSON.parse(JSON.stringify(mapping))

            finalPayload.mapping = JSON.stringify(finalPayload.mapping)
            const entry = await strapi.entityService.update('plugin::elasticsearch.mapping', mappingId, {
                data: {
                    ...finalPayload
                }
            })

            console.log('SPE - updateMapping 444 - Updated mapping:', entry)
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