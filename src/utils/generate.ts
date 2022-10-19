import sharp from 'sharp';
import { CollectionTraits, Trait } from '../types';
import { FOLDER_BATCH_SIZE, rand, randomInt } from './general';

const NUM_COLLECTIONS_SO_FAR = 5;


const pickRandomLayer = (layers: Record<string, string[]>, collectionLayers: CollectionTraits, limitedTraitPool: string[] = []): Trait => {
    const collections = Object.keys(layers);
    const randCollection = collections[randomInt(collections.length)];
    if (!layers[randCollection]) console.log(randCollection);
    const randTraitType = layers[randCollection][randomInt(layers[randCollection].length)];
    let possibleTraits: Trait[];
    if (limitedTraitPool.length) {
        possibleTraits = collectionLayers[randCollection][randTraitType].filter(t => limitedTraitPool.includes(t.value));
    } else {
        possibleTraits = collectionLayers[randCollection][randTraitType];
    }
    if (!possibleTraits || !possibleTraits.length) {
        console.log(randCollection);
        console.log(randTraitType);
    }
    const randTrait = possibleTraits[randomInt(possibleTraits.length)];
    // console.log(randTrait);

    return randTrait;
};

export const generateRandom = async (collectionLayers: CollectionTraits) => {
    const toMash: Trait[] = [];
    //Pick background
    const bg = pickRandomLayer(
        {
            goblintown: ['background'],
            mfers: ['background'],
            nouns: ['backgrounds'],
            tinydinos: ['background'],
            landmarks: ['background'],
        }, collectionLayers
    );
    toMash.push(bg);
    //Pick body
    const body = pickRandomLayer(
        {
            goblintown: ['body'],
            mfers: ['type'],
            nouns: ['bodies'],
            tinydinos: ['body'],
            moonbirds: ['Body']
        }, collectionLayers
    );
    toMash.push(body);

    if (body.collection === 'nouns') {
        if (rand() < 0.7)
            toMash.push(
                pickRandomLayer(
                    {
                        nouns: ['accessories'],
                    }, collectionLayers,
                ));
    }

    //Pick head
    let head: Trait | undefined = undefined;

    const pickHeadNormal = () => pickRandomLayer(
        {
            goblintown: ['head'],
            nouns: ['heads'],
        }, collectionLayers
    );

    if (body.collection === 'mfers') {
        if (rand() > 0.5)
            head = pickRandomLayer(
                {
                    mfers: ['shirt'],
                }, collectionLayers
            );
    } else if (['moonbirds'].includes(body.collection)) {
        // tinydinos and moonbirds have body and head as one
        if (rand() > 0.5) {
            head = pickHeadNormal();
        }
        // else if (body.collection === 'moonbirds') {
        //     head = pickRandomLayer(
        //         {
        //             moonbirds: ['Beak'],
        //         }, collectionLayers);
        // }
    } else if (['tinydinos'].includes(body.collection)) {
        toMash.push(pickRandomLayer(
            {
                tinydinos: ['body'],
            }, collectionLayers
        ));
    }
    else {
        head = pickHeadNormal();
    }
    if (head)
        toMash.push(head);

    const addGoblinEyes = () => {
        toMash.push(pickRandomLayer(
            {
                goblintown: ['lefteye'],
            }, collectionLayers
        ));

        toMash.push(pickRandomLayer(
            {
                goblintown: ['righteye'],
            }, collectionLayers
        ));
    };

    const randNose = rand();
    const addGoblinNose = () => {
        toMash.push(pickRandomLayer(
            {
                goblintown: ['nose'],
            }, collectionLayers
        ));
    };

    //eyes
    const randEyes = rand();
    if (randEyes < 1.3 / NUM_COLLECTIONS_SO_FAR) {
        addGoblinEyes();

    } else if (head && head.collection === 'mfers' && randEyes < 0.3) {
        toMash.push(pickRandomLayer(
            {
                mfers: ['eyes'],
                tinydinos: ['eyes'],
            }, collectionLayers
        ));
    } else if (['moonbirds'].includes(head?.collection ?? '')) {
        toMash.push(pickRandomLayer(
            {
                nouns: ['glasses'],
                moonbirds: ['Eyes'],
            }, collectionLayers
        ));
    }
    else if (['nouns'].includes(head?.collection ?? '')) {
        toMash.push(pickRandomLayer(
            {
                nouns: ['glasses'],
                moonbirds: ['Eyes'],
                mfers: ['eyes'],
            }, collectionLayers
        ));

    } else if (['tinydinos'].includes(body.collection ?? '')) {
        if (randEyes < 0.3) addGoblinEyes();
        else
            toMash.push(pickRandomLayer(
                {
                    nouns: ['glasses'],
                    tinydinos: ['eyes'],
                    mfers: ['eyes'],
                }, collectionLayers
            ));
    }
    else {
        if (randEyes < 0.4) addGoblinEyes();
        else {
            toMash.push(pickRandomLayer(
                {
                    nouns: ['glasses'],
                    moonbirds: ['Eyes'],
                    mfers: ['eyes'],
                }, collectionLayers
            ));
        }
    }

    if (toMash[toMash.length - 1].collection === 'moonbirds' && randEyes < 0.8) {

        toMash.push(pickRandomLayer(
            {
                moonbirds: ['Eyewear'],
            }, collectionLayers
        ));
    }



    //mouth
    const addMferOrGobMouth = () => {
        if ((['nouns'].includes(toMash[toMash.length - 1].collection) && randNose < 0.4)
            || (['goblintown'].includes(toMash[toMash.length - 1].collection) && randNose < 0.66)
        ) {
            toMash.push(pickRandomLayer(
                {
                    goblintown: ['mouth'],
                }, collectionLayers
            ));
            addGoblinNose();
        }
        else
            toMash.push(pickRandomLayer(
                {
                    mfers: ['mouth'],
                }, collectionLayers
            ));
    };
    const randMouth = rand();
    if (toMash.find(t => t.traitType === "Eyes" && t.collection === 'moonbirds')) {
        toMash.push(pickRandomLayer(
            {
                moonbirds: ['Beak']
                // goblintown: ['mouth'],
            }, collectionLayers
        ));
    }
    else if (toMash.find(t => t.collection === 'goblintown' && (t.traitType === 'eyes' || t.traitType === 'head'))) {
        if (toMash.find(t => t.collection === 'goblintown' && t.traitType === 'nose')) {
            toMash.push(pickRandomLayer(
                {
                    goblintown: ['mouth']
                }, collectionLayers
            ));
        } else {
            toMash.push(pickRandomLayer(
                {
                    moonbirds: ['Beak'],
                    mfers: ['mouth']
                }, collectionLayers
            ));
        }

    }
    //
    else if (body.collection === 'tinydinos') {
        if (randMouth < 0.6 && !toMash.find(t => t.collection === 'tinydinos' && t.traitType === 'eyes')) {
            addMferOrGobMouth();
        }
    } else if (head?.collection === 'mfers') {
        if (!toMash.find(t => t.collection === 'goblintown' && t.traitType === 'nose'))
            toMash.push(pickRandomLayer(
                {
                    mfers: ['mouth'],
                    goblintown: ['mouth'],
                    moonbirds: ['Beak'],
                }, collectionLayers
            ));
    } else if (head?.collection === 'nouns') { }
    else {
        addMferOrGobMouth();
    }



    //hat
    const ranHat = rand();
    if (head?.collection === 'tinydinos') {
        if (ranHat < 0.33)
            toMash.push(pickRandomLayer(
                {
                    tinydinos: ['head'],
                }, collectionLayers
            ));
        else if (ranHat < 0.66)
            toMash.push(pickRandomLayer(
                {
                    tinydinos: ['spikes'],
                }, collectionLayers
            ));
    } else if (['moonbirds'].includes(head?.collection ?? '') && !toMash.find(t => t.traitType === 'righteye' || t.traitType === 'lefteye')) {
        if (ranHat < 0.9)
            if (ranHat < 0.15) {
                toMash.push(pickRandomLayer(
                    {
                        tinydinos: ['head'],
                    }, collectionLayers
                ));
            } else {
                toMash.push(pickRandomLayer(
                    {
                        moonbirds: ['Headwear'],
                    }, collectionLayers,
                ));
            }
    }
    else if (['mfers'].includes(head?.collection ?? ''))
        if (ranHat < 0.7)
            toMash.push(pickRandomLayer(
                {
                    mfers: [
                        'hat under headphones',
                        'hat over headphones',
                        'headphones',
                        'long hair',
                        'short hair'
                    ],
                }, collectionLayers
            ));
        else if (ranHat < 0.9)
            toMash.push(pickRandomLayer(
                {
                    moonbirds: ['Headwear'],
                }, collectionLayers,
                [
                    'Dancing Flame (Enlightened Variant)',
                    'Dancing Flame',
                    'Dancing Flame (Jade)',
                    'Halo (Enlightened Variant)',
                    'Halo',
                    'Halo (Jade)',
                    'Rain Cloud',
                    'Grail',
                    'Tiny Crown',
                    'Tiny Crown (Enlightened)',
                    'Tiny Crown (Jade)',
                    'Gremplin',
                    "Skully",
                    "Skully (Jade)"
                ]
            ));

        else if ('goblintown' === head?.collection) {
            if (ranHat < 0.25)
                toMash.push(pickRandomLayer(
                    {
                        moonbirds: ['Headwear'],
                    }, collectionLayers,
                    [
                        'Dancing Flame (Enlightened Variant)',
                        'Dancing Flame',
                        'Dancing Flame (Jade)',
                        'Halo (Enlightened Variant)',
                        'Halo',
                        'Halo (Jade)',
                        'Rain Cloud',
                        'Grail',
                        'Tiny Crown',
                        'Tiny Crown (Enlightened)',
                        'Tiny Crown (Jade)',
                        'Gremplin',
                        "Skully",
                        "Skully (Jade)"
                    ]
                ));
        }


    //clothes / accessories
    const accRand = rand();
    if (body.collection === 'moonbirds') {
        if (accRand < 0.7)
            toMash.push(
                pickRandomLayer(
                    {
                        moonbirds: ['Outerwear'],
                    }, collectionLayers,
                ));
    } else if (body.collection === 'mfers') {
        if (accRand < 0.6)
            toMash.push(
                pickRandomLayer(
                    {
                        mfers: ['shirt'],
                    }, collectionLayers,
                ));
        if (accRand < 0.6 && accRand > 0.2 && !toMash.find(t => t.collection === 'moonbirds' && t.traitType === 'Eyes'))
            toMash.push(
                pickRandomLayer(
                    {
                        mfers: ['smoke'],
                    }, collectionLayers,
                ));
        if (accRand > 0.5)
            toMash.push(
                pickRandomLayer(
                    {
                        mfers: ['4_20 watch'],
                    }, collectionLayers,
                ));

    } else if (body.collection === 'tinydinos') {
        if (accRand < 0.4)
            toMash.push(
                pickRandomLayer(
                    {
                        tinydinos: ['feet'],
                    }, collectionLayers,
                ));
    }

    return toMash;
};

export const generateSingleImage = async (traits: Trait[], i: number, outDir: string) => {
    await (sharp(traits[0].data)
        .composite(
            traits.map((t, i) => (
                { input: traits[i].data }
            ))
        )).toFormat('webp').toFile(`${outDir}/${Math.floor(i / FOLDER_BATCH_SIZE) * FOLDER_BATCH_SIZE}/${i}.webp`);
};
