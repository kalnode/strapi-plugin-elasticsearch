const { Client } = require('@elastic/elasticsearch')
const fs = require('fs')
const path = require('path')

let client = null

module.exports = ({ strapi }) => ({

    // new elasticsearch.Client({
    //     host: bonsai_url,
    //     log: 'trace'
    // });

    async initializeSearchEngine({ hostfull, host, uname, password, cert }) {
        try {
            console.log("ES initializeSearchEngine 111")

            if (hostfull) {
                client = await new Client({
                    node: hostfull,
                    log: 'trace',
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
                    log: 'trace',

                    // KAL - Disabling tls to get Strapi working on Heroku deploy.
                    // Possibly don't need this because the ES instance is on the same host (perhaps we need to restrict it to same-domain?)... or... Heroku handles SSL outside of the app running on the instance.
                    tls: {
                        //ca: fs.readFileSync('./config'+cert), //fs.readFileSync('./http_ca.crt'), //cert,
                        rejectUnauthorized: false
                    }
                })
            }
            console.log("ES initializeSearchEngine 222")

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

    async createIndex(indexName) {
        try {
            const exists = await client.indices.exists({ index: indexName })

            if (!exists) {
                console.log('SPE - createIndex: ', indexName, ' does not exist. Creating index & mapping.')

                let work = await client.indices.create({
                    index: indexName,

                    // Kal - Define custom mappings
                    // TODO: Ideally these are controllable via UI for specific fields
                    mappings: {
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

                })

                console.log("ES interface create index work is:", work)
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

    async deleteIndex(indexName) {
        try {
            console.log("Try deleteIndex 111", indexName)
            const exists = await client.indices.exists({ index: indexName })

            console.log("Try deleteIndex 222", exists)
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

    async attachAliasToIndex(indexName) {
        try {
            const pluginConfig = await strapi.config.get('plugin.elasticsearch')
            const aliasName = pluginConfig.indexAliasName
            const aliasExists = await client.indices.existsAlias({ name: aliasName })

            if (aliasExists) {
                //console.log('SPE - attachAliasToIndex: Alias with this name already exists, removing it.')
                await client.indices.deleteAlias({ index: '*', name: aliasName })
            }

            const indexExists = await client.indices.exists({ index: indexName })

            if (!indexExists) {
                await this.createIndex(indexName)
            }

            //console.log('SPE - attachAliasToIndex: ', aliasName, ' to index : ', indexName)
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

    async indexDataToSpecificIndex({ itemId, itemData }, iName) {

       // console.log("indexDataToSpecificIndex 333:") //, itemData)
        try {
            let indexName = iName
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
        //console.log("ES plugin indexData", itemId)
        const pluginConfig = await strapi.config.get('plugin.elasticsearch')
        return await this.indexDataToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    },

    async removeItemFromIndex({itemId}) {
        console.log("removeItemFromIndex itemId is: ", itemId)
        const pluginConfig = await strapi.config.get('plugin.elasticsearch')
        const helper = strapi.plugins['elasticsearch'].services.helper
        const idxName = await helper.getCurrentIndexName()

        console.log("getCurrentIndexName is: ", idxName)
        try {
            let work = await client.delete({
                index: idxName,
                id: itemId
            })
            console.log("Delete work is: ", work)
            let work2 = await client.indices.refresh({ index: idxName })
            console.log("Refresh work is: ", work2)
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
            const pluginConfig = await strapi.config.get('plugin.elasticsearch')

            console.log("Helllo 111", searchQuery)

            // DOCS FOR PAGING ES:
            // https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html

            const result = await client.search({
                index: pluginConfig.indexAliasName,
                from: 0,
                size: 9999, // Note: Without this, size will default to ES default (e.g. 10). Also, shard default max is like 10000.
                ...searchQuery
            })

            console.log("Helllo 222")

            
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
    //     const pluginConfig = await strapi.config.get('plugin.elasticsearch')
    //     return await this.indexDataToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    // },
})