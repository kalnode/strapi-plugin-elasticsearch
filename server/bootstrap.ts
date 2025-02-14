'use strict'

export default async ({ strapi }) => {

    // TODO: Move cron and lifecycle events to a separate file, like "lifecycle.ts".
    // Why: Easier for future devs troubleshooting real-time events to just open a file "lifecycles" to see all real-time events in one place without extra fluff.

    const pluginConfig = await strapi.config.get('plugin.elasticsearch') // Grabs hardcoded plugin config from Strapi root ./config/plugins
    const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
    const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing
    const esInterface = strapi.plugins['elasticsearch'].services.esInterface
    const performIndexing = strapi.plugins['elasticsearch'].services.performIndexing
    const helper = strapi.plugins['elasticsearch'].services.helper

    const getPluginStore = () => {
        return strapi.store({
            environment: '', // TODO: What's this for ?
            type: 'plugin',
            name: 'elasticsearch' // TODO: Scrutinize this name; what is it and should it not be the full unique plugin name?
        })
    }

    try {

        await configureIndexingService.initializeStrapiElasticsearch()

        // PLUGIN CONFIG - NO ES CONNECTION PROPERTIES; fail
        if (!Object.keys(pluginConfig).includes('searchConnector')) {
            console.warn("The plugin strapi-plugin-elasticsearch is enabled but the searchConnector is not configured.")

        // PLUGIN CONFIG - ALL GOOD
        } else {

            const connector = pluginConfig['searchConnector']

            await esInterface.initializeSearchEngine({
                hostfull: connector.hostfull,
                host: connector.host,
                uname: connector.username,
                password: connector.password,
                cert: connector.certificate
            })

            // CRON
            // If Cron config not set, we log a warning.
            if (!Object.keys(pluginConfig).includes('indexingCronSchedule')) {
                console.warn("The plugin strapi-plugin-elasticsearch is enabled but the indexingCronSchedule is not configured.")

            // Setup cron
            } else {

                strapi.cron.add({

                    elasticsearchIndexing: {
                        task: async ({ strapi }) => {

                            // TODO: Do we need to re-get plugin store on each cron cycle, or can this be moved to global
                            console.log("WTF 111: ", strapi.elasticsearch.collections)

                            const pluginStore = getPluginStore()
                            const settings = JSON.parse(await pluginStore.get({ key: 'configsettings' }))
                            if (settings) {
                                // Cron can be enabled/disabled via plugin UI settings, so we check that here.
                                // TODO: Future: Instant vs Scheduled may be dictated by individual indexes, which will change this logic.
                                if (settings['settingIndexingEnabled'] && !settings['settingInstantIndex']) {
                                    console.log("CRON TASK: settingIndexingEnabled is enabled; doing work")
                                    await performIndexing.indexPendingData()
                                }
                            } else {
                                console.log("CRON ERROR - Could not get config settings")
                            }
                        },
                        options: {
                            rule: pluginConfig['indexingCronSchedule']
                        }
                    }

                })
            }
        
            // TODO: Why is this done; why do we do "alias attachment"? 
            if (await esInterface.checkESConnection()) {
                //Attach the alias to the current index:
                const idxName = await helper.getCurrentIndexName()
                await esInterface.attachAliasToIndex(idxName)
            }
            
        }

        // ============================
        // LIFECYCLES
        // ============================

        strapi.db.lifecycles.subscribe(async (event) => {

            // ------------------------------
            // afterCreate / afterUpdate
            // ------------------------------
            if (event.action === 'afterCreate' || event.action === 'afterUpdate') {

                if (strapi.elasticsearch.collections.includes(event.model.uid)) {

                    // Collection without draft-publish
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
                    const settings = JSON.parse(await pluginStore.get({ key: 'configsettings' }))
                    const ctx = strapi.requestContext.get()

                    if (settings) {
                        if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                            console.log("afterCreate instantIndex enabled, doing index work")
                            await performIndexing.indexPendingData()
                        }
                        ctx.response.body = { status: 'success', data: event.result }
                    } else {
                        ctx.response.body = { status: 'error', data: "ES afterCreate/afterUpdate - Could not get config settings" }
                    }
                }
            }

            // ------------------------------
            // afterCreateMany / afterUpdateMany
            // ------------------------------
            if (event.action === 'afterCreateMany' || event.action === 'afterUpdateMany') {
                if (strapi.elasticsearch.collections.includes(event.model.uid)) {
                    if (Object.keys(event.params.where.id).includes('$in')) {
                        const updatedItemIds = event.params.where.id['$in']

                        // Bulk unpublish
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
                        const settings = JSON.parse(await pluginStore.get({ key: 'configsettings' }))
                        const ctx = strapi.requestContext.get()
                        if (settings) {
                            if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                                console.log("afterCreateMany instantIndex enabled, doing index work")
                                await performIndexing.indexPendingData()
                            }
                            ctx.response.body = { status: 'success', data: event.result }
                        } else {
                            ctx.response.body = { status: 'error', data: "ES afterCreateMany/afterUpdateMany - Could not get configsettings" }
                        }

                    }
                }
            }

            // ------------------------------
            // afterDelete
            // ------------------------------
            if (event.action === 'afterDelete') {
                if (strapi.elasticsearch.collections.includes(event.model.uid)) {
                    await scheduleIndexingService.removeItemFromIndex({
                        collectionUid: event.model.uid,
                        recordId: event.result.id
                    })

                    const pluginStore = getPluginStore()
                    const settings = JSON.parse(await pluginStore.get({ key: 'configsettings' }))
                    const ctx = strapi.requestContext.get()
                    if (settings) {
                        if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                            console.log("afterDelete instantIndex enabled, doing index work")
                            await performIndexing.indexPendingData()
                        }
                        ctx.response.body = { status: 'success', data: event.result }
                    } else {
                        ctx.response.body = { status: 'error', data: "ES afterDelete - Could not get configsettings" }
                    }
                }
            }

            // ------------------------------
            // afterDeleteMany
            // ------------------------------
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
                        const settings = JSON.parse(await pluginStore.get({ key: 'configsettings' }))
                        const ctx = strapi.requestContext.get()
                        if (settings) {
                            if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                                console.log("afterDeleteMany instantIndex enabled, doing index work")
                                await performIndexing.indexPendingData()
                            }
                            ctx.response.body = { status: 'success', data: event.result }
                        } else {
                            ctx.response.body = { status: 'error', data: "ES afterDeleteMany - Could not get configsettings" } 
                        }                        
                    }
                }
            }
        })

        // ============================
        // FINISH PLUGIN INITIALIZATION
        // ============================
        configureIndexingService.markInitialized()

    } catch (err) {
        // TODO: Pass-in plugin name here; get rid of hardcoded name.
        console.error('An error was encountered while initializing the strapi-plugin-elasticsearch plugin.')
        console.error(err)
    }  
}
