import { existsSync, promises as fsAsync } from 'fs';
import './console';
let config: IConfig | undefined = undefined;
if (existsSync(`${process.cwd()}/config.json`)) {
	config = require(`${process.cwd()}/config.json`) as unknown as IConfig;

	process.env = {
		...process.env,
		OSU_CLIENT_ID: config.OSU_CLIENT_ID,
		OSU_CLIENT_SECRETE: config.OSU_CLIENT_SECRETE,
		OSU_API: config.OSU_API,
		OSU_API_AUTH: config.OSU_API_AUTH,
	};
}

if (config === undefined) {
	throw new Error('No Config file found!');
}

import { IConfig } from './types';
import OsuApiUser from './OsuApiUser';
import DiscordWebhook from './DiscordWebhook';
import { getOsuApiToken } from './utils';

const apiHandlers = new Map();

if (!existsSync(`${process.cwd()}/checkpoints`))
	fsAsync.mkdir(`${process.cwd()}/checkpoints`);

getOsuApiToken().then(() => {
	if (!config?.USERS.length) return;

	config.USERS.forEach((user) => {
		const fileExists = existsSync(
			`${process.cwd()}/checkpoints/checkpoint-${user.id}.txt`
		);
		if (fileExists) {
			fsAsync
				.readFile(
					`${process.cwd()}/checkpoints/checkpoint-${user.id}.txt`,
					'utf8'
				)
				.then((data) => {
					if (!config) return;
					try {
						const timestamp = new Date(data);

						if (!apiHandlers.get(user.webhook_url))
							apiHandlers.set(
								user.webhook_url,
								new DiscordWebhook(user.webhook_url)
							);

						new OsuApiUser(
							user.id,
							apiHandlers.get(user.webhook_url),
							user.interval || config.DEFAULT_CHECK_INTERVAL,
							timestamp
						);
					} catch (error) {
						console.error(error);

						if (!apiHandlers.get(user.webhook_url))
							apiHandlers.set(
								user.webhook_url,
								new DiscordWebhook(user.webhook_url)
							);

						new OsuApiUser(
							user.id,
							apiHandlers.get(user.webhook_url),
							user.interval || config.DEFAULT_CHECK_INTERVAL
						);
					}
				});
		} else {
			if (!config) return;
			if (!apiHandlers.get(user.webhook_url))
				apiHandlers.set(user.webhook_url, new DiscordWebhook(user.webhook_url));

			new OsuApiUser(
				user.id,
				apiHandlers.get(user.webhook_url),
				user.interval || config.DEFAULT_CHECK_INTERVAL
			);
		}
	});
});
