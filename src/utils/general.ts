import fs from 'fs';

export const NUM_TO_GENERATE = 10000;
export const FOLDER_BATCH_SIZE = 1000;

// Seeded RNG https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
const mulberry32 = (a: number) => {
    return function () {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

const cyrb128 = (str: string) => {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1 ^ h2 ^ h3 ^ h4) >>> 0, (h2 ^ h1) >>> 0, (h3 ^ h1) >>> 0, (h4 ^ h1) >>> 0];
}
// Create cyrb128 state:
var seed = cyrb128("apples");

// Only one 32-bit component hash is needed for mulberry32.
export const rand = mulberry32(seed[0]);

export const randomInt = (max: number) =>
    Math.floor(rand() * max);

export const rmMkdir = (dir: string) => {
    const mkDr = () => {
        fs.mkdir(dir, () => { console.log(`✔️ Made dir`) });
    }
    console.log(`Making dir: ${dir}`)

    if (fs.existsSync(dir)) {
        fs.rm(dir, { recursive: true, force: true }, mkDr);
    } else {
        mkDr()
    }
};

export const sleep = async (ms: number) => {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};