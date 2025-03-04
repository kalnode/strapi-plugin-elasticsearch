import { RegisteredIndex } from "../../types"
import { estypes } from '@elastic/elasticsearch'

export default ({ strapi }) => ({

    // =============================================
    // REBUILD INDEX
    // =============================================

    async rebuildIndex() {

        console.log('SPE - rebuildIndex - REQUEST: rebuild the index')

        const helper = strapi.plugins['esplugin'].services.helper
        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const scheduleIndexingService = strapi.plugins['esplugin'].services.scheduleIndexing
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
        const logIndexingService = strapi.plugins['esplugin'].services.logIndexing

        try {

            const oldIndexName = await helper.getCurrentIndexName()
            console.log('SPE - rebuildIndex - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            const newIndexName = await helper.getIncrementedIndexName()
            await esInterface.createIndex(newIndexName)
            console.log('SPE - rebuildIndex - Created new index with name:', newIndexName)

            // Step 2: Index things
            console.log('SPE - rebuildIndex - Starting to index all data into the new index.')
            const item = await scheduleIndexingService.addFullSiteIndexingTask()

            if (item.id) {

                const cols = await configureIndexingService.getCollectionsConfiguredForIndexing()

                for (let r = 0; r < cols.length; r++) {
                    await this.indexCollection(cols[r], newIndexName)
                }

                await scheduleIndexingService.markIndexingTaskComplete(item.id)
                console.log('SPE - rebuildIndex - Indexing of data into the new index complete.')

                // Step 3: Attach the alias to this new index
                await esInterface.attachAliasToIndex(newIndexName)
                console.log('SPE - rebuildIndex - Attaching the newly created index to the alias.')

                // Step 4: Update the search-indexing-name
                await helper.storeCurrentIndexName(newIndexName)
                console.log('SPE - rebuildIndex - Storing current index name.')

                // Step 5: Delete the previous index
                await esInterface.deleteIndex(oldIndexName)
                console.log('SPE - rebuildIndex - deleted old index name:', oldIndexName)

                await logIndexingService.recordIndexingPass('Request to immediately re-index site-wide content completed successfully.')

                return true

            } else {

                await logIndexingService.recordIndexingFail('An error was encountered while trying site-wide re-indexing of content.')
                return false

            }

        } catch(error) {
            console.error('SPE - rebuildIndex - searchController: An error was encountered while re-indexing.')
            console.error(error)
            await logIndexingService.recordIndexingFail(error)
        }

    },

    async rebuildIndex_NEW(indexName:estypes.IndexName) {

        console.log('SPE - rebuildIndex_NEW 111')

        const helper = strapi.plugins['esplugin'].services.helper
        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const scheduleIndexingService = strapi.plugins['esplugin'].services.scheduleIndexing
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
        const logIndexingService = strapi.plugins['esplugin'].services.logIndexing

        try {

            const oldIndexName = await helper.getCurrentIndexName()
            console.log('SPE - rebuildIndex - Previous index name:', oldIndexName)

            // Step 1: Create a new index
            const newIndexName = await helper.getIncrementedIndexName()
            await esInterface.createIndex(newIndexName)
            console.log('SPE - rebuildIndex - Created new index with name:', newIndexName)

            // Step 2: Index things
            console.log('SPE - rebuildIndex - Starting to index all data into the new index.')
            const item = await scheduleIndexingService.addFullSiteIndexingTask()

            if (item.id) {

                const cols = await configureIndexingService.getCollectionsConfiguredForIndexing()

                for (let r = 0; r < cols.length; r++) {
                    await this.indexCollection(cols[r], newIndexName)
                }

                await scheduleIndexingService.markIndexingTaskComplete(item.id)
                console.log('SPE - rebuildIndex - Indexing of data into the new index complete.')

                // Step 3: Attach the alias to this new index
                await esInterface.attachAliasToIndex(newIndexName)
                console.log('SPE - rebuildIndex - Attaching the newly created index to the alias.')

                // Step 4: Update the search-indexing-name
                await helper.storeCurrentIndexName(newIndexName)
                console.log('SPE - rebuildIndex - Storing current index name.')

                // Step 5: Delete the previous index
                await esInterface.deleteIndex(oldIndexName)
                console.log('SPE - rebuildIndex - deleted old index name:', oldIndexName)

                await logIndexingService.recordIndexingPass('Request to immediately re-index site-wide content completed successfully.')

                return true

            } else {

                await logIndexingService.recordIndexingFail('An error was encountered while trying site-wide re-indexing of content.')
                return false

            }

        } catch(error) {
            console.error('SPE - rebuildIndex - searchController: An error was encountered while re-indexing.')
            console.error(error)
            await logIndexingService.recordIndexingFail(error)
        }

    },


    // =============================================
    // INDEX COLLECTION
    // =============================================

    async indexCollection(collectionName, indexName = null) {

        console.log("indexCollection 111")

        const helper = strapi.plugins['esplugin'].services.helper
        const populateAttrib = helper.getPopulateAttribute({collectionName})
        const isCollectionDraftPublish = helper.isCollectionDraftPublish({collectionName})
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
        const esInterface = strapi.plugins['esplugin'].services.esInterface

        if (indexName === null) {
            indexName = await helper.getCurrentIndexName()
        }

        let entries = []

        if (isCollectionDraftPublish) {
            entries = await strapi.entityService.findMany(collectionName, {
                sort: { createdAt: 'DESC' },
                populate: populateAttrib['populate'],
                filters: {
                    publishedAt: {
                        $notNull: true
                    }
                }
            })
        } else {
            entries = await strapi.entityService.findMany(collectionName, {
                sort: { createdAt: 'DESC' },
                populate: populateAttrib['populate']
            })
        }

        if (entries) {

            for (let s = 0; s < entries.length; s++) {
                const item:any = entries[s]
                const indexItemId = helper.getIndexItemId({collectionName: collectionName, itemId: item.id})

                // FAILS
                // let dataToIndex = await this.assembleDataToIndex(collectionName, item)

                // -------------------------
                // WORKS
                const collectionConfig = await configureIndexingService.getCollectionConfig({collectionName})
                let dataToIndex = await helper.extractRecordDataToIndex({
                    collectionName, data: item, collectionConfig
                })
                dataToIndex['posttype'] = collectionName.split('.').pop()
                dataToIndex = this.processGeoLocation(dataToIndex)
                // -------------------------

                await esInterface.indexRecordToSpecificIndex({itemId: indexItemId, itemData: dataToIndex}, indexName)
            }
        }

        return true
    },


    // KAL - We add a "pin" field to any record that has some form of lat/lng in it.
    // "pin" is mapped as "geo_point" in es-interface.js
    processGeoLocation(dataToIndex) {

        if (dataToIndex.Location) {
            dataToIndex['pin'] = {
                //"location": {
                    "lat": dataToIndex.Location.Latitude,
                    "lon": dataToIndex.Location.Longitude
                //}
            }
            //console.log("88888888888 indexCollection dataToIndex is: ", dataToIndex)
        } else if (dataToIndex.Latitude && dataToIndex.Longitude) {
            dataToIndex['pin'] = {
                //"location": {
                    //"type": "geo_point",
                    "lat": dataToIndex.Latitude,
                    "lon": dataToIndex.Longitude
                //}
            }
            //console.log("88888888888 indexCollection dataToIndex is: ", dataToIndex)
        }

        return dataToIndex
    },



    // =============================================
    // ASSEMBLE DATA TO INDEX
    // =============================================

    async assembleDataToIndexOrig(collectionName, item) {
        const helper = strapi.plugins['esplugin'].services.helper
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
        //console.log("spe.rebuildIndex -assembleDataToIndex collectionName:", collectionName)
        const collectionConfig = await configureIndexingService.getCollectionConfig(collectionName)

        //console.log("spe.rebuildIndex -assembleDataToIndex collectionConfig:", collectionConfig)
        let dataToIndex = await helper.extractRecordDataToIndex({
            collectionName, data: item, collectionConfig
        })

        // KAL: The original strapi-plugin-elasticsearch library deals with one index for everything. However, we'd
        // like to have multiple indexes. For now, in this single index paradigm, here we explicitly set "posttype"
        // for every record, which can be filtered on in an ES query.
        dataToIndex['posttype'] = collectionName.split('.').pop()

        // KAL: For any record that has some form of latitude/longitude, we
        // add a "pin" to the record. "Pin" has previously been mapped as a "geo_point" ES field type and enables geodistance search.
        if (dataToIndex.Location) {
            dataToIndex['pin'] = {
                //"location": {
                    "lat": dataToIndex.Location.Latitude,
                    "lon": dataToIndex.Location.Longitude
                //}
            }
            //console.log("88888888888 indexCollection dataToIndex is: ", dataToIndex)
        } else if (dataToIndex.Latitude && dataToIndex.Longitude) {
            dataToIndex['pin'] = {
                //"location": {
                    //"type": "geo_point",
                    "lat": dataToIndex.Latitude,
                    "lon": dataToIndex.Longitude
                //}
            }
            //console.log("88888888888 indexCollection dataToIndex is: ", dataToIndex)
        }

        return dataToIndex
    },

    // =============================================
    // INDEX PENDING DATA
    // =============================================

    async indexPendingData() {

        console.log("indexPendingData 111")

        const scheduleIndexingService = strapi.plugins['esplugin'].services.scheduleIndexing
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
        const logIndexingService = strapi.plugins['esplugin'].services.logIndexing
        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const helper = strapi.plugins['esplugin'].services.helper
        const recordsToIndex = await scheduleIndexingService.getItemsPendingToBeIndexed()

        if (recordsToIndex && recordsToIndex.length > 0) {
            const fullSiteIndexing = recordsToIndex.filter(r => r.full_site_indexing === true).length > 0

            if (fullSiteIndexing) {
                await this.rebuildIndex()
                for (let r = 0; r < recordsToIndex.length; r++) {
                    await scheduleIndexingService.markIndexingTaskComplete(recordsToIndex[r].id)
                }
            } else {
                try {
                    for (let r = 0; r < recordsToIndex.length; r++) {
                        const collection_name = recordsToIndex[r].collection_name

                        console.log("indexPendingData recordsToIndex 111 collection_name", collection_name)

                        if (configureIndexingService.isCollectionConfiguredToBeIndexed(collection_name)) {

                            console.log("indexPendingData recordsToIndex 222")

                            // Indexing the individual item
                            if (recordsToIndex[r].item_id) {

                                console.log("indexPendingData recordsToIndex 333", recordsToIndex[r].item_id)

                                if (recordsToIndex[r].indexing_type !== 'remove-from-index') {
                                    const populateAttrib = helper.getPopulateAttribute({collectionName: collection_name})
                                    const item = await strapi.entityService.findOne(collection_name, recordsToIndex[r].item_id, {
                                        populate: populateAttrib['populate']
                                    })

                                    if (item) {                                        

                                        const indexItemId = helper.getIndexItemId({collectionName: collection_name, itemId: item.id})

                                        // FAILS
                                        // let dataToIndex = await this.assembleDataToIndex(col, item)

                                        // -------------------------
                                        //WORKS
                                        const collectionConfig = await configureIndexingService.getCollectionConfig({collectionName: collection_name})
                                        let dataToIndex = await helper.extractRecordDataToIndex({
                                            collectionName: collection_name, data: item, collectionConfig
                                        })
                                        dataToIndex['posttype'] = collection_name.split('.').pop()
                                        dataToIndex = this.processGeoLocation(dataToIndex)
                                        //console.log("Kal - dataToIndex: ", dataToIndex)
                                        // -------------------------

                                        await esInterface.indexData({itemId: indexItemId, itemData: dataToIndex})
                                        await scheduleIndexingService.markIndexingTaskComplete(recordsToIndex[r].id)
                                    }
                                } else {
                                    const indexItemId = helper.getIndexItemId({collectionName: collection_name, itemId: recordsToIndex[r].item_id})
                                    await esInterface.removeItemFromIndex({itemId: indexItemId})
                                    await scheduleIndexingService.markIndexingTaskComplete(recordsToIndex[r].id)
                                }

                            // Index the entire collection
                            } else {

                                // PENDING: Index an entire collection
                                await this.indexCollection(collection_name)
                                await scheduleIndexingService.markIndexingTaskComplete(recordsToIndex[r].id)
                            }

                        } else {
                            await scheduleIndexingService.markIndexingTaskComplete(recordsToIndex[r].id)
                        }
                    }

                    await logIndexingService.recordIndexingPass('Indexing of ' + String(recordsToIndex.length) + ' records complete.')

                } catch(error) {
                    await logIndexingService.recordIndexingFail('Indexing of records failed - ' + ' ' + String(error))
                    console.log(error)
                    return false
                }
            }
            return true
        } else {
            return false
        }
    },



    async indexRecordsNEW(indexUUID) {

        console.log("indexRecordsNEW 111", indexUUID)

        // 1. Get index with mappings

        // 2. Loop through mapping posttypes

        // 3. For each post type, get records and index them into ES index

        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const indexesService = strapi.plugins['esplugin'].services.indexes
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing
        const helper = strapi.plugins['esplugin'].services.helper


        let index = await indexesService.getIndex(indexUUID)
        let entries:any = []

        //console.log("indexRecordsNEW 111", index)

        if (index && index.mappings) {
            for (let i = 0; i < index.mappings.length; i++) {

                console.log("indexRecordsNEW 222", i)

                let mapping = index.mappings[i]
                
                console.log("mapping post type", mapping.post_type)
                //const populateAttrib = helper.getPopulateAttribute({collectionName: mapping.post_type})
                //const isCollectionDraftPublish = helper.isCollectionDraftPublish({collectionName: mapping.post_type})

                if (mapping) {

                    const populateAttrib = await helper.getPopulateAttribute({collectionName: mapping.post_type})
                    const isCollectionDraftPublish = await helper.isCollectionDraftPublish({collectionName: mapping.post_type})

                    console.log("populateAttrib 111: ", populateAttrib)
                    console.log("isCollectionDraftPublish 111: ", isCollectionDraftPublish)

                    if (isCollectionDraftPublish) {
                        let work = await strapi.entityService.findMany(mapping.post_type, {
                            sort: { createdAt: 'DESC' },
                            populate: populateAttrib['populate'],
                            filters: {
                                publishedAt: {
                                    $notNull: true
                                }
                            }
                        })
                        if (work) {
                            //console.log("Work found AAA, length: ", work.length)
                           // console.log("Work found AAA1, entries: ", entries)

                            //                            entries.push({...work, post_type: mapping.post_type})
                            //entries.push(work)
                            entries.push({entries: work, post_type: mapping.post_type})
                        }
                    } else {

     
                        let work = await strapi.entityService.findMany(mapping.post_type, {
                            sort: { createdAt: 'DESC' },
                            populate: populateAttrib['populate']
                        })
                        if (work) {

                            console.log("Work found BBB, length: ", work.length)
                            console.log("Work found BBB1, entries: ", entries)
                            entries.push({entries: work, post_type: mapping.post_type})
                        }
                    }

                }
            }
        }

        if (entries.length > 0) {
            console.log("entries.length 333", entries.length)
            for (let i = 0; i < entries.length; i++) {

                const parent = entries[i]

                console.log("parent i: ", i)
                

                for (let k = 0; k < parent.entries.length; k++) {

                    let entry = parent.entries[k]
                    //console.log("indexRecordsNEW 333aaa entry: ", entry)
                    console.log("entry k: ", k)
                    const indexItemId = helper.getIndexItemId({collectionName: parent.post_type, itemId: entry.id})

                    // FAILS
                    // TODO: See what this did in old code
                    // let dataToIndex = await this.assembleDataToIndex(collectionName, entry)

                    // -------------------------
                    // WORKS

                    // 1. Get collection config
                    // TODO: What's this for on high-level? Do we do the same for new "registered indexes" paradigm?
                    const collectionConfig = await configureIndexingService.getCollectionConfig({collectionName: parent.post_type})
                    
                    console.log("wtf 1122233")
                    //console.log("indexRecordsNEW 333bbb indexItemId: ", indexItemId)
                    //console.log("indexRecordsNEW 333ccc collectionConfig: ", collectionConfig)


                    let dataToIndex = await helper.extractRecordDataToIndex({ collectionName: parent.post_type, data: entry, collectionConfig: collectionConfig })

                    // TODO: Add this as an option in the plugin... whether to add "posttype" field. This is useful is someone is trying to make a hybrid index containing multiple post types.
                    dataToIndex['posttype'] = parent.post_type.split('.').pop()
                    
                    console.log("AAA ptype", parent.post_type)
                    //console.log("BBB ptype", entry.posttype)

                    // TODO: This logic should probably be integrated into extractRecordDataToIndex()
                    dataToIndex = this.processGeoLocation(dataToIndex)
                    // -------------------------
                    console.log("indexRecordsNEW 444")
                    let work4 = await esInterface.indexRecordToSpecificIndex({itemId: indexItemId, itemData: dataToIndex}, index.index_name)
                    console.log("indexRecordsNEW 555", work4)
                }
            }
        }

        return true
    },

    async indexSingleRecord_NEW(item:any, postType:string, index:RegisteredIndex) {

        console.log("indexSingleRecord_NEW 111, postType", postType)
        console.log("indexSingleRecord_NEW 333, index.index_name", index.index_name)
        //console.log("indexSingleRecord_NEW 444, item", item)

        const logIndexingService = strapi.plugins['esplugin'].services.logIndexing
        const esInterface = strapi.plugins['esplugin'].services.esInterface
        const helper = strapi.plugins['esplugin'].services.helper
        const configureIndexingService = strapi.plugins['esplugin'].services.configureIndexing

        // TODO: This outputs "collectionName+'::' + itemId"... why is this needed?
        const processed_id = helper.getIndexItemId({collectionName: postType, itemId: item.id})


        // =========================
        // FAILS
        // let process_data = await this.assembleDataToIndex(col, item)

        //WORKS
        const collectionConfig = await configureIndexingService.getCollectionConfig({ collectionName: postType })
        let process_data = await helper.extractRecordDataToIndex({
            collectionName: postType, data: item, collectionConfig
        })
        process_data['posttype'] = postType.split('.').pop()
        process_data = this.processGeoLocation(process_data)

        // =========================

        await esInterface.indexRecordToSpecificIndex_NEW({itemId: processed_id, itemData: process_data}, index)
        await logIndexingService.recordIndexingPass('Indexing of single record complete.')
    }
})




