module.exports = function(ip) {
    const exec = require('child_process').exec;
    exec(`ping -c 999999 ${ip}`, console.log);
}