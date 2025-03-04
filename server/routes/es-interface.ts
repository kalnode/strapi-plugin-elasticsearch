export default {
    type: 'admin',
    routes: [
        // {
        //     method: 'GET',
        //     path: '/get-es-indexes',
        //     handler: 'indexes.getESIndexes',
        //     config: { policies: [] }
        // },
        // {
        //     method: 'GET',
        //     path: '/create-es-index/:indexUUID',
        //     handler: 'indexes.createESindex',
        //     config: { policies: [] }
        // },
        {
            method: 'GET',
            path: '/delete-es-index/:indexName',
            handler: 'esInterface.deleteIndex',
            config: { policies: [] }
        },
        // {
        //     method: 'GET',
        //     path: '/get-es-mapping/:indexUUID',
        //     handler: 'indexes.getESMapping',
        //     config: { policies: [] }
        // }
    ]    
}