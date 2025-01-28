
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


    async getContentTypesEarly() {

        console.log('SPE - getContentTypes 111')

        // let contentTypes = []
        // Object.values(strapi.contentTypes).map(contentType => {
        //   if ((contentType.kind === "collectionType" || contentType.kind === "singleType") && !contentType.plugin) {
        //     contentTypes.push(contentType);
        //   }
        // })
        let work = strapi.contentTypes

        console.log('SPE - getContentTypes 222', work)
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