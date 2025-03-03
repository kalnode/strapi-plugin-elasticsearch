export default {
    type: 'admin',
    routes: [
        {
            method: 'GET',
            path: '/plugin-settings',
            handler: 'tools.pluginSettings',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/orphans-find',
            handler: 'tools.orphansFind',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/orphans-delete',
            handler: 'tools.orphansDelete',
            config: { policies: [] }
        },
        {
            method: 'GET',
            path: '/get-content-types',
            handler: 'tools.getContentTypes',
            config: { policies: [] }
        }
    ]    
}