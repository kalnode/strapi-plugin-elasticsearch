export default {
    type: 'admin',
    routes: [
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
        }
    ]    
}