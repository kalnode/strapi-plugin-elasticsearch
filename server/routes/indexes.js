module.exports = {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/get-index/:indexId',
            handler: 'indexes.getIndex',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-indexes',
            handler: 'indexes.getIndexes',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/create-index/:indexName',
            handler: 'indexes.createIndex',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/delete-index/:recordIndexNumber',
            handler: 'indexes.deleteIndex',
            config: { policies: [] },
        },
        {
            method: 'POST',
            path: '/update-index/:indexId',
            handler: 'indexes.updateIndex',
            config: { policies: [] }
        }
    ]    
}