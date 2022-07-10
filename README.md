# An automatic osu webhook for discord
* Posts recently played maps of users specified in the config at a specified discord webhook.

# How to use
* Install NodeJs (duhhh),
* Rename 'example_config.json' to 'config.json'.
* Fill in the details in 'config.json'.
* In the console type in 'npm start' or 'node ./src/index.js' and press Enter.

# Config.json Guide
## OSU_CLIENT_ID and OSU_CLIENT_SECRETE
* You have to use your own api values or get some [here.](https://osu.ppy.sh/p/api)
## DEFAULT_CHECK_INTERVAL
* The interval in seconds that the program will poll the Osu! api for updates.
## USERS
* This is an array of [User](#user) objects.
## User
## id (required)
* The osu id of the user (i.e. the numbers at the end of their website profile)
## webhookUrl (required)
* The discord webhook url to post the embed to.
## interval (optional)
* The interval for this specific user (overiddes [DEFAULT_CHECK_INTERVAL](#default-check-interval))

# Questions and Suggestions
* Dm Tare#3664 on discord
