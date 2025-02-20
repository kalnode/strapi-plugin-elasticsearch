import type { Attribute } from "@strapi/strapi"

import { PluginEspluginMapping } from '../../../../types/generated/contentTypes'

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