export interface Trait { collection: string; traitType: string; value: string; data: Buffer; }

export const layers = ['background', 'body', 'head', 'eyes', 'accessory-head', 'accessory-body'] as const;
export type Layer = typeof layers[number];

export type CollectionTraits = Record<string, Record<string, Trait[]>>;

