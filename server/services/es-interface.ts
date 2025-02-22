import { Client } from "@elastic/elasticsearch"
import { estypes } from '@elastic/elasticsearch'
import fs from "fs"
import path from "path"

// TODO: Apply proper typing here
let client // = null

export default ({ strapi }) => ({

    // new elasticsearch.Client({
    //     host: bonsai_url,
    //     log: 'trace'
    // });

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

        } catch (err) {
            if (err.message.includes('ECONNREFUSED')) {
                console.error('SPE - Connection to ElasticSearch at ', host, ' refused.')
                console.error(err)
            } else {
                console.error('SPE - Error while initializing connection to ElasticSearch.')
                console.error(err)
            }
            throw(err)
        }
    },

    async createIndex(indexName:estypes.IndexName) {
        try {
            const exists = await client.indices.exists({ index: indexName })

            if (!exists) {

                let work = await client.indices.create({
                    index: indexName,
                    mappings: {
                        dynamic: false
                    }
                })
                return work
            }
        } catch (err) {
            if (err.message.includes('ECONNREFUSED')) {
                console.log('SPE - Error while creating index - connection to ElasticSearch refused.')
                console.log(err)
            } else {
                console.log('SPE - Error while creating index.')
                console.log(err)
            }
        }
    },

    async getIndexes() {
        try {
            console.log("Try getIndexes 111")
            //const exists = await client.indices.get({ index: "my-index-000001" })
            
            //WORKS: 
            //const indexes = await client.indices.get({ index: "_all" })
            const indexes = await client.indices.get({ index: "*" })
            console.log("Try getIndexes 222", indexes)
            if (indexes) {
                return indexes
            }
        } catch(err) {
            if (err.message.includes('ECONNREFUSED')) {
                console.log('SPE - getIndexes - Connection to ElasticSearch refused.')
                console.log(err)
            } else {
                console.log('SPE - getIndexes - Error while getting ES indexes.')
                console.log(err)
            }
        }
    },

    async deleteIndex(indexName:estypes.IndexName) {
        try {
            const exists = await client.indices.exists({ index: indexName })
            if (exists) {
                await client.indices.delete({
                    index: indexName
                })
                return 'ES interface success'
            }
        } catch(err) {
            if (err.message.includes('ECONNREFUSED')) {
                console.log('SPE - Connection to ElasticSearch refused.')
                console.log(err)
            } else {
                console.log('SPE - Error while deleting index to ElasticSearch.')
                console.log(err)
            }
        }
    },

    async attachAliasToIndex(indexName:estypes.IndexName) {
        try {
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

        } catch(err) {
            if (err.message.includes('ECONNREFUSED')) {
                console.log('SPE - Attaching alias to the index - Connection to ElasticSearch refused.')
                console.log(err)
            } else {
                console.log('SPE - Attaching alias to the index - Error while setting up alias within ElasticSearch.')
                console.log(err)
            }
        }
    },

    async checkESConnection() {
        if (!client) {
            return false
        }

        try {
            await client.ping()
            return true
        } catch(error) {
            console.error('SPE - Could not connect to Elastic search.')
            console.error(error)
            return false
        }
    },

    async getMapping(indexName:estypes.IndexName) {

        // NOTE: New mappings can be added to an index.
        // or some properties of existing mappings.
        // However you cannot change the mapping itself for an existing index.

        if (!client) {
            return "ES connection problem"
        }

        let workCheck = await client.indices.exists({ index: indexName })

        if (workCheck) {
            return await client.indices.getMapping({ index: indexName })
            .catch((error) => {
                console.error('SPE - getMapping error', error)
                return error
            })
        }
         else {
            return "No index found"
        }
        //return

    },

    async updateMapping({indexName, mapping}) {

        // NOTE: New new mappings can be added to an index.
        // or some properties of existing mappings.
        // However you cannot change the mapping itself for an existing index.

        if (!client) {
            return false
        }


        let mappingsFinal = 
            {
                ...mapping,

                // TODO: Old stuff, remove, but make sure the equivalent from UI works.
                properties: {
                    "pin": {
                        type: "geo_point",
                        index: true
                    },
                    "Participants": {
                        type: "nested"
                    },
                    "Organizers": {
                        type: "nested"
                    },
                    "child_terms": {
                        type: "nested"
                    },                            
                    // "uuid": {
                    //     type: "string",
                    //     index: "not_analyzed"
                    // }
                }
            }

        try {
            await client.indices.putMapping({
                index: indexName,
                properties: mappingsFinal,
              })
            return true
        } catch(error) {
            console.error('SPE - updateMapping error')
            console.error(error)
            return false
        }
    },

    async indexRecordToSpecificIndex({ itemId, itemData }, indexName:estypes.IndexName) {
        try {
            let work = await client.index({
                index: indexName,
                id: itemId,
                document: itemData
            })
            let workRefresh = await client.indices.refresh({ index: indexName })
        } catch(err) {
            console.log('SPE - Error encountered while indexing data to ElasticSearch.')
            console.log(err)
            throw err
        }
    },

    async indexData({itemId, itemData}) {
        const pluginConfig = await strapi.config.get('plugin.esplugin')
        return await this.indexRecordToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    },

    async removeItemFromIndex({itemId}) {
        const pluginConfig = await strapi.config.get('plugin.esplugin')
        const helper = strapi.plugins['esplugin'].services.helper
        const idxName = await helper.getCurrentIndexName()
        try {
            let work = await client.delete({
                index: idxName,
                id: itemId
            })
            let work2 = await client.indices.refresh({ index: idxName })
            return 'Delete success'
        } catch(err) {
            if (err.meta.statusCode === 404) {
                console.error('SPE - The entry to be removed from the index already does not exist.', err)
            } else {
                console.error('SPE - Error encountered while removing indexed data from ElasticSearch.', err)
            }
            throw err
        }
    },

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
        } catch(err) {
            console.log('SPE - Search: elasticClient.searchData: Error encountered while making a search request to ElasticSearch.')
            throw err
        }
    },


    // async updateDataToSpecificIndex({ itemId, itemData }, iName) {
    //     try {
    //         await client.index({
    //             index: iName,
    //             id: itemId,
    //             document: itemData
    //         })
    //         await client.indices.refresh({ index: iName })
    //     } catch(err) {
    //         console.log('SPE - Error encountered while indexing data to ElasticSearch.')
    //         console.log(err)
    //         throw err
    //     }
    // },

    // async updateData({itemId, itemData}) {
    //     const pluginConfig = await strapi.config.get('plugin.esplugin')
    //     return await this.indexRecordToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    // },
})