const dns = require('dns');

module.exports = function(host, cb) {
    dns.resolve4('google.com', (err, addresses) => {
        if (err) throw err;
        cb(addresses);
    });
};