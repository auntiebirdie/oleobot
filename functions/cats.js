const axios = require('axios');
const headers = {
    headers: {
        "Authorization": `Bot ${process.env.BOT_TOKEN}`
    }
};

module.exports = {
    "interaction": (req, res) => {
        const interaction = {
            id: req.body.id,
            token: req.body.token
        };

        axios.get(
                "https://api.thecatapi.com/v1/images/search?limit=1&size=full", {}, {
                    "x-api-key": process.env.CATS_API_KEY
                }
            )
            .then((response) => {
                var img = response.data[0].url;

                axios.patch(
                        `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${interaction.token}/messages/@original`, {
                            "content": img
                        },
                        headers
                    )
                    .catch((err) => {
                        errorHandler(interaction, err);
                    });
            })
            .catch((err) => {
                errorHandler(interaction, err);
            })
            .finally(() => {
                res.end();
            });
    }
};

function errorHandler(interaction, err) {
    axios.patch(
            `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${interaction.token}/messages/@original`, {
                "content": "Sorry, but something went wrong. ``(" + err.toString() + ")``",
                "flags": 64
            },
            headers
        )
        .catch((err) => {
            console.log(err);
        });
};
