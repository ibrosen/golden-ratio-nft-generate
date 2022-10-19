import fs from 'fs';
import { generateSingleImage } from "./generate";
import { readLayersIntoMemory } from "./layers";
import { CollectionTraits, Trait } from "./types";
import { randomInt, rmMkdir, sleep } from './utils';

const generate = async (traits: Omit<Trait, 'data'>[], layers: CollectionTraits, outDir: string) => {
    const actualTraits: Trait[] = [];

    traits.forEach(t => {
        // console.log(layers[t.collection][t.traitType]);
        const val = !!t.value ? t.value : layers[t.collection][t.traitType][randomInt(layers[t.collection][t.traitType].length)].value;
        const layer = layers[t.collection][t.traitType].find(l =>
            l.value === val
        );
        if (layer) actualTraits.push(layer);
    });

    await generateSingleImage(actualTraits, fs.readdirSync(outDir).length, outDir);

};

const outDir = __dirname + '/out/individuals';

const generateOne = async (traits: Omit<Trait, 'data'>[]) => {
    const layers = await readLayersIntoMemory();
    generate(traits, layers, outDir);
};

const generateMulti = async (traits: Omit<Trait, 'data'>[], num: number) => {
    const layers = await readLayersIntoMemory();
    rmMkdir(outDir);

    sleep(5000);

    for (let i = 0; i < num; i++) {
        await generate(traits, layers, outDir);
    }
};

const traits: Omit<Trait, 'data'>[] = [
    // { collection: 'moonbirds', 'traitType': 'Body', value: 'Crescent - Green' },
    { collection: 'landmarks', 'traitType': 'background', value: '' },
    { collection: 'nouns', 'traitType': 'bodies', value: '' },
    // { collection: 'nouns', 'traitType': 'heads', value: '' },
    // { collection: 'nouns', 'traitType': 'accessories', value: 'accessory-aardvark' },
    // { collection: 'mfers', traitType: 'smoke', value: 'cig black' },
    // { collection: 'goblintown', traitType: 'body', value: '' },
    { collection: 'goblintown', traitType: 'head', value: '' },
    { collection: 'nouns', 'traitType': 'accessories', value: '' },
    // { collection: 'goblintown', traitType: 'lefteye', value: '' },
    // { collection: 'goblintown', traitType: 'righteye', value: '' },
    // { collection: 'mfers', 'traitType': 'type', value: 'plain mfer' },
    // { collection: 'moonbirds', 'traitType': 'Outerwear', value: '' },
    // { collection: 'moonbirds', 'traitType': 'Eyes', value: '' },
    // { collection: 'moonbirds', 'traitType': 'Beak', value: '' },
    // { collection: 'goblintown', traitType: 'ears', value: '' },
    // { collection: 'tinydinos', 'traitType': 'head', value: '' },
    // { collection: 'tinydinos', traitType: 'body', value: 'aqua' },
    // { collection: 'mfers', traitType: 'eyes', value: '' },
    // { collection: 'mfers', traitType: 'long hair', value: '' },
    // {collection:'moonbirds','traitType':'Body',value:'Crescent - Green'},
];

generateMulti(traits, 20);