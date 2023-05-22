import axios from 'axios';

export const DiscordApi = axios.create({
	baseURL: `${process.env.OSU_API}`,
});

export const OsuApi = axios.create({
	baseURL: `${process.env.OSU_API}`,
});
