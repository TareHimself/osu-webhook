import axios from 'axios';
import util from 'util';
import * as fs from 'fs';
const logStream = fs.createWriteStream('./main.log', { flags: 'a' });

function time(sep = '') {
	const currentDate = new Date();

	if (sep === '') {
		return currentDate.toUTCString();
	}

	const date = ('0' + currentDate.getUTCDate()).slice(-2);

	const month = ('0' + (currentDate.getUTCMonth() + 1)).slice(-2);

	const year = currentDate.getUTCFullYear();

	const hours = ('0' + currentDate.getUTCHours()).slice(-2);

	const minutes = ('0' + currentDate.getUTCMinutes()).slice(-2);

	const seconds = ('0' + currentDate.getUTCSeconds()).slice(-2);

	return `${year}${sep}${month}${sep}${date}${sep}${hours}${sep}${minutes}${sep}${seconds}`;
}

export async function getOsuApiToken() {
	const request = {
		client_id: process.env.OSU_CLIENT_ID,
		client_secret: process.env.OSU_CLIENT_SECRETE,
		grant_type: 'client_credentials',
		scope: 'public',
	};

	const response = (await axios.post(`${process.env.OSU_API_AUTH}`, request))
		.data;

	process.env.OSU_API_TOKEN = response.access_token;

	setTimeout(getOsuApiToken, response.expires_in * 1000 - 200);

	console.info('Done fetching Osu Api Token');
}
