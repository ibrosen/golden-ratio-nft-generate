import fs from 'fs';

export const NUM_TO_GENERATE = 10000;
export const FOLDER_BATCH_SIZE = 1000;

export const randomInt = (max: number) =>
    Math.floor(Math.random() * max);

export const rmMkdir = (dir: string) => {
    if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true });
    } else {
        fs.rmdirSync(dir);
    }
    fs.mkdirSync(dir);
};

export const sleep = async (ms: number) => {
    await new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};