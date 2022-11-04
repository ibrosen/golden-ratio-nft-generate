import fs from 'fs';

export const checkProgress = async (startId: number, numToCheck: number, folderBatchSize: number) => {
    const basePath = process.cwd() + '/src/out/images';

    for (let i = Math.floor(startId / folderBatchSize); i < Math.floor(numToCheck / folderBatchSize); i++) {

        const size = fs.readdirSync(`${basePath}/${i * folderBatchSize}`).filter(c => c !== '.DS_Store').length;

        if (size !== folderBatchSize) {
            console.log(`📊 [${i * folderBatchSize + size}/${numToCheck}] generated so far`)
            return i * folderBatchSize + size - startId;
        }
    }

    console.log(`✔ All ${numToCheck} done`)
    return numToCheck;
}
