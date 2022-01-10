const axios = require('axios');
const { response } = require('express');


module.exports = class WebhookHandler {
    constructor(url = '', queue = undefined) {
        if (url === '') {
            throw new Error('No post url given');
        }
        this.url = url;
        this.queue = queue || [];
        this.isPosting = false;
    }

    async postWebhookPayload(payload = undefined) {

        if (payload && this.isPosting) {
            this.queue.push(payload);
            log(`Pushing to webhook queue, current queue length ${this.queue.length}`);
            return;
        }

        if(!payload && this.queue.length === 0){
            if(this.isPosting) this.isPosting = false;
            return;
        }

        const data = payload || this.queue.shift();

        this.isPosting = true;
        const result = await axios.post(this.url, data).catch((error) => {
            log('An error occured and Tare forgot to prepare for it, L programmer moment.');
            setTimeout(this.postWebhookPayload.bind(this), 2000);
            return;
        })

        if (this.queue.length !== 0) {
            setTimeout(this.postWebhookPayload.bind(this), 2000);
            return;
        }

        this.isPosting = false;
    }
}