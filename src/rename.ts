import fs from 'fs';

const renameFolder = async () => {
    const ogs = fs.readdirSync(__dirname + '/renaming/in/og').filter(c => c !== '.DS_Store');
    const news = fs.readdirSync(__dirname + '/renaming/in/new').filter(c => c !== '.DS_Store');

    console.log(ogs);
    // console.log(news);

    news.sort((a, b) => {
        // console.log(b.match(/[0-9]/g));
        // console.log(+(b.match(/[0-9]/g)!.join('')));
        return +(b.match(/[0-9]/g)!.join('')) - +(a.match(/[0-9]/g)!.join(''));
    }
    );
    // console.log(news);

    news.forEach((img, i) => {
        fs.copyFileSync(__dirname + '/renaming/in/new/' + img, __dirname + '/renaming/out/' + ogs[i]);
    });

};

renameFolder();