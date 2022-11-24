import axios from "axios";
import { cids as imageCids } from "../src/cids";
import https from 'https'
import { ResponseType } from "axios";
import { metadataCids } from "../src/metadata";
const retry = require('async-retry');

const getAndCheck = async (url: string, httpsAgent: https.Agent, responseType: ResponseType) => {
    await retry(
        async (bail: any) => {
            let res =
                await axios.get(url, {
                    responseType,
                    httpsAgent,
                })

            if (res == null) {
                throw new Error('not found, try again');
            }
        }, { retries: 5 }
    );

}

const formatImageUrl = (cid: string, folder: string | number, file: string | number) =>
    `https://${cid}.ipfs.w3s.link/${folder}/${file}.webp`
const formatJsonUrl = (cid: string, folder: string | number, file: string | number) =>
    `https://${cid}.ipfs.w3s.link/${folder}/${file}.json`

const checkAll = async (cids: string[], filesPerUpload: number, folderWithinUpload: number, endToken: number, urlFormatter: (cid: string, folder: string | number, file: string | number) => string, responseType: ResponseType) => {
    const filesPerUploadFolder = filesPerUpload / folderWithinUpload
    const httpsAgent = new https.Agent({ keepAlive: true });
    const numToCheck = Math.floor(endToken / filesPerUpload);
    for (let i = 0; i <= numToCheck; i++) {
        for (let j = 0; j < folderWithinUpload; j++) {
            const startOfThisFolder = j * filesPerUploadFolder + i * filesPerUpload
            const endOfThisFolder = (j + 1) * filesPerUploadFolder - 1 + i * filesPerUpload
            await getAndCheck(urlFormatter(cids[i], startOfThisFolder, startOfThisFolder), httpsAgent, responseType)
            await getAndCheck(urlFormatter(cids[i], startOfThisFolder, endOfThisFolder), httpsAgent, responseType)

            console.log(`Checked ${startOfThisFolder} and ${endOfThisFolder}`)
        }
    }
}


const checkShallow = async (cids: string[], filesPerUpload: number, folderWithinUpload: number, endToken: number, urlFormatter: (cid: string, folder: string | number, file: string | number) => string, responseType: ResponseType) => {
    const httpsAgent = new https.Agent({ keepAlive: true });
    const numToCheck = Math.floor(endToken / filesPerUpload);
    for (let i = 0; i <= numToCheck; i++) {
        const startOfThisUpload = i * filesPerUpload
        const endOfThisUpload = startOfThisUpload + filesPerUpload - 1
        const endOfThisUploadFolder = startOfThisUpload + (filesPerUpload / folderWithinUpload) * (folderWithinUpload - 1)
        await getAndCheck(urlFormatter(cids[i], startOfThisUpload, startOfThisUpload), httpsAgent, responseType)
        await getAndCheck(urlFormatter(cids[i], endOfThisUploadFolder, endOfThisUpload), httpsAgent, responseType)
        console.log(`Checked ${startOfThisUpload} and ${endOfThisUpload}`)

    }
}
export const checkAllImageCids = async () => {
    await checkAll(imageCids, 100_000, 10, 9_999_999, formatImageUrl, 'arraybuffer')
}
export const checkAllMetadata = async () => {
    await checkAll(metadataCids, 1_000_000, 100, 9_999_999, formatJsonUrl, 'json')
}

export const checkShallowMetadata = async () => {
    await checkShallow(metadataCids, 1_000_000, 100, 9_999_999, formatJsonUrl, 'json')

}

(async () => await checkAllMetadata())()