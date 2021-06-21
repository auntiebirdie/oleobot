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

        const keyword = req.body.data.options.keyword;
        axios.get(
                `https://images-api.nasa.gov/search?q=${keyword}&media_type=image`
            ).then((response) => {
                const items = response.data.collection.items;
                const item = items[Math.floor(Math.random() * (items.length))];

                const result = {
                    title: item.data[0].title,
                    description: item.data[0].description_508,
                    image: {
                        url: item.links[0].href.replace(/thumb\.jpg/, 'orig.jpg')
                    },
                    footer: {
                        text: `© ${item.data[0].secondary_creator}`
                    }
                };

                axios.patch(
                        `https://discord.com/api/v8/webhooks/${process.env.APPLICATION_ID}/${interaction.token}/messages/@original`, {
                            "embeds": [result]
                        },
                        headers
                    )
                    .catch((err) => {
                        errorHandler(interaction, err);
                    });
            }).catch((err) => {
                errorHandler(interaction, err);
            })
            .finally(() => {
                res.end();
            });
    }
};

function fetchListing(depth = 1, config) {
    return new Promise((resolve, reject) => {
            if (depth > 10) {
                return reject("Sorry, but I wasn't able to find a good listing, but I'd be happy to try again.");
            } else {
                if (config && config.zip) {
                    var zip = config.zip;
                    depth = 10;
                } else {
                    var zipcodes = require('../data/zipcodes.json');
                    var zip = zipcodes[Math.floor(Math.random() * zipcodes.length)].zip.toString().padStart(5, '0');
                }

                if (config && config.status) {
                    var listingStatus = config.status;
                } else {
                    var listingStatuses = ['for_sale', 'for_rent', 'sold'];
                    var listingStatus = listingStatuses[Math.floor(Math.random() * listingStatuses.length)];
                }

                var url = `https://www.trulia.com/${listingStatus}/${zip}_zip/APARTMENT,CONDO,COOP,MULTI-FAMILY,SINGLE-FAMILY_HOME,TOWNHOUSE_type/`;

                axios.get(url, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Android 4.4; Mobile; rv:41.0) Gecko/41.0 Firefox/41.0'
                        }
                    })
                    .then((response) => {
                        var $ = cheerio.load(response.data);
                        var output = {};

                        var listings = JSON.parse($('script[id="__NEXT_DATA__"]').html()).props.searchData.homes;

                        if (!listings || listings.length == 0) {
                            throw Error(`Nothing in ${zip} - trying a different zip code!`);
                        }

                        var listing = listings[Math.floor(Math.random() * (listings.length))];
                        if (!listing.location.fullLocation) {
                            console.log(listing.location);
                        }
                        output.title = `:house: ${listing.location.fullLocation}`;
                        output.url = `https://www.trulia.com${listing.url}`;
                        output.description = output.url + "\r\n\r\n";
                        output.description += `**:dollar: ${listing.price.formattedPrice}** <:blank:727174787977314374> `;
                        output.description += `:bed: ${listing.bedrooms.formattedValue} <:blank:727174787977314374> `;
                        output.description += `:toilet: ${listing.bathrooms.formattedValue}`;
                        output.image = {
                            url: listing.media.photos && listing.media.photos.length > 0 ? listing.media.photos[0].url.small : listing.media.heroImage.url.small
                        };

                        output.image.url = output.image.url.replace('/thumbs_3/', '/thumbs_5/');


                        return resolve(output);
                    })
                    .catch((error) => {
                        if (error.response && (error.response.status != 404 || !error.response.status)) {
                            reject("It seems like something may have gone awry with my connection. Please wait a few minutes before trying again.");
                        } else {
                            setTimeout(() => {
                                resolve(fetchListing(++depth, config));
                            }, 750);
                        }
                    });
            }
        })
        .catch((error) => {
            console.log(error);
            return error;
        });
}

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
