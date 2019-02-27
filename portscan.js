var net = require('net');

module.exports = function(ip, cb) {

    var host = ip;
    var start = 1;
    var end = 65535;
    var ports= [];
    var count = 0;

    while (start <= end) {

        var port = start;

        (function(port) {
            var s = new net.Socket();
//            console.log(host, port);
            s.connect(port, host, function() {
                console.log('OPEN: ' + port);
                ports.push(port);
            });
            s.on('data', function(data) {
                console.log(port +': '+ data);
                s.destroy();
            });

            s.on('error', function(e) {
                // silently catch all errors - assume the port is closed
                console.log(port +': '+ e);
                s.destroy();
            });
        })(port);

        start++;
    }
    setTimeout(10000, ()=> {
        cb(ports);
    })
};