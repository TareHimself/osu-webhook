export interface IDiscordEmbed {
	title: string;
	description: string;
	url: string;
	image: { url: string };
}

export interface IWebhookPayload {
	embeds: IDiscordEmbed[];
}

export interface IOsuUserScore {
	id: string;
	accuracy: number;
	mods: any;
	score: any;
	rank: any;
	user: {
		username: string;
	};
	pp: number;
	created_at: string;
	max_combo: number;
	beatmap: {
		url: string;
		difficulty_rating: number;
	};
	beatmapset: {
		covers: {
			cover: string;
		};
		title: string;
	};
}

export interface IConfig {
	OSU_CLIENT_ID: string;
	OSU_CLIENT_SECRETE: string;
	OSU_API: string;
	OSU_API_AUTH: string;
	DEFAULT_CHECK_INTERVAL: number;
	USERS: { id: string; webhook_url: string; interval?: number }[];
}

declare global {
	namespace NodeJS {
		interface ProcessEnv extends Dict<string> {
			OSU_CLIENT_ID: string;
			OSU_CLIENT_SECRETE: string;
			OSU_API: string;
			OSU_API_AUTH: string;
		}
	}
}
