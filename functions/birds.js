const axios = require('axios');

module.exports = {
    "interaction": (req, res) => {
        const helpers = require('../helpers')(req, res);

        axios.get(
                "https://shibe.online/api/birds"
            )
            .then((response) => {
                helpers.respond({
                    "content": response.data[0]
                });
            });
    }
};
