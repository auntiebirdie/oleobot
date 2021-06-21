const axios = require('axios');

module.exports = {
    "interaction": (req, res) => {
        const helpers = require('../helpers')(req, res);

        axios.get(
                "https://api.thecatapi.com/v1/images/search?limit=1&size=full", {}, {
                    "x-api-key": process.env.CATS_API_KEY
                }
            )
            .then((response) => {
                helpers.respond({
                    "content": response.data[0].url
                });
            });
    }
};
