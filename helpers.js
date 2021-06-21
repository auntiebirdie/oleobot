const axios = require('axios');
const headers = {
    headers: {
        "Authorization": `Bot ${process.env.BOT_TOKEN}`
    }
};

module.exports = function (req, res) {
    this.interaction = {
        id: req.body.id,
        token: req.body.token
    };

    this.respond = function(content) {
        axios.patch(
                `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${this.interaction.token}/messages/@original`,
                content,
                headers
            )
            .catch((err) => {
                this.errorHandler(err);
            })
            .finally(() => {
                res.end();
            });
    };

    this.errorHandler = function(err) {
        axios.patch(
                `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${this.interaction.token}/messages/@original`, {
                    "content": "Sorry, but something went wrong. ``(" + err.toString() + ")``",
                    "flags": 64
                },
                headers
            )
            .catch((err) => {
                console.log(err);
            });
    }

	return this;
}
