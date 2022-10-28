import fs from 'fs';
import keccak256 from 'keccak256';
import { readLayersIntoMemory } from './utils/layers';
import { TokenMetadata, Trait } from './types';
import { outImageDir, outMetaDir, sleep } from './utils/general';
import { generateRandom, generateSingleImage } from './utils/generate';
import { checkProgress } from './utils/check';


export const generateMetadata = async (startId: number, numToGenerate: number, folderBatchSize: number) => {
    const collectionLayers = await readLayersIntoMemory();
    const seen: Record<string, boolean> = {};
    const randoms: Trait[][] = [];
    let collisions = 0;

    const start = Date.now();

    for (let i = 0; i < numToGenerate + startId; i++) {

        const random = await generateRandom(collectionLayers);

        const traitStrs: string[] = [];
        random.forEach(t => traitStrs.push(`${t.trait_type}:${t.value}`));
        const hash = keccak256(traitStrs.join(',')).toString('hex').slice(0, 32);

        if (!seen[hash]) {
            process.stdout.write(`#${randoms.length} successfully generated \r`);
            seen[hash] = true;
            if (i >= startId) {
                randoms.push(random);
            }
        } else {
            ++collisions;
            console.log(`\nCollision #${collisions}, ${randoms.length} successful`);
            i--;
        }

    }


    console.log(`Generated ${randoms.length} metadata, with ${collisions} collisions in ${(Date.now() - start) / 1000}s`);
    const out: Record<number, TokenMetadata> = {}
    randoms.forEach((r, i) => {
        const id = i + startId
        out[i] = {
            name: `Golden Ratio #${id}`, attributes: r.map(r => ({
                value: r.value,
                trait_type: `${r.collection}-${r.trait_type}`
            })),
            description: "Description",
            image: `ipfs://${id}`
        }
    })
    // fs.writeFileSync(process.cwd() /src+ '/metadata.json', JSON.stringify(out));
    for (let i = 0; i < randoms.length; i++) {
        const id = i + startId;
        fs.writeFileSync(`${outMetaDir}/${Math.floor(id / folderBatchSize) * folderBatchSize}/${id}.json`, JSON.stringify(out[i]))
    }
};

export const generateImages = async (startId: number, numToGenerate: number, folderBatchSize: number) => {
    const collectionLayers = await readLayersIntoMemory(true);
    let soFar = 0;
    await sleep(5000)
    const start = Date.now();

    let promises: Promise<void>[] = [];
    let generated = startId + await checkProgress(startId, numToGenerate, folderBatchSize);;
    console.log(generated)
    const executeBatch = async (curr: Promise<void>, size = 100) => {
        promises.push(curr);
        if (promises.length >= size) {
            await Promise.all(promises);
            promises = [];
        }
    }
    while (generated < numToGenerate) {
        const meta = JSON.parse(fs.readFileSync(`${outMetaDir}/${Math.floor(generated / folderBatchSize) * folderBatchSize}/${generated}.json`, { encoding: 'utf-8' }))
        const traits = meta.attributes.map((attr: Trait) => {
            const traitTypeSplit = attr.trait_type.split("-");
            const traitType = traitTypeSplit.slice(1).join("-")
            const collection = traitTypeSplit[0]
            const found = collectionLayers[collection][traitType].find(t => t.value === attr.value)

            if (!found)
                throw "couldnt find";
            return found;
        })

        await executeBatch(generateSingleImage(traits, generated, outImageDir, folderBatchSize))
        process.stdout.write(`#${soFar++} successfully generated this round, up to ${generated} \r`);

        generated++;
    }
    console.log(`Generated ${generated} images in ${(Date.now() - start) / 1000}s`);
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

