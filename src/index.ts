import { generateImages, generateMetadata } from "./generate";
import { NUM_TO_GENERATE } from "./utils";


const generate = async (numToGenerate: number) => {

    // await generateMetadata(numToGenerate);
    await generateImages(numToGenerate);
}

generate(NUM_TO_GENERATE);
