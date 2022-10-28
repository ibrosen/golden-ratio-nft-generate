export interface Trait { collection: string; trait_type: string; value: string; data: Buffer; }

export const layers = ['background', 'body', 'head', 'eyes', 'accessory-head', 'accessory-body'] as const;
export type Layer = typeof layers[number];

export type CollectionTraits = Record<string, Record<string, Trait[]>>;

export interface OutTrait {
    trait_type: string;
    value: string;
}

export interface TokenMetadata {
    name: string;
    image: string;
    description: string;
    attributes: OutTrait[]
}