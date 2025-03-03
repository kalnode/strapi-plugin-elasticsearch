'use strict'

// TODO: Ideally we load this, but this seems to break type generation in parent project Strapi root
//const helper = strapi.plugins['esplugin'].services.helper

// ERROR:
// > strapi ts:generate-types

// Error: Could not load js config file /Users/kal/Projects/sportpost/socialmeet/src/plugins/strapi-plugin-elasticsearch/strapi-server.js: Cannot read properties of undefined (reading 'services')
//     at loadJsFile (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/core/app-configuration/load-config-file.js:18:13)
//     at Module.loadFile (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/core/app-configuration/load-config-file.js:37:14)
//     at Object.loadPlugins (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/core/loaders/plugins/index.js:90:41)
//     at async Strapi.loadPlugins (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/Strapi.js:311:5)
//     at async Promise.all (index 3)
//     at async Strapi.register (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/Strapi.js:341:5)
//     at async action (/Users/kal/Projects/sportpost/socialmeet/node_modules/@strapi/strapi/dist/commands/actions/ts/generate-types/action.js:12:15)

//  *  The terminal process "/bin/zsh '-c', 'npm run 'strapi gen typings''" terminated with exit code: 1. 
//  *  Terminal will be reused by tasks, press any key to close it. 


export default ({ strapi }) => ({

    // FOR NOW: We define duplicate function here, and project does not fail:
    helperGetPluginStore() {
        return strapi.store({
            environment: '',
            type: 'plugin',
            name: 'esplugin'
        })
    },

    async initializeESPlugin() {
        await this.cacheThePluginStore()
    },

    async pluginFinalize() {
        
        strapi.espluginCache.initialized = true

        console.log("============ strapi.espluginCache is: ", strapi.espluginCache)

        // TODO: Is any of this actually working?
        // TODO: Move these into settings child object, otherwise these toggles all re-toggle on every re-boot !!!!!!!!
        // if (!strapi.espluginCache.settingIndexingEnabled) {
        //     strapi.espluginCache.settingIndexingEnabled = true
        // }
        
        // if (!strapi.espluginCache.settingInstantIndex) {
        //     strapi.espluginCache.settingInstantIndex = true
        // }

        // if (!strapi.espluginCache.useNewPluginParadigm) {
        //     strapi.espluginCache.useNewPluginParadigm = true
        // }

    },

    isInitialized() {
        return strapi.espluginCache?.initialized || false
    },

    async cacheThePluginStore() {
        if (!strapi.espluginCache) {
            strapi.espluginCache = {}
        }

        // TODO: This doesn't seem to be needed; commenting for now
        //strapi.espluginCache.collectionsconfig = await this.getCollectionsConfiguredForIndexing()

        // TODO: Keep for now to support legacy; delete later
        strapi.espluginCache.collections = await this.getCollectionsConfiguredForIndexing()

        // Plugin settings
        const pluginStore = this.helperGetPluginStore()
        const settings:any = await pluginStore.get({ key: 'configsettings' })
        strapi.espluginCache.settings = settings

        // Mappings
        const mappingsService = await strapi.plugins['esplugin'].services.mappings
        strapi.espluginCache.mappings = await mappingsService.getMappings()

        // Indexes
        const indexingService = await strapi.plugins['esplugin'].services.indexes
        strapi.espluginCache.indexes = await indexingService.getIndexes()

        // TODO: Maybe not needed because we have "mappings" stored above, but keeping for convenience
        strapi.espluginCache.posttypes = await this.NEWgetPostTypesForIndexing()

    },

    async getCollectionConfig({collectionName}) {
        const contentConfig = await this.getContentConfig()
        if (Object.keys(contentConfig).includes(collectionName)) {
            const ob = {}
            ob[collectionName] = contentConfig[collectionName]
            return ob
        } else {
            return null
        }
    },

    async getCollectionsConfiguredForIndexing() {
        const contentConfig = await this.getContentConfig()
        if (contentConfig) {
            return Object.keys(contentConfig).filter((i) => {
                let hasAtleastOneIndexableAttribute = false
                const attribs = Object.keys(contentConfig[i])
                for (let k = 0; k < attribs.length; k++) {
                    if (contentConfig[i][attribs[k]]['index'] === true) {
                        hasAtleastOneIndexableAttribute = true
                        break
                    }
                }
                return hasAtleastOneIndexableAttribute
            })
        } else {
            return []
        }
    },

    async NEWgetPostTypesForIndexing() {
        const indexesService = await strapi.plugins['esplugin'].services.indexes
        let work = await indexesService.getIndexes()
        if (work) {

            // TODO: Ideally we use a one-liner for all this logic, but got lost and spun my wheels:
            //e.g. let work2 = work.map( (x:any) => x.mappings.map( (y:any) => y.post_type ))
            //e.g. let work2 = work.flatMap( (x:any) => x.mappings.map( (y:any) => y.post_type ))

            // FOR NOW, DOING IT THE BLUNT WAY:
            let uniqueTypes:Array<string> = []
            for (let x = 0; x < work.length; x++) {
                let object = work[x]
                if (object.mappings) {
                    for (let y = 0; y < object.mappings.length; y++) {
                        let mapping:any = object.mappings[y]
                        if (!uniqueTypes.includes(mapping.post_type)) {
                            uniqueTypes.push(mapping.post_type)
                        }
                    }
                }
            }

            return uniqueTypes
        }
    },

    async isCollectionConfiguredToBeIndexed({collectionName}) {
        const collectionsToIndex = await this.getCollectionsConfiguredForIndexing()
        return collectionsToIndex.includes(collectionName)
    },

    async getContentConfig() {

        const pluginStore = this.helperGetPluginStore()
        const settings:any = await pluginStore.get({ key: 'configsettings' })

        const fieldsToExclude = ['createdAt', 'createdBy', 'publishedAt', 'publishedBy', 'updatedAt', 'updatedBy']

        const rawContentTypes = strapi.contentTypes
        const filteredContentTypes = Object.keys(rawContentTypes).filter((c) => c.includes('api::') || c.includes('plugin::users-permissions.user'))
        const finalOutput = {}

        for (let r = 0; r < filteredContentTypes.length; r++) {

            let contentType = filteredContentTypes[r]
            finalOutput[contentType] = {}
            const collectionAttributes = rawContentTypes[contentType].attributes
            const listOfAttributes = Object.keys(collectionAttributes).filter( (i) => fieldsToExclude.includes(i) === false )
            
            for (let k = 0; k < listOfAttributes.length; k++) {
                const currentAttribute = listOfAttributes[k]
                let attributeType = "regular";
                if (typeof collectionAttributes[currentAttribute]["type"] !== "undefined" && collectionAttributes[currentAttribute]["type"] !== null) {
                    if (collectionAttributes[currentAttribute]["type"] === "component") {
                        attributeType = "component"
                    } else if (collectionAttributes[currentAttribute]["type"] === "dynamiczone") {
                        attributeType = "dynamiczone"
                    }
                }

                finalOutput[contentType][listOfAttributes[k]] = { index: false, type: attributeType }
            }
            
        }

        if (settings) {
            const objSettings = JSON.parse(settings)
            if (Object.keys(objSettings).includes('contentConfig')) {
                const collections = Object.keys(finalOutput)
                for (let r=0; r< collections.length; r++) {
                    if (Object.keys(objSettings['contentConfig']).includes(collections[r])) {
                        const attribsForCollection = Object.keys(finalOutput[collections[r]])
                        for (let s = 0; s < attribsForCollection.length; s++) {
                            if (!Object.keys(objSettings['contentConfig'][collections[r]]).includes(attribsForCollection[s])) {
                                objSettings['contentConfig'][collections[r]][attribsForCollection[s]] = { index: false, type: finalOutput[collections[r]][attribsForCollection[s]].type }
                            } else {
                                if (!Object.keys(objSettings['contentConfig'][collections[r]][attribsForCollection[s]]).includes('type')) {
                                    objSettings['contentConfig'][collections[r]][attribsForCollection[s]]['type'] = finalOutput[collections[r]][attribsForCollection[s]].type
                                }
                            }
                        }
                    } else {
                        objSettings['contentConfig'][collections[r]] = finalOutput[collections[r]]
                    }
                }
                return objSettings['contentConfig']
            } else {
                return finalOutput
            }
        } else {
            return finalOutput
        }
    },

    async importContentConfig({config}){
        const pluginStore = this.helperGetPluginStore()
        const settings:any = await pluginStore.get({ key: 'configsettings' })
        
        if (settings) {
            const objSettings = JSON.parse(settings)
            objSettings['contentConfig'] = JSON.parse(config)
            const stringifySettings = JSON.stringify(objSettings)
            await pluginStore.set({ key: 'configsettings', value: stringifySettings })
        } else {
            const newSettings = JSON.stringify({'contentConfig': config})
            await pluginStore.set({ key: 'configsettings', value: newSettings })
        }

        const updatedSettings = await pluginStore.get({ key: 'configsettings' })
        await this.cacheThePluginStore()

        if (updatedSettings && Object.keys(updatedSettings).includes('contentConfig')) {
            return updatedSettings['contentConfig']
        } else {
            return {}
        }
    },

    async setContentConfig({collection, config}){
        const pluginStore = this.helperGetPluginStore()
        const settings:any = await pluginStore.get({ key: 'configsettings' })

        if (settings) {
            const objSettings = JSON.parse(settings)
            if (Object.keys(objSettings).includes('contentConfig')) {
                const prevConfig = objSettings['contentConfig']
                const changedConfigKey = Object.keys(config)[0]
                const newConfig = prevConfig
                newConfig[changedConfigKey] = config[changedConfigKey]
                objSettings['contentConfig'] = newConfig
            } else {
                objSettings['contentConfig'] = config
                const stringifySettings = JSON.stringify(objSettings)
                await pluginStore.set({ key: 'configsettings', value: stringifySettings })
            }
        
        } else {
            const newSettings =  JSON.stringify({'contentConfig': config })
            await pluginStore.set({ key: 'configsettings', value: newSettings })
        }

        const updatedSettings = await pluginStore.get({ key: 'configsettings' })
        await this.cacheThePluginStore()

        if (updatedSettings && Object.keys(updatedSettings).includes('contentConfig')) {
            return updatedSettings['contentConfig']
        } else {
            return {}
        }
    }
})
