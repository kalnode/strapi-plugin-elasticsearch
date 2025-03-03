import type { Attribute } from "@strapi/strapi"
import { PluginEspluginMapping } from '../../../../types/generated/contentTypes'

export type Mapping = {
    uuid?: string
    post_type: string
    disabled?: boolean
    fields?: MappingField
    preset?: boolean
    default_preset?: boolean
    nested_level?: number // TODO: early dev work; unknown if we keep this
    indexes?: Array<string> // TODO: put index type here
}

export interface MappingField {
    [key: string]: {
        active?: boolean
        type?: string // TODO: change this to "dataType" to better match the language of ES and minimize any possible conflation that this has any relation to typescript
        index?: boolean // ES-side attribute, whether to index the field (in the context of ES)
        externalName?: string // Apply a different field name ES-side
    }
}

export interface StrapiContentTypes {
    [key: string]: {
        [key: string]: {
            raw_type: string
            field_type: string
        }
    }
}


export type RegisteredIndex = {
    uuid: string
    index_name: string
    index_alias?: string
    active?: boolean
    mappings?: Array<string> // Array of uuid's for mappings
    mapping_dynamic?: boolean
}


// LEGACY HARDCODED MAPPINGS, for reference.
// TODO: Delete when ready to.
// mappings: {
//     properties: {
//         "pin": {
//             type: "geo_point",
//             index: true
//         },
//         "Participants": {
//             type: "nested"
//         },
//         "Organizers": {
//             type: "nested"
//         },
//         "child_terms": {
//             type: "nested"
//         },        
//         // "uuid": {
//         //     type: "string",
//         //     index: "not_analyzed"
//         // }
//     }
// }













// Here, for better DX, we create explicit typings using 

// TODO: These don't do anything... what gives?

export type TMapping1 = Attribute.GetValues<"plugin::esplugin.mapping">

export type TMapping2 = Attribute.GetValue<Attribute.Component<'plugin::esplugin.mapping.attributes', false>>

export type TMapping3 = Attribute.GetValues<'plugin::esplugin.mapping', Attribute.GetKeys<'plugin::esplugin.mapping'>>

export type TMapping4 = Attribute.GetKeys<'plugin::esplugin.mapping'>

export type TMapping5 = Pick<PluginEspluginMapping, 'attributes'>





function mergeProperties<T extends object, const K extends readonly (keyof T)[]>(
    obj: T, ...ks: K
): MergeProperties<T, K> {
    return Object.assign({}, ...ks.map(k => obj[k]));
}

type MergeProperties<T extends object, K extends readonly (keyof T)[]> =
Spread<MapKeysToProps<T, K>>

type OptionalPropertyNames<T> = {
    [K in keyof T]-?: ({} extends { [P in K]: T[K] } ? K : never)
}[keyof T];

type SpreadProperties<L, R, K extends keyof L & keyof R> =
    { [P in K]: L[P] | Exclude<R[P], undefined> };

type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type SpreadTwo<L, R> = Id<
    & Pick<L, Exclude<keyof L, keyof R>>
    & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
    & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
    & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

type Spread<A extends readonly [...any]> =
    A extends readonly [infer L, ...infer R] ?
    SpreadTwo<L, Spread<R>> : unknown

    type MapKeysToProps<T extends object, K extends readonly (keyof T)[]> =
{ [I in keyof K]: T[K[I]] };


// TODO:
// MappingExperimental works but needs all of the above gibberish.
// Side issue is type error on specific type issue:
// Type 'string' is not assignable to type 'StringAttribute'.
// Type 'string' is not assignable to type 'OfType<"string">'.ts(2322)

export type MappingExperimental = MergeProperties<PluginEspluginMapping, ["attributes"]>