const axios = require('axios');

module.exports = {
    "interaction": (req, res) => {
        const helpers = require('../helpers')(req, res);

        axios.get(
		"http://ron-swanson-quotes.herokuapp.com/v2/quotes"
            )
            .then((response) => {
                helpers.respond({
                    "content": response.data[0]
                });
            });
    }
};
