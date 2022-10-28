import fs from 'fs'
import { checkProgress } from './utils/check';


const main = async () => {
    const startId = +process.argv[process.argv.length - 3];
    const numToGenerate = +process.argv[process.argv.length - 2];
    const folderBatchSize = +process.argv[process.argv.length - 1];
    console.log(process.argv)
    checkProgress(startId, numToGenerate, folderBatchSize);
}

main()