import { readLayersIntoMemory } from "./layers";


const thing = async () => {
    await readLayersIntoMemory(true);
};


thing();