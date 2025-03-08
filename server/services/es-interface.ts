import { Client } from "@elastic/elasticsearch"
import { estypes } from '@elastic/elasticsearch'
import fs from "fs" // Possibly needed for cert reading
import path from "path" // Possibly needed for cert reading
import { RegisteredIndex } from "../../types"

let client:Client

export default ({ strapi }) => ({

    // new elasticsearch.Client({
    //     host: bonsai_url,
    //     log: 'trace'
    // });

    // TODO: Do we need this func in addition to checkESConnection() ?
    async checkClient() {
        if (!client) {
            // TODO: Double-check this throw will make it to parent try-catch instance
            throw "ES connection problem"
        }
    },

    async checkESConnection() {
        try {
            this.checkClient()
            await client.ping()
            return true
        } catch(error) {
            console.error('SERVICE es-interface checkESConnection error:', error)
            throw error
        }
    },

    async initializeSearchEngine({ hostfull, host, uname, password, cert }) {
        try {
            if (hostfull) {
                client = await new Client({
                    node: hostfull,
                    //log: 'trace', // TODO: disabling because TS error. What is this, why do we need it? From legacy plugin.
                    tls: {
                        rejectUnauthorized: false
                    }
                })
            } else {

                client = await new Client({
                    node: host,
                    auth: {
                        username: uname,
                        password: password
                    },
                    //log: 'trace', // TODO: disabling because TS error. What is this, why do we need it? From legacy plugin.

                    // KAL - Disabling tls to get Strapi working on Heroku deploy.
                    // Possibly don't need this because the ES instance is on the same host (perhaps we need to restrict it to same-domain?)... or... Heroku handles SSL outside of the app running on the instance.
                    tls: {
                        //ca: fs.readFileSync('./config'+cert), //fs.readFileSync('./http_ca.crt'), //cert,
                        rejectUnauthorized: false
                    }
                })
            }
        } catch (error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.error('SERVICE es-interface initializeSearchEngine error: Connection to ElasticSearch at ', host, ' refused.')
                console.error(error)
            } else {
                console.error('SERVICE es-interface initializeSearchEngine error:', error)
            }
            throw error
        }

    },

    /**
     *
     * INDEX MANAGEMENT, general
     * 
     */

    async getIndexes() {
        try {
           this.checkClient()
           //const indexes = await client.indices.get({ index: "_all" })
           const indexes = await client.indices.get({ index: "*" })
           if (indexes) {
               return indexes
           } else {
               throw "No indexes found"
           }
       } catch(error) {
           console.error('SERVICE es-interface getIndexes error:', error)
           throw error
       }
   },

    async createIndex(indexName:estypes.IndexName) {
        try {
            this.checkClient()
            const exists = await client.indices.exists({ index: indexName })
            if (!exists) {
                let work = await client.indices.create({
                    index: indexName,
                    mappings: {
                        dynamic: false
                    }
                })
                return work
            } else {
                throw "ES index already exists"
            }
        } catch(error) {
            throw error
        }
    },

    async deleteIndex(indexName:estypes.IndexName) {
        try {
            this.checkClient()
            const exists = await client.indices.exists({ index: indexName })
            if (exists) {
                await client.indices.delete({
                    index: indexName
                })
                return "ES successfully deleted"
            } else {
                throw "ES index not found; no deletion occurred"
            }
        } catch(error) {
            console.error('SERVICE es-interface deleteIndex error:', error)
            throw error
        }
    },

    async cloneIndex(indexName:estypes.IndexName, targetName:estypes.IndexName) {

        try {

            this.checkClient()
            const exists = await client.indices.exists({ index: indexName })
            const existsTarget = await client.indices.exists({ index: targetName })

            if (!exists) {
                throw "Original ES index not found; no cloning occurred"
            }

            if (existsTarget) {
                throw "Target index name already exists"
            }

            try {

                // First, add a block to stop new writes happening during this process.
                await client.indices.addBlock({
                    index: indexName,
                    block: "write",
                })

                // Second, actually clone the index
                await client.indices.clone({
                    index: indexName,
                    target: targetName
                })
                .catch( (error) => {
                    // TODO: Bug? There's perhaps some bug with this specific returned error from the ES api.
                    // Ideally we just pass it with "throw error", like everywhere else, however server
                    // console complains about "TypeError: Cannot set property statusCode of Error... which has only a getter...".
                    // And as such it doesn't pass the ES error message back, this in admin UI we don't see a proper error message.
                    // FOR NOW: This works and is displayed in admin UI:
                    throw "Cannot clone index due to technical issue"
                })

                // TODO: Confirm this is proper ES way.
                // It seems like to remove the earlier block, we use an entirely different API.
                await client.indices.putSettings({
                    index: indexName,
                    settings: {
                        blocks: {
                            write: false
                        }
                    }
                })
            } catch(error) {
                throw error
            }

            return "ES successfully cloned"

        } catch(error) {
            console.error('SERVICE es-interface cloneIndex error:', error)
            throw error
        }
    },

    async reindexIndex(indexName:estypes.IndexName, targetName:estypes.IndexName) {

        try {

            this.checkClient()
            const exists = await client.indices.exists({ index: indexName })
            const existsTarget = await client.indices.exists({ index: targetName })

            if (!exists) {
                throw "Original ES index not found; no cloning occurred"
            }

            if (existsTarget) {
                throw "Target index name already exists"
            }

            try {
                const workNewInstance = await client.indices.create({
                    index: targetName
                })
                console.log("New index instance 111: ", workNewInstance)
                const existsNew = await client.indices.exists({ index: targetName })
                console.log("New index instance 222: ", existsNew)
                if (existsNew) {
                    const work = await client.reindex({
                        source: {
                            index: indexName
                        },
                        dest: {
                            index: targetName
                        }
                    })
                    .then( (response) => {
                        console.log("reindex response is: ", response)
                        return response
                    })
                    .catch( (error) => {
                        throw error
                    })

                    if (work !== null && work !== undefined) {
                        console.log("reindex work is: ", work)
                        return "ES successfully re-indexed into new index"
                    } else {
                        throw "Reindexing unsuccessful"
                    }
                }

            } catch(error) {
                throw error
            }

        } catch(error) {
            console.error('SERVICE es-interface reindexIndex error:', error)
            throw error
        }
    },

    /**
     *
     * ALIASES
     * 
     */

    async attachAliasToIndex(indexName:estypes.IndexName) {
        try {
            this.checkClient()
            const pluginConfig = await strapi.config.get('plugin.esplugin')
            const aliasName = pluginConfig.indexAliasName
            const aliasExists = await client.indices.existsAlias({ name: aliasName })
            const esInterface = strapi.plugins['esplugin'].services.esInterface

            if (aliasExists) {
                await client.indices.deleteAlias({ index: '*', name: aliasName })
            }

            const indexExists = await client.indices.exists({ index: indexName })

            if (!indexExists) {
                await esInterface.createIndex(indexName)
            }
            await client.indices.putAlias({ index: indexName, name: aliasName })
            return "Success - Alias attached to index"

        } catch(error) {
            if (error.message.includes('ECONNREFUSED')) {
                console.error('SERVICE es-interface attachAliasToIndex error: Connection to ElasticSearch refused error:', error)
            } else {
                console.error('SERVICE es-interface attachAliasToIndex error:', error)
            }
            throw error
        }
    },


    /**
     *
     * MAPPINGS
     * 
     */

    async toggleDynamicMapping(indexName:estypes.IndexName) {

        try {
            console.log("toggleDynamicMapping 111")
            this.checkClient()
            console.log("toggleDynamicMapping 222")
            let workCheck = await client.indices.exists({ index: indexName })
            console.log("toggleDynamicMapping 333", workCheck)
            if (workCheck) {
                console.log("toggleDynamicMapping 444")
                let mapping = await client.indices.getMapping({ index: indexName })
                console.log("toggleDynamicMapping 555")
                //mapping.dynamic = !mapping.dynamic
                console.log("toggleDynamicMapping 666")
                this.updateMapping({indexName, mapping})
                console.log("toggleDynamicMapping 777")
            }
            return "Success - Dynamic mapping toggled on ES"
        } catch(error) {
            console.error('SERVICE es-interface toggleDynamicMapping error:', error)
            throw error
        }
    },

    async getMapping(indexName:estypes.IndexName) {

        try {

            this.checkClient()

            let workCheck = await client.indices.exists({ index: indexName })
           
            if (workCheck) {
                return await client.indices.getMapping({ index: indexName })
                // TODO: Does this catch and throw matter? What if we eliminate it?
                .catch((error) => {
                    throw error
                })
            } else {
                throw "No index found"
            }

        } catch(error) {
            console.error('SERVICE es-interface getMapping error:', error)
            throw error
        }

    },

    async updateMapping({indexName, mapping}) {

        // NOTE: New new mappings can be added to an index.
        // or some properties of existing mappings.
        // However you cannot change the mapping itself for an existing index.

        try {

            if (mapping && Object.keys(mapping).length > 0) {
                this.checkClient()

                //console.log("es updateMapping 111 mapping:", mapping)
                //let mappingsFinal = { ...mapping }

                //console.log("es updateMapping 222 mappingsFinal:", mappingsFinal)

                await client.indices.putMapping({ index: indexName, ...mapping })
                return "Success - ES mapping updated"
            } else {
                throw 'No mapping supplied'
            }
        } catch(error) {
            console.error('SERVICE es-interface updateMapping error:', error)
            throw error
        }
    },


    /**
     *
     * INDEXING OF RECORDS
     * 
     */

    async indexRecordToSpecificIndex({ itemId, itemData }, indexName:estypes.IndexName) {
        try {
            this.checkClient()
            let work = await client.index({
                index: indexName,
                id: itemId,
                document: itemData
            })
            let workRefresh = await client.indices.refresh({ index: indexName })
            return "Success - record indexed on ES"
        } catch(error) {
            console.error('SERVICE es-interface indexRecordToSpecificIndex error:', error)
            throw error
        }
    },

    async indexRecordToSpecificIndex_NEW({ itemId, itemData }, index:RegisteredIndex) {
        try {
            this.checkClient()
            let work = await client.index({
                index: index.index_name,
                id: itemId,
                document: itemData
            })
            let workRefresh = await client.indices.refresh({ index: index.index_name })
            return "Success - record indexed on ES"
        } catch(error) {
            console.error('SERVICE es-interface indexRecordToSpecificIndex_NEW error:', error)
            throw error
        }
    },

    async indexData({itemId, itemData, index}) {
        //const pluginConfig = await strapi.config.get('plugin.esplugin')
        //return await this.indexRecordToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
        try {
            this.checkClient()
            const pluginConfig = await strapi.config.get('plugin.esplugin')
            return await this.indexRecordToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
        } catch(error) {
            console.error('SERVICE es-interface indexData error:', error)
            throw error
        }
    },

    async removeItemFromIndex({itemId}) {
        try {
            this.checkClient()

            const pluginConfig = await strapi.config.get('plugin.esplugin')
            const helper = strapi.plugins['esplugin'].services.helper
            const idxName = await helper.getCurrentIndexName()

            let work = await client.delete({
                index: idxName,
                id: itemId
            })
            let work2 = await client.indices.refresh({ index: idxName })
            return 'Delete success'
        } catch(error) {
            console.error('SERVICE es-interface removeItemFromIndex error:', error)
            throw error
        }
    },

    // async updateDataToSpecificIndex({ itemId, itemData }, iName) {
    //     try {
               //this.checkClient()
    //         await client.index({
    //             index: iName,
    //             id: itemId,
    //             document: itemData
    //         })
    //         await client.indices.refresh({ index: iName })
            // } catch(error) {
            //     console.error('SERVICE es-interface updateDataToSpecificIndex error:', error)
            //     throw error
            // }
    // },

    // async updateData({itemId, itemData}) {
    //     const pluginConfig = await strapi.config.get('plugin.esplugin')
    //     return await this.indexRecordToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    // },

    /**
     *
     * SEARCHING
     * 
     */

    async searchData(searchQuery) {

        // TODO: Typescript would help here.
        // searchQuery needs to be in a shape that ES understands, otherwise 500 error will be thrown.
        // Example:
        // query: {
        //     match: {
        //         Title: 'Cogo atqui ver utroq'
        //     }
        // }

        try {

            this.checkClient()
            const pluginConfig = await strapi.config.get('plugin.esplugin')

            // DOCS FOR PAGING ES:
            // https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html

            const result = await client.search({
                index: pluginConfig.indexAliasName,
                from: 0,
                size: 9999, // Note: Without this, size will default to ES default (e.g. 10). Also, shard default max is like 10000.
                ...searchQuery
            })
            
            return result
        } catch(error) {
            console.error('SERVICE es-interface searchData error:', error)
            throw error
        }
    }

})