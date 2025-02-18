'use strict'

export default async ({ strapi }) => {

    // TODO: Move cron and lifecycle events to a separate file, like "lifecycle.ts".
    // Why: Easier for future devs troubleshooting real-time events to just open a file "lifecycles" to see all real-time events in one place without extra fluff.

    const pluginConfig = await strapi.config.get('plugin.esplugin') // Grabs hardcoded plugin config from Strapi root ./config/plugins
    const esInterface = strapi.plugins['esplugin'].services.esInterface
    const helper = strapi.plugins['esplugin'].services.helper
    const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
    const scheduleIndexingService = strapi.plugins['esplugin'].services.scheduleIndexing
    const performIndexing = strapi.plugins['esplugin'].services.performIndexing

    try {

        await configureIndexingService.initializeESPlugin()

        // PLUGIN CONFIG - NO ES CONNECTION PROPERTIES; fail
        if (!Object.keys(pluginConfig).includes('searchConnector')) {
            console.warn("The es plugin is enabled but the searchConnector is not configured.")

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
                console.warn("The es plugin is enabled but the indexingCronSchedule is not configured.")

            // Setup cron
            } else {

                strapi.cron.add({

                    elasticsearchIndexing: {
                        task: async ({ strapi }) => {
                            const settings = strapi.espluginCache.settings
                            if (settings) {
                                // Cron can be enabled/disabled via plugin UI settings, so we check that here.
                                // TODO: Future: Instant vs Scheduled may be dictated by individual indexes, which will change this logic.

                                // TODO: We need to make default setting for these things, because these won't work until user toggles them in plugin ui at least once.
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

            //console.log("ES LIFECYCLE", event)

            // ------------------------------
            // afterCreate / afterUpdate
            // ------------------------------
            if (event.action === 'afterCreate' || event.action === 'afterUpdate') {

                console.log("ES LIFECYCLE - afterCreate / afterUpdate", event.action)

                // TODO: After dev, remove these lines and uncomment the same lines at the INSTANT WORK step below
                const settings = strapi.espluginCache.settings

                if (settings['useNewPluginParadigm']) {

                    if (strapi.espluginCache.posttypes.includes(event.model.uid)) {

                        //console.log("-------- Strapi collections is: ", strapi.espluginCache.collections)
                        console.log("-------- Strapi posttypes is: ", strapi.espluginCache)
                        //strapi.espluginCache.posttypes

                        const payload = {
                            indexName: 'foo',
                            collectionUid: event.model.uid,
                            recordId: event.result.id
                        }

                        // POST TYPE DOES NOT HAVE DRAFT-PUBLISH
                        if (typeof event.model.attributes.publishedAt === "undefined") {

                            // TODO: If instant index, do it right away rather than schedule it as a task
                            await scheduleIndexingService.addOrUpdateItemToIndex(payload)

                        // POST TYPE HAS DRAFT-PUBLISH
                        } else if (event.model.attributes.publishedAt) {

                            // PUBLISH
                            if (event.result.publishedAt) {
                                await scheduleIndexingService.addOrUpdateItemToIndex(payload)

                            // UNPUBLISH
                            } else {                                
                                await scheduleIndexingService.removeItemFromIndex(payload)
                            }
                        }

                        // INSTANT WORK
                        const ctx = strapi.requestContext.get()
                        if (settings) {
                            console.log("Settings found, doing instant work")
                            if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                                console.log("afterCreate instantIndex enabled, doing index work")
                                await performIndexing.indexPendingData()
                            }
                            ctx.response.body = { status: 'success', data: event.result }
                        } else {
                            console.log("Settings NOT FOUND")
                            ctx.response.body = { status: 'error', data: "ES afterCreate/afterUpdate - Could not get config settings" }
                        }
                    }

                } else {

                    // GET LIST OF TYPES THAT ARE REGISTERED FOR INDEXING
                    if (strapi.espluginCache.collections.includes(event.model.uid)) {

                        const payload = {
                            indexName: 'foo',
                            collectionUid: event.model.uid,
                            recordId: event.result.id
                        }

                        // POST TYPE DOES NOT HAVE DRAFT-PUBLISH
                        if (typeof event.model.attributes.publishedAt === "undefined") {

                            // TODO: If instant index, do it right away rather than schedule it as a task
                            await scheduleIndexingService.addOrUpdateItemToIndex(payload)

                        // POST TYPE HAS DRAFT-PUBLISH
                        } else if (event.model.attributes.publishedAt) {
                            if (event.result.publishedAt) {
                                await scheduleIndexingService.addOrUpdateItemToIndex(payload)
                            } else {
                                // Unpublish
                                await scheduleIndexingService.removeItemFromIndex(payload)
                            }
                        }

                        // INSTANT WORK

                        const ctx = strapi.requestContext.get()

                        if (settings) {
                            console.log("Settings found, doing instant work")
                            if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                                console.log("afterCreate instantIndex enabled, doing index work")
                                await performIndexing.indexPendingData()
                            }
                            ctx.response.body = { status: 'success', data: event.result }
                        } else {
                            console.log("Settings NOT FOUND")
                            ctx.response.body = { status: 'error', data: "ES afterCreate/afterUpdate - Could not get config settings" }
                        }
                    }

                }
            }

            // ------------------------------
            // afterCreateMany / afterUpdateMany
            // ------------------------------
            if (event.action === 'afterCreateMany' || event.action === 'afterUpdateMany') {
                if (strapi.espluginCache.collections.includes(event.model.uid)) {
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
                                await scheduleIndexingService.addOrUpdateItemToIndex({
                                    collectionUid: event.model.uid,
                                    recordId: updatedItemIds[k]
                                })
                            }
                        }

                        // INSTANT WORK
                        const settings = strapi.espluginCache.settings
                        const ctx = strapi.requestContext.get()
                        if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                            console.log("afterCreateMany instantIndex enabled, doing index work")
                            await performIndexing.indexPendingData()
                        }
                        ctx.response.body = { status: 'success', data: event.result }

                    }
                }
            }

            // ------------------------------
            // afterDelete
            // ------------------------------
            if (event.action === 'afterDelete') {
                if (strapi.espluginCache.collections.includes(event.model.uid)) {

                    await scheduleIndexingService.removeItemFromIndex({
                        collectionUid: event.model.uid,
                        recordId: event.result.id
                    })

                    // INSTANT WORK
                    const settings = strapi.espluginCache.settings
                    const ctx = strapi.requestContext.get()
                    if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                        console.log("afterDelete instantIndex enabled, doing index work")
                        await performIndexing.indexPendingData()
                    }
                    ctx.response.body = { status: 'success', data: event.result }

                }
            }

            // ------------------------------
            // afterDeleteMany
            // ------------------------------
            if (event.action === 'afterDeleteMany') {

                if (strapi.espluginCache.collections.includes(event.model.uid)) {
                    if (Object.keys(event.params.where).includes('$and')
                    && Array.isArray(event.params.where['$and'])
                    && Object.keys(event.params.where['$and'][0]).includes('id')
                    && Object.keys(event.params.where['$and'][0]['id']).includes('$in')) {

                        const deletedItemIds = event.params.where['$and'][0]['id']['$in']
                        for (let k = 0; k< deletedItemIds.length; k++) {
                            await scheduleIndexingService.removeItemFromIndex({
                                collectionUid: event.model.uid,
                                recordId: deletedItemIds[k]
                            })                            
                        }

                        // INSTANT WORK
                        const settings = strapi.espluginCache.settings
                        const ctx = strapi.requestContext.get()
                        if (settings['settingIndexingEnabled'] && settings['settingInstantIndex']) {
                            console.log("afterDeleteMany instantIndex enabled, doing index work")
                            await performIndexing.indexPendingData()
                        }
                        ctx.response.body = { status: 'success', data: event.result }

                    }
                }
            }
        })

        // ============================
        // FINISH PLUGIN INITIALIZATION
        // ============================
        configureIndexingService.pluginFinalize()

    } catch (err) {
        // TODO: Pass-in plugin name here; get rid of hardcoded name.
        console.error('An error was encountered while initializing the es plugin.')
        console.error(err)
    }  
}
