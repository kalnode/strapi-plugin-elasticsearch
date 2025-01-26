module.exports = {
    "kind": "collectionType",
    "collectionName": "es-mappings", // DB table
    "info": {
        "singularName": "mapping", // Kebab case
        "pluralName": "mappings", // Kebab case
        "displayName": "ES Mappings",
        "description": "ES mappings for post types"
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
        "post_type": {
            "type": "string",
            "required": true
        },
        "mapping": {
            "type": "richtext"
        },
        "preset": {
            "type": "string", // id of a preset mapping
        },
        "nested_level": {
            "type": "number"
        },
        "registered_index": {
            "type": "string", // id of a registered index
        },


        // "mapping_type": {
        //     "type": "string", // 'custom', 'preset'
        //     "required": true
        // },
        "default_preset": {
            "type": "boolean"
        },

    }
}
  