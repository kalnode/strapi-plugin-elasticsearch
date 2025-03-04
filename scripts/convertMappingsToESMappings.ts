import { RegisteredIndex, Mapping, MappingField } from "../types"
import { removeUndefineds } from "."

export const convertMappingsToESMappings = (mappings:Array<Mapping>):MappingField => {
    let mappingFieldsFinal:MappingField = {}

    if (mappings && mappings.length > 0) {
        for (let i = 0; i < mappings.length; i++) {
            const mapping:Mapping = mappings[i]

            if (mapping.fields) {
                for (const [key, value] of Object.entries(mapping.fields)) {

                    // TODO: Make a more elegant procedure than a bunch of if-statements.
                    // Ultimately we don't want to pass any property which is "undefined" to ES (it won't nicely filter them out, and throws an error).
                    // if (value.type) {
                    //     mappingFieldsFinal[key].type = value.type
                    // }

                    // if (value.index) {
                    //     mappingFieldsFinal[key].index = value.index
                    // }       
                    
                    // Only proceed with explicit mapping if it has a type
                    if (value.type) {

                        mappingFieldsFinal[key] = {

                            // type cannot be changed if field already deployed
                            // TODO: Possible that basic similar types can change between eachother, like from text to longtext
                            type: value.type,

                            // index cannot be changed if field already deployed
                            index: value.index
                        }

                        // TODO: This seems stupid; maybe we can re-build the above to not created undefined properties in the first place?
                        removeUndefineds(mappingFieldsFinal[key])
                    }

                }
            }
        }

    }

    return mappingFieldsFinal

}