import fs from 'fs';
import keccak256 from 'keccak256';
import { readLayersIntoMemory } from './utils/layers';
import { TokenMetadata, Trait } from './types';
import { rmMkdir, sleep } from './utils/general';
import { generateRandom, generateSingleImage } from './utils/generate';



const outMetaDir = `${process.cwd()}/src/out/metadata`

export const generateMetadata = async (startId: number, numToGenerate: number, folderBatchSize: number) => {
    const collectionLayers = await readLayersIntoMemory();
    const seen: Record<string, boolean> = {};
    const randoms: Trait[][] = [];
    let collisions = 0;

    rmMkdir(outMetaDir);
    await sleep(5000)
    for (let i = Math.floor(startId / folderBatchSize); i < Math.floor(numToGenerate / folderBatchSize); i++) {
        fs.mkdirSync(`${outMetaDir}/${i * folderBatchSize}`)
    }
    const start = Date.now();

    for (let i = startId; i < numToGenerate + startId; i++) {

        const random = await generateRandom(collectionLayers);

        const traitStrs: string[] = [];
        random.forEach(t => traitStrs.push(`${t.traitType}:${t.value}`));
        const hash = keccak256(traitStrs.join(',')).toString('hex').slice(0, 32);

        if (!seen[hash]) {
            process.stdout.write(`#${randoms.length} successfully generated \r`);
            seen[hash] = true;
            randoms.push(random);
        } else {
            ++collisions;
            console.log(`\nCollision #${collisions}, ${randoms.length} successful`);
            i--;
        }

    }


    console.log(`Generated ${randoms.length} metadata, with ${collisions} collisions in ${(Date.now() - start) / 1000}s`);

    const out: Record<number, TokenMetadata> = {}
    randoms.forEach((r, i) => {
        out[i] = {
            name: `Golden Ratio #${i}`, attributes: r.map(r => ({
                value: r.value,
                trait_type: r.traitType
            })),
            description: "Description",
            image: `ipfs://${i}`
        }
    })
    // fs.writeFileSync(process.cwd() /src+ '/metadata.json', JSON.stringify(out));
    for (let i = 0; i < randoms.length; i++) {
        fs.writeFileSync(`${outMetaDir}/${Math.floor(i / folderBatchSize) * folderBatchSize}/${i}.json`, JSON.stringify(out[i]))
    }
};

const outImageDir = `${process.cwd()}/src/out/images`;
export const generateImages = async (startId: number, numToGenerate: number, folderBatchSize: number) => {
    const collectionLayers = await readLayersIntoMemory(true);
    let soFar = 0;
    rmMkdir(outImageDir);
    await sleep(5000)
    for (let i = Math.floor(startId / folderBatchSize); i < Math.floor(numToGenerate / folderBatchSize); i++) {
        fs.mkdirSync(`${outImageDir}/${i * folderBatchSize}`)
    }
    await sleep(5000)
    const start = Date.now();

    let promises: Promise<void>[] = [];
    let generated = 0;
    let currId = startId;
    const executeBatch = async (curr: Promise<void>, size = 100) => {
        promises.push(curr);
        if (promises.length >= size) {
            await Promise.all(promises);
            promises = [];
        }
    }
    while (generated < numToGenerate) {
        const meta = JSON.parse(fs.readFileSync(`${outMetaDir}/${Math.floor(generated / folderBatchSize) * folderBatchSize}/${currId}.json`, { encoding: 'utf-8' }))

        const traits = meta.attributes.map((attr: Trait) => {
            const found = collectionLayers[attr.collection][attr.traitType].find(t => t.value === attr.value)

            if (!found)
                throw "couldnt find";
            return found;
        })

        await executeBatch(generateSingleImage(traits, generated, outImageDir, folderBatchSize))
        process.stdout.write(`#${soFar++} successfully generated \r`);

        generated++;
        currId++;
    }
    console.log(`Generated ${generated} images in ${(Date.now() - start) / 1000}s`);
}


const main = async () => {
    const mode = process.argv[process.argv.length - 4];
    const startId = +process.argv[process.argv.length - 3];
    const numToGenerate = +process.argv[process.argv.length - 2];
    const folderBatchSize = +process.argv[process.argv.length - 1];
    console.log(process.argv)
    if (mode === '--metadata')
        await generateMetadata(startId, numToGenerate, folderBatchSize)
    else if (mode === '--images')
        await generateImages(startId, numToGenerate, folderBatchSize)
    else
        console.error('❌ Invalid mode, use --metadata or --images to generate metadata or images respectively')
}

main()

