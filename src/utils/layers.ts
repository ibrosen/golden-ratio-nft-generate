
import fs from 'fs';
import path from 'path';
import { stdout } from 'process';
import sharp from 'sharp';
import { CollectionTraits } from '../types';
import { rmMkdir, sleep } from './general';

/**
 * Read all layers from the file system into memory.
 * @param writeAndResize Whether to read from the folder of original
 * files and write resized values to the resized folder. If falsey,
 * simply reads into memory
 * @param readImages Whether to read the images. If falsey, skips reading the images.
 * Falsey is used to generate metadata, truthy to generate images
 * @returns an object with all the collections and all of their traits
 */
export const readLayersIntoMemory = async (writeAndResize?: boolean, readImages?: boolean) => {
    let count = 0;
    let countSoFar = 0;
    const collectionTraits: CollectionTraits = {};
    const outDirName = process.cwd() + '/src/layers-resized';
    if (writeAndResize) {
        rmMkdir(process.cwd() + '/src/out')
        rmMkdir(outDirName)
    }

    const layerRootDir = process.cwd() + (writeAndResize ? '/src/cc0-nft-layers' : '/src/layers-resized');
    const collections = fs.readdirSync(layerRootDir).filter(c => c !== '.DS_Store');
    for (let i = 0; i < collections.length; i++) {
        const col = collections[i];
        collectionTraits[col] = {};
        const colDir = `${layerRootDir}/${col}`;
        const traitTypes = fs.readdirSync(colDir).filter(c => c !== '.DS_Store');
        for (let j = 0; j < traitTypes.length; j++) {
            const traitType = traitTypes[j];
            collectionTraits[col][traitType] = [];
            const colTraitTypeDir = `${colDir}/${traitType}`;
            const traits = fs.readdirSync(colTraitTypeDir).filter(c => c !== '.DS_Store');
            count += traits.length;
            for (let k = 0; k < traits.length; k++) {

                const trait = traits[k].split('.')[0];
                try {
                    if (writeAndResize) {
                        const outColDir = `${outDirName}/${col}`;
                        const outColTraitTypeDir = `${outColDir}/${traitType}`;
                        if (!fs.existsSync(outColDir)) {
                            fs.mkdirSync(outColDir);
                            await sleep(2000);
                        };
                        if (!fs.existsSync(outColTraitTypeDir)) {
                            fs.mkdirSync(outColTraitTypeDir);
                            await sleep(2000);
                        };
                        await sharp(path.resolve(colTraitTypeDir, `${trait}.png`))
                            .resize({
                                width: 1200,
                                height: 1200,
                            }).sharpen()
                            .toFile(`${outColTraitTypeDir}/${trait}.png`);
                        stdout.write(`   Resized ${++countSoFar}/${count} layers.\r`);
                    } else {
                        const img =
                            readImages ?
                                await sharp(path.resolve(colTraitTypeDir, `${trait}.png`))
                                    .toBuffer()
                                : Buffer.from([]);

                        collectionTraits[col][traitType].push({ traitType, value: trait, data: img, collection: col });
                        stdout.write(`   Read ${++countSoFar}/${count} layers into memory.\r`);
                    }
                } catch (e) {
                    console.log(colTraitTypeDir, trait);
                }
            }
        }
    }
    console.log("\n");

    return collectionTraits;
};
