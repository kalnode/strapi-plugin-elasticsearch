export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/get-mapping/:mappingUUID',
            handler: 'mappings.getMapping',
            config: { policies: [] }
        },

        // TODO: This is stupid, but we have to make a seperate route for the case of generic /get-mappings without :indexId specified.... WHY?
        {
            method: 'GET',
            path: '/get-mappings',
            handler: 'mappings.getMappings',
            config: { policies: [] }
        },

        // IDEALLY we just use this route for all cases:
        {
            method: 'GET',
            path: '/get-mappings/:indexId',
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
            path: '/update-mapping/:mappingUUID',
            handler: 'mappings.updateMapping',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/delete-mapping/:mappingUUID',
            handler: 'mappings.deleteMapping',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-content-types',
            handler: 'mappings.getContentTypes',
            config: { policies: [] }
        }
    ]    
}