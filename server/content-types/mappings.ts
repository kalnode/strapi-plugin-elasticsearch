export default {
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
            visible: true
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
            "type": "boolean",
        },
        "nested_level": {
            "type": "number"
        },
        "indexes": {
            "type": "relation",
            "relation": "manyToMany",
            "target": "plugin::elasticsearch.registered-index",
            "mappedBy": "mappings" // TODO: Or should this be inversedBy?
        },
        "default_preset": {
            "type": "boolean"
        }
    }
}
  