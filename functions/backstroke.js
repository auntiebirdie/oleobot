const axios = require('axios');
const fs = require('fs');
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
        try {
            fs.readFile('data/backstroke.txt', function(err, data) {
                if (err) throw err;
                quotes = data.toString().split("\n");
                quotes.pop();

                axios.patch(
                        `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${interaction.token}/messages/@original`, {
                            "content": quotes[Math.floor(Math.random() * (quotes.length))],
                        },
                        headers
                    )
                    .catch((err) => {
                        errorHandler(interaction, err);
                    });
            });
        } catch (err) {
            errorHandler(interaction, err);
        }
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