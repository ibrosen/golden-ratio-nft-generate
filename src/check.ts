import fs from 'fs'
import { FOLDER_BATCH_SIZE, NUM_TO_GENERATE } from './utils/general';

export const checkProgress = async (total: number) => {
    const basePath = __dirname + '/out/images';

    for (let i = 0; i < Math.floor(total / FOLDER_BATCH_SIZE); i++) {

        const size = fs.readdirSync(`${basePath}/${i * FOLDER_BATCH_SIZE}`).filter(c => c !== '.DS_Store').length;

        if (size !== FOLDER_BATCH_SIZE) {
            console.log(`📊 [${i * FOLDER_BATCH_SIZE + size}/${total}] generated so far`)
            return;
        }
    }

    console.log(`✔ All ${total} done`)
}

checkProgress(NUM_TO_GENERATE);