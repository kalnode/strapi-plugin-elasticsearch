const { Client } = require('@elastic/elasticsearch')
const fs = require('fs')
const path = require('path')

let client = null

module.exports = ({ strapi }) => ({

    async initializeSearchEngine({ host, uname, password, cert }) {
        try {
            client = new Client({
                node: host,
                auth: {
                    username: uname,
                    password: password
                },
                tls: {
                    ca: cert,
                    rejectUnauthorized: false
                }
            })
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

                await client.indices.create({
                    index: indexName,

                    // Kal - Define mapping for map pin
                    mappings: {
                        properties: {
                            "pin": {
                                type: "geo_point",
                                index: true
                            }
                        }
                    }

                })
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
            await client.indices.delete({
                index: indexName
            })
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
                console.log('SPE - attachAliasToIndex: Alias with this name already exists, removing it.')
                await client.indices.deleteAlias({ index: '*', name: aliasName })
            }

            const indexExists = await client.indices.exists({ index: indexName })

            if (!indexExists) {
                await this.createIndex(indexName)
            }

            console.log('SPE - attachAliasToIndex: ', aliasName, ' to index : ', indexName)
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
        try {
            await client.index({
                index: iName,
                id: itemId,
                document: itemData
            })
            await client.indices.refresh({ index: iName })
        } catch(err) {
            console.log('SPE - Error encountered while indexing data to ElasticSearch.')
            console.log(err)
            throw err
        }
    },

    async indexData({itemId, itemData}) {
        const pluginConfig = await strapi.config.get('plugin.elasticsearch')
        return await this.indexDataToSpecificIndex({ itemId, itemData }, pluginConfig.indexAliasName)
    },

    async removeItemFromIndex({itemId}) {
        const pluginConfig = await strapi.config.get('plugin.elasticsearch')
        try {
            await client.delete({
                index: pluginConfig.indexAliasName,
                id: itemId
            })
            await client.indices.refresh({ index: pluginConfig.indexAliasName })
        } catch(err) {
            if (err.meta.statusCode === 404) {
                console.error('SPE - The entry to be removed from the index already does not exist.')
            } else {
                console.error('SPE - Error encountered while removing indexed data from ElasticSearch.')
                throw err
            }
        }
    },

    async searchData(searchQuery) {
        try {
            const pluginConfig = await strapi.config.get('plugin.elasticsearch')
            const result= await client.search({
                index: pluginConfig.indexAliasName,
                ...searchQuery
            })
            return result
        } catch(err) {
            console.log('SPE - Search: elasticClient.searchData: Error encountered while making a search request to ElasticSearch.')
            throw err
        }
    }
})