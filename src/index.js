const { existsSync } = require('fs');
const fs = require('fs').promises;
const UserApiHandler = require('./UserApiHandler');
const WebhookHandler = require('./WebhookHandler');
const utils = require('./utils');


const apiHandlers = new Map();

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

                        if(!apiHandlers.get(user.webhookUrl)) apiHandlers.set(user.webhookUrl,new WebhookHandler(user.webhookUrl));

                        new UserApiHandler(user.id,apiHandlers.get(user.webhookUrl),user.interval || process.env.DEFAULT_CHECK_INTERVAL,timestamp);
                    } catch (error) {
                        log(error)

                        if(!apiHandlers.get(user.webhookUrl)) apiHandlers.set(user.webhookUrl,new WebhookHandler(user.webhookUrl));

                        new UserApiHandler(user.id,apiHandlers.get(user.webhookUrl),user.interval || process.env.DEFAULT_CHECK_INTERVAL);
                    }
                });
            }
            else {
                if(!apiHandlers.get(user.webhookUrl)) apiHandlers.set(user.webhookUrl,new WebhookHandler(user.webhookUrl));

                new UserApiHandler(user.id,apiHandlers.get(user.webhookUrl),user.interval || process.env.DEFAULT_CHECK_INTERVAL);
            }
        });

    })
}
else {
    log('No Config file found');
}
