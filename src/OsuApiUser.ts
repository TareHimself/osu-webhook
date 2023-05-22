import * as fs from 'fs/promises';
import DiscordWebhook from './DiscordWebhook';
import { OsuApi } from './rest';
import { IDiscordEmbed, IOsuUserScore } from './types';

const beatmapRegex = /^(\/b\/)([a-zA-Z0-9_\-\.]+)/;

export default class OsuApiUser {
	user_id: string;
	webhook: DiscordWebhook;
	latest_post_timestamp: undefined | Date;
	check_interval: number;

	constructor(
		user_id: string,
		webhook: DiscordWebhook,
		check_interval: number,
		latest_post_timestamp: Date | undefined = undefined
	) {
		this.user_id = user_id;
		this.webhook = webhook;
		this.latest_post_timestamp = latest_post_timestamp;
		this.check_interval = check_interval;
		this.fetchAndParseData();
	}

	async fetchAndParseData() {
		try {
			console.info(`Checking for recent data for user ${this.user_id}`);

			const apiRecents = (
				await OsuApi.get<IOsuUserScore[]>(
					`/users/${this.user_id}/scores/recent`,
					{ headers: { Authorization: `Bearer ${process.env.OSU_API_TOKEN}` } }
				)
			).data;

			if (apiRecents.length >= 2) {
				apiRecents.sort((a, b) => {
					return (
						new Date(a.created_at).getSeconds() -
						new Date(b.created_at).getSeconds()
					);
				});
			}

			const owner = this;

			const recents = apiRecents.filter(function (recent) {
				if (!owner.latest_post_timestamp) return true;
				return new Date(recent.created_at) > owner.latest_post_timestamp;
			});

			if (recents.length === 0) {
				console.info(
					`No recent data found for user ${this.user_id}, Checking again in ${this.check_interval} seconds`
				);

				setTimeout(
					this.fetchAndParseData.bind(this),
					this.check_interval * 1000
				);

				return;
			}

			await fs.writeFile(
				`${process.cwd()}/checkpoints/checkpoint-${this.user_id}.txt`,
				recents[0].created_at,
				'utf-8'
			);

			this.latest_post_timestamp = new Date(recents[0].created_at);

			console.info(
				`Posting ${recents.length} new activities for user ${this.user_id}, Checking again in ${this.check_interval} seconds`
			);

			recents.map((recent) => {
				const embed: IDiscordEmbed = {
					title: `${recent.user.username} | ${recent.beatmapset.title} **${recent.beatmap.difficulty_rating}***`,
					description: `Rank **${recent.rank}** | Accuracy **${(
						recent.accuracy * 100
					).toFixed(2)}%** | Combo **${recent.max_combo}** | ${
						recent.mods.length > 0
							? 'Mods ' + recent.mods.map((a) => `**${a}**`).join(' ')
							: 'No Mods'
					}`,
					url: recent.beatmap.url,
					image: {
						url: recent.beatmapset.covers.cover,
					},
				};

				// post all the recents in order
				owner.webhook.postWebhookPayload({ embeds: [embed] });
			});

			setTimeout(this.fetchAndParseData.bind(this), this.check_interval * 1000);
		} catch (error) {
			console.error(error);
			setTimeout(this.fetchAndParseData.bind(this), this.check_interval * 1000);
		}
	}
}
