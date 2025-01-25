module.exports = {
    "kind": "collectionType",
    "collectionName": "es-registered-indexes", // DB table
    "info": {
        "singularName": "registered-index", // Kebab case
        "pluralName": "registered-indexes", // Kebab case
        "displayName": "ES Registered Index",
        "description": "Search registered indexes"
    },
    "options": {
        "draftAndPublish": false
    },
    "pluginOptions": {
        'content-manager': {
            visible: true
        },
        'content-type-builder': {
            visible: false
        }        
    },
    "attributes": {
        "index_name": {
            "type": "string",
            "required": true
        },
        "index_alias": {
            "type": "string"
        },
        "mapping": {
            "type": "richtext"
        }
    }
}
  