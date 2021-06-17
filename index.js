const nacl = require('tweetnacl');
const axios = require('axios');

exports.oleobot = (req, res) => {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');
    const body = req.rawBody;

    const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + body),
        Buffer.from(signature, 'hex'),
        Buffer.from(process.env.PUBLIC_KEY, 'hex')
    );

    if (!isVerified) {
        return res.status(401).end('invalid request signature');
    }

    if (req.body.type == 1) {
        res.status(200).json({
            type: 1
        });
    } else {
        try {
            if (/Discord\-Interactions\/[\d\.]+ \(\+https:\/\/discord.com\)/.test(req.get('user-agent'))) {
                res.status(200).json({
                    type: 5
                });
                axios({
                    url: `https://${req.headers.host}/oleobot`,
                    method: req.method,
                    headers: {
                        'X-Signature-Ed25519': req.get('X-Signature-Ed25519'),
                        'X-Signature-Timestamp': req.get('X-Signature-Timestamp')
                    },
                    data: req.body
                });
            } else {
                if (req.body.data.options) {
                    req.body.data.options = req.body.data.options.reduce((obj, item) => Object.assign(obj, {
                        [item.name]: item.value
                    }), {});
                }

                require(`./functions/${req.body.data.name}`).interaction(req, res);
            }
        } catch (err) {
            console.log(err);
            res.status(200).json({
                "type": 4,
                "data": {
                    "content": "Sorry, but something went wrong.",
                    "flags": 64
                }
            });
        }
    }
};