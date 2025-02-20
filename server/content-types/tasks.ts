export default {
    "kind": "collectionType",
    "collectionName": "es-tasks",
    "info": {
        "singularName": "task",
        "pluralName": "tasks",
        "displayName": "ES Task",
        "description": "Search indexing tasks"
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
            //"required": true // TODO: Future: We want this to be required.
        },

        // TODO: Add index "alias" here???

        "collection_name": {
            "type": "string",
            "required": true
        },
        "item_id": {
            "type": "integer"
        },
        "indexing_status": {
            "type": "enumeration",
            "enum": [
                "to-be-done",
                "done"
            ],
            "required": true,
            "default": "to-be-done"
        },
        "full_site_indexing": {
            "type": "boolean"
        },
        "indexing_type": {
            "type": "enumeration",
            "enum": [
                "add-to-index",
                "remove-from-index"
            ],
            "default": "add-to-index",
            "required": true
        }
    }
}
  