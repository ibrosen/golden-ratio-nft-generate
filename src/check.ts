import fs from 'fs'

export const checkProgress = async (startId: number, numToCheck: number, folderBatchSize: number) => {
    const basePath = __dirname + '/out/images';

    for (let i = Math.floor(startId / folderBatchSize); i < Math.floor(numToCheck / folderBatchSize); i++) {

        const size = fs.readdirSync(`${basePath}/${i * folderBatchSize}`).filter(c => c !== '.DS_Store').length;

        if (size !== folderBatchSize) {
            console.log(`📊 [${i * folderBatchSize + size}/${numToCheck}] generated so far`)
            return;
        }
    }

    console.log(`✔ All ${numToCheck} done`)
}

const main = async () => {
    const startId = +process.argv[process.argv.length - 3];
    const numToGenerate = +process.argv[process.argv.length - 2];
    const folderBatchSize = +process.argv[process.argv.length - 2];
    console.log(process.argv)
    checkProgress(startId, numToGenerate, folderBatchSize);

}

main()