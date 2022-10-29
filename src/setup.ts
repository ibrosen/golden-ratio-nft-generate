import { outImageDir, outMetaDir, rmMkdir, sleep, TOTAL_TO_GENERATE } from "./utils/general";
import { readLayersIntoMemory, resizeLayers } from "./utils/layers";
import fs from 'fs';

const main = async () => {

    const folderBatchSize = +process.argv.pop()!;
    const numToGenerate = +process.argv.pop()!;
    const startId = +process.argv.pop()!;
    const mode = process.argv.pop()!;

    if (mode === "clear" || mode === "layersAndClear") {
        rmMkdir(process.cwd() + "/src/out")
        await sleep(10000);
        rmMkdir(outImageDir);
        rmMkdir(outMetaDir);
        await sleep(10000);
    }

    if (mode === "layers" || mode === "layersAndClear") {
        await resizeLayers();
        await sleep(10000);
    }

    for (let i = Math.floor(startId / folderBatchSize); i < Math.floor((startId + numToGenerate) / folderBatchSize); i++) {
        const currOutImageDir = `${outImageDir}/${i * folderBatchSize}`
        if (!fs.existsSync(currOutImageDir)) {
            fs.mkdirSync(currOutImageDir)
            fs.mkdirSync(`${outMetaDir}/${i * folderBatchSize}`)
        }
    }
}



main();