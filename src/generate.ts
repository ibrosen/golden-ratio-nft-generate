import fs from 'fs';
import keccak256 from 'keccak256';
import { readLayersIntoMemory } from './utils/layers';
import { TokenMetadata, Trait } from './types';
import { cyrb128, mulberry32, outImageDir, outMetaDir, sleep } from './utils/general';
import { generateRandom, generateSingleImage } from './utils/generate';
import { checkProgress } from './utils/check';


export const generateMetadata = async (startId: number, numToGenerate: number, folderBatchSize: number) => {
    const collectionLayers = await readLayersIntoMemory();
    const seen: Record<string, boolean> = {};
    let collisions = 0;

    const start = Date.now();
    var seed = cyrb128("golden ratio");
    // Only one 32-bit component hash is needed for mulberry32.
    const rand = mulberry32(seed[0]);
    let written = 0;

    for (let i = 0; i < numToGenerate + startId; i++) {

        const random = await generateRandom(collectionLayers, rand);

        const traitStrs: string[] = [];
        random.forEach(t => traitStrs.push(`${t.trait_type}:${t.value}`));
        const hash = keccak256(traitStrs.join(',')).toString('hex').slice(0, 32);

        if (!seen[hash]) {
            seen[hash] = true;
            if (i >= startId) {
                const toWrite =
                {
                    name: `Golden Ratio #${i}`, attributes: random.map(ra => ({
                        value: ra.value,
                        trait_type: `${ra.collection}-${ra.trait_type}`
                    })),
                    description: "Description",
                    image: `ipfs://${i}`
                }
                written++;
                fs.writeFileSync(`${outMetaDir}/${Math.floor(i / folderBatchSize) * folderBatchSize}/${i}.json`, JSON.stringify(toWrite))

            }
        } else {
            ++collisions;
            process.stdout.write(`Collision #${collisions},${written} written so far, up to ${i}\r`);
            i--;
        }

    }


    console.log(`Generated ${written} metadata, with ${collisions} collisions in ${(Date.now() - start) / 1000}s`);
};

export const generateImages = async (startId: number, numToGenerate: number, folderBatchSize: number) => {
    const collectionLayers = await readLayersIntoMemory(true);
    let soFar = 0;
    await sleep(5000)
    const start = Date.now();

    let promises: Promise<void>[] = [];
    let currId = startId + await checkProgress(startId, numToGenerate, folderBatchSize);;
    console.log(currId)
    const executeBatch = async (curr: Promise<void>, size = 100) => {
        promises.push(curr);
        if (promises.length >= size) {
            await Promise.all(promises);
            promises = [];
        }
    }
    while (currId < startId + numToGenerate) {
        const meta = JSON.parse(fs.readFileSync(`${outMetaDir}/${Math.floor(currId / folderBatchSize) * folderBatchSize}/${currId}.json`, { encoding: 'utf-8' }))
        const traits = meta.attributes.map((attr: Trait) => {
            const traitTypeSplit = attr.trait_type.split("-");
            const traitType = traitTypeSplit.slice(1).join("-")
            const collection = traitTypeSplit[0]
            const found = collectionLayers[collection][traitType].find(t => t.value === attr.value)

            if (!found)
                throw "couldnt find";
            return found;
        })

        await executeBatch(generateSingleImage(traits, currId, outImageDir, folderBatchSize))
        process.stdout.write(`#${soFar++} successfully generated this round, up to ${currId} \r`);
        currId++;

    }
    if (promises.length)
        await Promise.all(promises);

    console.log(`Generated ${currId} images in ${(Date.now() - start) / 1000}s`);
}


const main = async () => {
    const folderBatchSize = +process.argv.pop()!;
    const numToGenerate = +process.argv.pop()!;
    const startId = +process.argv.pop()!;
    const mode = process.argv.pop();
    console.log(process.argv)
    if (mode === '--metadata')
        await generateMetadata(startId, numToGenerate, folderBatchSize)
    else if (mode === '--images')
        await generateImages(startId, numToGenerate, folderBatchSize)
    else
        console.error('❌ Invalid mode, use --metadata or --images to generate metadata or images respectively')
}

main()

