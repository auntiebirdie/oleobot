const axios = require('axios');
const fs = require('fs');

module.exports = {
    "interaction": (req, res) => {
	            const helpers = require('../helpers')(req, res);
        try {
            fs.readFile('data/roddenberry.txt', function(err, data) {
                if (err) throw err;
                quotes = data.toString().split("\n");
                quotes.pop();

		                    helpers.respond({
                    "content": quotes[Math.floor(Math.random() * quotes.length)]
                });
            });
        } catch (err) {
            helpers.errorHandler(err);
        }
    }
};
