export default ({ strapi }) => ({

    // =============================================
    // REBUILD INDEX
    // =============================================

    async rebuildIndex() {

        console.log('SPE - rebuildIndex - REQUEST: rebuild the index')

        const helper = strapi.plugins['elasticsearch'].services.helper
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface
        const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
        const logIndexingService = strapi.plugins['elasticsearch'].services.logIndexing

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

        } catch(err) {
            console.log('SPE - rebuildIndex - searchController: An error was encountered while re-indexing.')
            console.log(err)
            await logIndexingService.recordIndexingFail(err)
        }

    },


    // =============================================
    // INDEX COLLECTION
    // =============================================

    async indexCollection(collectionName, indexName = null) {

        const helper = strapi.plugins['elasticsearch'].services.helper
        const populateAttrib = helper.getPopulateAttribute({collectionName})
        const isCollectionDraftPublish = helper.isCollectionDraftPublish({collectionName})
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface

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
        const helper = strapi.plugins['elasticsearch'].services.helper
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
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

        const scheduleIndexingService = strapi.plugins['elasticsearch'].services.scheduleIndexing
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
        const logIndexingService = strapi.plugins['elasticsearch'].services.logIndexing
        const esInterface = strapi.plugins['elasticsearch'].services.esInterface
        const helper = strapi.plugins['elasticsearch'].services.helper
        const recs = await scheduleIndexingService.getItemsPendingToBeIndexed()
        const fullSiteIndexing = recs.filter(r => r.full_site_indexing === true).length > 0

        if (fullSiteIndexing) {
            await this.rebuildIndex()
            for (let r = 0; r < recs.length; r++) {
                await scheduleIndexingService.markIndexingTaskComplete(recs[r].id)
            }
        } else {
            try {
                for (let r = 0; r < recs.length; r++) {
                    const col = recs[r].collection_name

                    if (configureIndexingService.isCollectionConfiguredToBeIndexed(col)) {

                        // Indexing the individual item
                        if (recs[r].item_id) {

                            if (recs[r].indexing_type !== 'remove-from-index') {
                                const populateAttrib = helper.getPopulateAttribute({collectionName: col})
                                const item = await strapi.entityService.findOne(col, recs[r].item_id, {
                                    populate: populateAttrib['populate']
                                })

                                if (item) {
                                    

                                    const indexItemId = helper.getIndexItemId({collectionName: col, itemId: item.id})

                                    // FAILS
                                    // let dataToIndex = await this.assembleDataToIndex(col, item)

                                    // -------------------------
                                    //WORKS
                                    const collectionConfig = await configureIndexingService.getCollectionConfig({collectionName: col})
                                    let dataToIndex = await helper.extractRecordDataToIndex({
                                        collectionName: col, data: item, collectionConfig
                                    })
                                    dataToIndex['posttype'] = col.split('.').pop()
                                    dataToIndex = this.processGeoLocation(dataToIndex)
                                    //console.log("Kal - dataToIndex: ", dataToIndex)
                                    // -------------------------

                                    await esInterface.indexData({itemId : indexItemId, itemData: dataToIndex})
                                    await scheduleIndexingService.markIndexingTaskComplete(recs[r].id)
                                }
                            } else {
                                const indexItemId = helper.getIndexItemId({collectionName: col, itemId: recs[r].item_id})
                                await esInterface.removeItemFromIndex({itemId : indexItemId})
                                await scheduleIndexingService.markIndexingTaskComplete(recs[r].id)
                            }

                        // Index the entire collection
                        } else {

                            // PENDING: Index an entire collection
                            await this.indexCollection(col);
                            await scheduleIndexingService.markIndexingTaskComplete(recs[r].id)

                        }

                    } else {
                        await scheduleIndexingService.markIndexingTaskComplete(recs[r].id)
                    }
                }

                await logIndexingService.recordIndexingPass('Indexing of ' + String(recs.length) + ' records complete.')

            } catch(err) {
                await logIndexingService.recordIndexingFail('Indexing of records failed - ' + ' ' + String(err))
                console.log(err)
                return false
            }
        }
        return true
    },



    async indexRecordsNEW(indexId) {

        // 1. Get index with mappings

        // 2. Loop through mapping posttypes

        // 3. For each post type, get records and index them into ES index

        const esInterface = strapi.plugins['elasticsearch'].services.esInterface
        const indexesService = strapi.plugins['elasticsearch'].services.indexes
        const configureIndexingService = strapi.plugins['elasticsearch'].services.configureIndexing
        const helper = strapi.plugins['elasticsearch'].services.helper


        let index = await indexesService.getIndex(indexId)
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
        console.log("FUCK OFF -0-------")
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
})