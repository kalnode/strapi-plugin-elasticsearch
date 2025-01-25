module.exports = {
    // accessible only from admin UI
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/create-index',
            handler: 'indexes.createIndex',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/delete-index/:indexName',
            handler: 'indexes.deleteIndex',
            config: { policies: [] },
          },
    ]
    
}