module.exports = {
    // accessible only from admin UI
    type: 'admin',
    routes: [

        {
            method: 'GET',
            path: '/get-mapping/:mappingId',
            handler: 'mappings.getMapping',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-mappings/:mappingId',
            handler: 'mappings.getMappings',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/create-mapping',
            handler: 'mappings.createMapping',
            config: { policies: [] }
        },
        {
            method: 'POST',
            path: '/update-mapping/:mappingId',
            handler: 'mappings.updateMapping',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/delete-mapping/:mappingIndexNumber',
            handler: 'mappings.deleteMapping',
            config: { policies: [] },
        },
        {
            method: 'GET',
            path: '/get-content-types',
            handler: 'mappings.getContentTypes',
            config: { policies: [] }
        },
    ]
    
}