const dotenv = require('dotenv');
import axios from 'axios';
import fs from 'fs';
import https from 'https';
import sharp, { OutputInfo } from 'sharp';

dotenv.config();

const BASE_RCP_UPLOAD_URL = 'https://rightclick.pics/wp-content/uploads/lumise_data';
const PROMISE_BATCH_LEN = 10;

type Collection = 'goblintown';
interface RCPTrait { name: string; upload: string; }[];

const scrapeLayers = async (collection: Collection) => {
    let c: { trait_type: string, trait_value: string; }[] = [];
    const httpsAgent = new https.Agent({ keepAlive: true });

    const responses: { items: RCPTrait[]; }[] = JSON.parse(fs.readFileSync(__dirname + `/jsons/${collection}-responses.json`, { encoding: 'utf8' }));

    const rcpTraits: RCPTrait[] = [];
    responses.forEach(i => i.items.forEach(t => rcpTraits.push(t)));

    let promises: Promise<OutputInfo>[] = [];
    const colDir = __dirname + `/out/${collection}`;
    if (fs.existsSync(colDir)) {
        fs.rmdirSync(colDir);
        fs.mkdirSync(colDir);
    }

    while (rcpTraits.length) {
        const trait = rcpTraits.shift();
        if (!trait) continue;
        const { name, upload } = trait;
        const traitType = name.replace(/[0-9]/g, '');
        const traitDir = `${colDir}/${traitType}`;

        if (!fs.existsSync(traitDir)) fs.mkdirSync(traitDir);

        const url = `${BASE_RCP_UPLOAD_URL}/${upload}`;
        try {
            promises.push(sharp((await axios.get(
                url,
                { responseType: 'arraybuffer', httpsAgent, timeout: 5000 },
            )).data).toFormat('png').sharpen({ sigma: 0.2 })
                .toFile(`${traitDir}/${name}.png`));
        } catch (e) {
            console.log(e);
            rcpTraits.push(trait);
        }

        if (promises.length > PROMISE_BATCH_LEN) {
            await Promise.all(promises);
            promises = [];
        }
    }
};
scrapeLayers('goblintown');