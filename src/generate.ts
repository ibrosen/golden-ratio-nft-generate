import fs from 'fs';
import keccak256 from 'keccak256';
import { readLayersIntoMemory } from './utils/layers';
import { Trait } from './types';
import { FOLDER_BATCH_SIZE, NUM_TO_GENERATE, rmMkdir, sleep } from './utils/general';
import { generateRandom, generateSingleImage } from './utils/generate';

const executeBatch = async (curr: Promise<void>, promises: Promise<void>[], size = 1000) => {
    promises.push(curr);
    if (promises.length >= size) {
        await Promise.all(promises);
        promises = [];
    }
}

const outMetaDir = `${process.cwd()}/src/out/metadata`

export const generateMetadata = async (numToGenerate: number) => {
    const collectionLayers = await readLayersIntoMemory();
    const seen: Record<string, boolean> = {};
    const randoms: Trait[][] = [];
    let collisions = 0;

    rmMkdir(outMetaDir);
    await sleep(2000)
    for (let i = 0; i < Math.floor(numToGenerate / FOLDER_BATCH_SIZE); i++) {
        fs.mkdirSync(`${outMetaDir}/${i * FOLDER_BATCH_SIZE}`)
    }
    const start = Date.now();

    for (let i = 0; i < numToGenerate; i++) {

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

    const out: Record<number, any> = {}
    randoms.forEach((r, i) => {
        out[i] = {
            id: i, attributes: r.map(r => {
                const temp = r;
                return { ...temp, data: null };
            })
        }
    })
    // fs.writeFileSync(process.cwd() /src+ '/metadata.json', JSON.stringify(out));
    for (let i = 0; i < randoms.length; i++) {
        fs.writeFileSync(`${outMetaDir}/${Math.floor(i / FOLDER_BATCH_SIZE) * FOLDER_BATCH_SIZE}/${i}.json`, JSON.stringify(out[i]))
    }
};

const outImageDir = `${process.cwd()}/src/out/images`;
export const generateImages = async (numToGenerate: number) => {
    const collectionLayers = await readLayersIntoMemory(true);
    let soFar = 0;
    rmMkdir(outImageDir);
    await sleep(2000)
    for (let i = 0; i < Math.floor(numToGenerate / FOLDER_BATCH_SIZE); i++) {
        fs.mkdirSync(`${outImageDir}/${i * FOLDER_BATCH_SIZE}`)
    }
    await sleep(2000)
    const start = Date.now();

    let promises: Promise<void>[] = [];
    let generated = 0;
    while (generated < numToGenerate) {
        const meta = JSON.parse(fs.readFileSync(`${outMetaDir}/${Math.floor(generated / FOLDER_BATCH_SIZE) * FOLDER_BATCH_SIZE}/${generated}.json`, { encoding: 'utf-8' }))

        const traits = meta.attributes.map((attr: Trait) => {
            const found = collectionLayers[attr.collection][attr.traitType].find(t => t.value === attr.value)

            if (!found)
                throw "couldnt find";
            return found;
        })

        await executeBatch(generateSingleImage(traits, generated, outImageDir), promises)
        process.stdout.write(`#${soFar++} successfully generated \r`);

        generated++;
    }
    console.log(`Generated ${generated} images in ${(Date.now() - start) / 1000}s`);
}


const main = async () => {
    const mode = process.argv[process.argv.length - 1];
    if (mode === '--metadata')
        await generateMetadata(NUM_TO_GENERATE)
    else if (mode === '--images')
        await generateImages(NUM_TO_GENERATE)
    else
        console.error('❌ Invalid mode, use --metadata or --images to generate metadata or images respectively')
}

main()

