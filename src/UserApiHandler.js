const fs = require('fs').promises;

const beatmapRegex = /^(\/b\/)([a-zA-Z0-9_\-\.]+)/;
const axios = require('axios');

module.exports = class UserApiHandler {

    constructor(osuId, webhookUrl, checkInterval, latestPostTimestamp = undefined) {
        this.osuId = osuId;
        this.webhookUrl = webhookUrl;
        this.latestPostTimestamp = latestPostTimestamp;
        this.checkInterval = checkInterval;
        this.fetchAndParseData();
    }

    async convertAndPostRecentsInOrder(recents) {
        if (recents.length === 0) return;

        const recent = recents.pop();
        const match = recent.beatmap.url.match(beatmapRegex);

        const embed = {};

        embed.title = `${recent.user.username} | ${recent.beatmapset.title} **${recent.beatmap.difficulty_rating}***`;
        embed.description = `Rank **${recent.rank}** | Accuracy **${(recent.accuracy * 100).toFixed(2)}%** | Combo **${recent.max_combo}**`;

        embed.url = recent.beatmap.url;

        embed.image = {
            url: recent.beatmapset.covers.cover
        };

        await axios.post(this.webhookUrl, { embeds: [embed] });

        this.convertAndPostRecentsInOrder(recents);
    }



    async fetchAndParseData() {
        try {
            log(`Checking for recent data for user ${this.osuId}`);

            const apiRecents = (await axios.get(`${process.env.OSU_API}/users/${this.osuId}/scores/recent`, { headers: { 'Authorization': `Bearer ${process.env.OSU_API_TOKEN}` } })).data;

            if (apiRecents.length >= 2) {
                apiRecents.sort(function (a, b) { return (new Date(a.created_at)) < (new Date(b.created_at)) })
            }

            const owner = this;

            const recents = apiRecents.filter(function (recent) {
                if (!owner.latestPostTimestamp) return true;
                return (new Date(recent.created_at)) > owner.latestPostTimestamp;
            });

            if (recents.length === 0) {
                log(`No recent data found for user ${this.osuId}, Checking again in ${this.checkInterval} seconds`);

                setTimeout(this.fetchAndParseData.bind(this), this.checkInterval * 1000);

                return;
            }

            await fs.writeFile(`${process.cwd()}/checkpoints/checkpoint-${this.osuId}.txt`, recents[0].created_at, 'utf-8');

            this.latestPostTimestamp = new Date(recents[0].created_at);

            log(`Posting ${recents.length} new activities for user ${this.osuId}, Checking again in ${this.checkInterval} seconds`);

            // post all the recents in order
            this.convertAndPostRecentsInOrder(recents);

            setTimeout(this.fetchAndParseData.bind(this), this.checkInterval * 1000);

        } catch (error) {
            log(error);
            setTimeout(this.fetchAndParseData.bind(this), this.checkInterval * 1000);
        }


    }
}