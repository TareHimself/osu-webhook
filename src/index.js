const { existsSync } = require('fs');
const fs = require('fs').promises;
const UserApiHandler = require('./UserApiHandler');
const utils = require('./utils');

if (existsSync(`${process.cwd()}/config.json`)) {
    process.env = require(`${process.cwd()}/config.json`);

    if(!existsSync(`${process.cwd()}/checkpoints`)) fs.mkdir(`${process.cwd()}/checkpoints`);

    utils.getOsuApiToken().then(() => {
        process.env.USERS.forEach((user) => {
            const fileExists = existsSync(`${process.cwd()}/checkpoints/checkpoint-${user.id}.txt`);
            if (fileExists) {
                fs.readFile(`${process.cwd()}/checkpoints/checkpoint-${user.id}.txt`,'utf8').then((data) => {
                    try {
                        const timestamp = new Date(data);
                        new UserApiHandler(user.id,user.webhookUrl,user.interval || process.env.DEFAULT_CHECK_INTERVAL,timestamp);
                    } catch (error) {
                        log(error)
                        new UserApiHandler(user.id,user.webhookUrl,user.interval || process.env.DEFAULT_CHECK_INTERVAL);
                    }
                });
            }
            else {
                new UserApiHandler(user.id,user.webhookUrl,user.interval || process.env.DEFAULT_CHECK_INTERVAL);
            }
        });

    })
}
else {
    log('No Config file found');
}
