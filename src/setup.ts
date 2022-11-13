import { outImageDir, outMetaDir, rmMkdir, sleep, TOTAL_TO_GENERATE } from "./utils/general";
import { readLayersIntoMemory, resizeLayers } from "./utils/layers";
import fs from 'fs';

const main = async () => {

    console.log(process.argv)
    const folderBatchSize = +process.argv.pop()!;
    const numToGenerate = +process.argv.pop()!;
    const startId = +process.argv.pop()!;
    const mode = process.argv.pop();
    console.log(numToGenerate, startId, folderBatchSize, mode)

    if (mode === "clear" || mode === "layersAndClear") {
        rmMkdir(process.cwd() + "/src/out")
        await sleep(10000);
        rmMkdir(outImageDir);
        rmMkdir(outMetaDir);
        await sleep(10000);
    }

    if (mode === "clearImages") {
        rmMkdir(outImageDir);
    }

    if (mode === "layers" || mode === "layersAndClear") {
        await resizeLayers();
        await sleep(10000);
    }

    for (let i = Math.floor(startId / folderBatchSize); i < Math.floor((startId + numToGenerate) / folderBatchSize); i++) {
        const currOutImageDir = `${outImageDir}/${i * folderBatchSize}`
        if (!fs.existsSync(currOutImageDir)) {
            fs.mkdirSync(currOutImageDir)
            if (mode !== "clearImages")
                fs.mkdirSync(`${outMetaDir}/${i * folderBatchSize}`)
        }
    }
}



main();