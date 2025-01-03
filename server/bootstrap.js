'use strict';

module.exports = async ({ strapi }) => {

    const getPluginStore = () => {
        return strapi.store({
            environment: '',
            type: 'plugin',
            name: 'elasticsearch'
        })
    }
    

    const pluginConfig = await strapi.config.get('plugin.elasticsearch')
    const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
    const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing
    const esInterface = strapi.plugins['elasticsearch'].services.esInterface
    const indexer = strapi.plugins['elasticsearch'].services.indexer
    const helper = strapi.plugins['elasticsearch'].services.helper

    try {
        await configureIndexingService.initializeStrapiElasticsearch()

        if (!Object.keys(pluginConfig).includes('indexingCronSchedule')) {
            console.warn("The plugin strapi-plugin-elasticsearch is enabled but the indexingCronSchedule is not configured.")
        } else if (!Object.keys(pluginConfig).includes('searchConnector')) {
            console.warn("The plugin strapi-plugin-elasticsearch is enabled but the searchConnector is not configured.")
        } else {
            console.warn("ES bootstrap 11223344")
            const connector = pluginConfig['searchConnector']
            await esInterface.initializeSearchEngine({hostfull: connector.hostfull, host: connector.host, uname: connector.username, password: connector.password, cert: connector.certificate})
            strapi.cron.add({
                elasticsearchIndexing: {
                    task: async ({ strapi }) => {
                        const pluginStore = getPluginStore()
                        const settings = await pluginStore.get({ key: 'configsettings' })
                        if (settings) {
                            const objSettings = JSON.parse(settings)
                            if (objSettings['settingIndexingEnabled'] && !objSettings['settingInstantIndex']) {
                                console.log("CRON TASK: settingIndexingEnabled is enabled; doing work")
                                await indexer.indexPendingData()
                            } else {
                                console.log("CRON TASK: NOT doing work")
                            }
                        }
                    },
                    options: {
                        rule: pluginConfig['indexingCronSchedule']
                    }
                }
            })
        
            if (await esInterface.checkESConnection()) {
                //Attach the alias to the current index:
                const idxName = await helper.getCurrentIndexName()
                await esInterface.attachAliasToIndex(idxName)
            }
            
        }
  
        strapi.db.lifecycles.subscribe(async (event) => {


            
            if (event.action === 'afterCreate' || event.action === 'afterUpdate') {

                if (event.action === 'afterUpdate') {
                    console.log("ES lifecycle afterUpdate triggered 112233", event.action)
                }

                if (strapi.elasticsearch.collections.includes(event.model.uid)) {

                    //console.log("es watch afterUpdate", event)

                    //collection without draft-publish
                    if (typeof event.model.attributes.publishedAt === "undefined") {
                        await scheduleIndexingService.addItemToIndex({
                            collectionUid: event.model.uid,
                            recordId: event.result.id
                        })

                        //await indexer.indexPendingData()

                        //await setTimeout( async () => {
                         //   console.log("es watch index DONE 111")                
                        //}, 5000)


                    } else if (event.model.attributes.publishedAt) {
                        if (event.result.publishedAt) {
                            await scheduleIndexingService.addItemToIndex({
                                collectionUid: event.model.uid,
                                recordId: event.result.id
                            })

                           // let work2 = await indexer.indexPendingData()

                            //await setTimeout(() => {
                          //  console.log("es watch index DONE 222", work2)   
                            
                            
                           // console.log("es watch afterUpdate", ctx)
                           // ctx.response.body = { status: 'success', data: event.result }
                            //}, 5000)
                        } else {
                            //unpublish
                            await scheduleIndexingService.removeItemFromIndex({
                                collectionUid: event.model.uid,
                                recordId: event.result.id
                            })
                        }
                    }

                    const pluginStore = getPluginStore()
                    const settings = await pluginStore.get({ key: 'configsettings' })
                    if (settings) {
                        const objSettings = JSON.parse(settings)
                        if (objSettings['settingIndexingEnabled'] && objSettings['settingInstantIndex']) {
                            console.log("afterCreate instantIndex enabled, doing index work")
                            await indexer.indexPendingData()
                        }
                    }

                    // Get the request config
                    //const ctx = strapi.requestContext.get()
                    const ctx = strapi.requestContext.get()

                    //console.log(ctx?.state?.user);
                    //console.log("es watch afterUpdate", ctx)

                    ctx.response.body = { status: 'success', data: event.result }
                }
            }

            //bulk publish-unpublish from list view
            if (event.action === 'afterCreateMany' || event.action === 'afterUpdateMany') {
                if (strapi.elasticsearch.collections.includes(event.model.uid)) {
                    if (Object.keys(event.params.where.id).includes('$in')) {
                        const updatedItemIds = event.params.where.id['$in']

                        //bulk unpublish
                        if (typeof event.params.data.publishedAt === "undefined" || event.params.data.publishedAt === null) {
                            for (let k = 0; k< updatedItemIds.length; k++) {
                                await scheduleIndexingService.removeItemFromIndex({
                                    collectionUid: event.model.uid,
                                    recordId: updatedItemIds[k]
                                })
                            }    
                        } else {
                            for (let k = 0; k< updatedItemIds.length; k++) {
                                await scheduleIndexingService.addItemToIndex({
                                    collectionUid: event.model.uid,
                                    recordId: updatedItemIds[k]
                                })


                            }
                        }

                        const pluginStore = getPluginStore()
                        const settings = await pluginStore.get({ key: 'configsettings' })
                        if (settings) {
                            const objSettings = JSON.parse(settings)
                            if (objSettings['settingIndexingEnabled'] && objSettings['settingInstantIndex']) {
                                console.log("afterCreateMany instantIndex enabled, doing index work")
                                await indexer.indexPendingData()
                            }
                        }

                        const ctx = strapi.requestContext.get()   
                        ctx.response.body = { status: 'success', data: event.result }
                    }
                }
            }    

            if (event.action === 'afterDelete') {
                if (strapi.elasticsearch.collections.includes(event.model.uid)) {
                    await scheduleIndexingService.removeItemFromIndex({
                        collectionUid: event.model.uid,
                        recordId: event.result.id
                    })

                    const pluginStore = getPluginStore()
                    const settings = await pluginStore.get({ key: 'configsettings' })
                    if (settings) {
                        const objSettings = JSON.parse(settings)
                        if (objSettings['settingIndexingEnabled'] && objSettings['settingInstantIndex']) {
                            console.log("afterDelete instantIndex enabled, doing index work")
                            await indexer.indexPendingData()
                        }
                    }

                    const ctx = strapi.requestContext.get()   
                    ctx.response.body = { status: 'success', data: event.result }
                }
            }

            if (event.action === 'afterDeleteMany') {
                if (strapi.elasticsearch.collections.includes(event.model.uid)) {
                    if (Object.keys(event.params.where).includes('$and') &&
                    Array.isArray(event.params.where['$and']) &&
                    Object.keys(event.params.where['$and'][0]).includes('id') && 
                    Object.keys(event.params.where['$and'][0]['id']).includes('$in')) {
                        const deletedItemIds = event.params.where['$and'][0]['id']['$in']
                        for (let k = 0; k< deletedItemIds.length; k++) {
                            await scheduleIndexingService.removeItemFromIndex({
                                collectionUid: event.model.uid,
                                recordId: deletedItemIds[k]
                            })

                            
                        }

                        const pluginStore = getPluginStore()
                        const settings = await pluginStore.get({ key: 'configsettings' })
                        if (settings) {
                            const objSettings = JSON.parse(settings)
                            if (objSettings['settingIndexingEnabled'] && objSettings['settingInstantIndex']) {
                                console.log("afterDeleteMany instantIndex enabled, doing index work")
                                await indexer.indexPendingData()
                            }
                        }

                        const ctx = strapi.requestContext.get()   
                        ctx.response.body = { status: 'success', data: event.result }
                    }
                }
            }
        })

        configureIndexingService.markInitialized()

    } catch(err) {
        console.error('An error was encountered while initializing the strapi-plugin-elasticsearch plugin.')
        console.error(err)
    }  
}
