
import fs from 'fs';
import path from 'path';
import { stdout } from 'process';
import sharp from 'sharp';
import { CollectionTraits, Trait } from '../types';
import { rmMkdir, sleep } from './general';

/**
 * Recursively searches through all layers in the given root directory
 * and calls the provided callback with each individual trait found
 * @param callBack 
 * @param layerRootDir 
 * @param readImages Whether to actually read the image's file into memory
 */
const recurseThroughLayerFolder = async (callBack: (trait: Trait) => void, layerRootDir: string, readImages?: boolean) => {
    const collections = fs.readdirSync(layerRootDir).filter(c => c !== '.DS_Store');
    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        const colDir = `${layerRootDir}/${col}`;
        const traitTypes = fs.readdirSync(colDir).filter(c => c !== '.DS_Store');
        for (let j = 0; j < traitTypes.length; j++) {
            const traitType = traitTypes[j];
            const colTraitTypeDir = `${colDir}/${traitType}`;
            const traits = fs.readdirSync(colTraitTypeDir).filter(c => c !== '.DS_Store');
            for (let k = 0; k < traits.length; k++) {
                const traitValue = traits[k].split('.')[0];
                const trait: Trait = {
                    trait_type: traitType, value: traitValue, data: readImages ?
                        await sharp(path.resolve(colTraitTypeDir, `${traitValue}.png`))
                            .toBuffer()
                        : Buffer.from([]), collection: col
                }
                try {
                    callBack(trait)
                } catch (e) {
                    console.log(colTraitTypeDir, trait);
                }
            }
        }
    }
    console.log("\n");
}
/**
 * Read all layers from the file system into memory.
 * @param writeAndResize Whether to read from the folder of original
 * files and write resized values to the resized folder. If falsey,
 * simply reads into memory
 * @param readImages Whether to read the images. If falsey, skips reading the images.
 * Falsey is used to generate metadata, truthy to generate images
 * @returns an object with all the collections and all of their traits
 */
export const readLayersIntoMemory = async (readImages?: boolean) => {
    let countSoFar = 0;
    const collectionTraits: CollectionTraits = {};

    const layerRootDir = process.cwd() + '/src/layers-resized';
    await recurseThroughLayerFolder((trait: Trait) => {
        const { trait_type: traitType, collection } = trait
        if (!collectionTraits[collection])
            collectionTraits[collection] = {};
        if (!collectionTraits[collection][traitType])
            collectionTraits[collection][traitType] = [];
        collectionTraits[collection][traitType].push(trait)
        stdout.write(`   Read ${++countSoFar} layers into memory.\r`);
    }, layerRootDir, readImages)
    return collectionTraits;
};



export const resizeLayers = async () => {
    const layerRootDir = process.cwd() + '/src/cc0-nft-layers';
    const outDirName = process.cwd() + '/src/layers-resized';
    rmMkdir(outDirName)
    await sleep(2000);
    let countSoFar = 0;
    await recurseThroughLayerFolder(async (trait: Trait) => {
        const { collection, trait_type: traitType, value } = trait
        const colDir = `${layerRootDir}/${collection}`;
        const colTraitTypeDir = `${colDir}/${traitType}`;
        const outColDir = `${outDirName}/${collection}`;
        const outColTraitTypeDir = `${outColDir}/${traitType}`;
        if (!fs.existsSync(outColDir)) {
            fs.mkdirSync(outColDir);
            await sleep(2000);
        };
        if (!fs.existsSync(outColTraitTypeDir)) {
            fs.mkdirSync(outColTraitTypeDir);
            await sleep(2000);
        };
        await sharp(path.resolve(colTraitTypeDir, `${value}.png`))
            .resize({
                width: 1200,
                height: 1200,
            }).sharpen()
            .toFile(`${outColTraitTypeDir}/${value}.png`);
        stdout.write(`   Resized and saved ${++countSoFar} layers so far.\r`);
    }, layerRootDir)
}