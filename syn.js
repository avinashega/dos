const raw = require('raw-socket');
const crypto = require('crypto');

const s = raw.createSocket({
    protocol: raw.Protocol.TCP
});


const genPseudoHeader = function (srcIp, dstIp, tcpPacketLength) {
    // new buffer of length 12. The pseudo-header length
    var pseudoHeader = new Buffer(12);
    // Important to fill with zeroes. Node.js does not zero the memory before creating the buffer.
    pseudoHeader.fill(0);
    pseudoHeader.writeUInt32BE(srcIp, 0); // write source ip, a 32 bit integer!
    pseudoHeader.writeUInt32BE(dstIp, 4); // write destination ip, a 32 bit integer!
    pseudoHeader.writeUInt8(6, 9); // specifies protocol. Here we write 6 for TCP. Other protocols have other numbers.
    // Write the TCP packet length of which we are generating a pseudo-header for.
    // Does not include the length of the psuedo-header.
    pseudoHeader.writeUInt16BE(tcpPacketLength, 10);
    return pseudoHeader;
};

const genSynPacket = function (srcIp, dstIp, srcPort, dstPort) {
    // A scaffolding TCP syn packet. Notice all zeroes except a few options.
    // The "few options" include setting the SYN flags.
    // Don't change it if you don't know what you're doing.
    var p = new Buffer('0000000000000000000000005002200000000000', 'hex');

    // Need 4 random bytes as sequence. Needs to be random to avoid collision.
    // You can choose your own random source. I chose the crypto module.
    crypto.randomBytes(4).copy(p, 4);

    p.writeUInt16BE(srcPort, 0); // Write source port
    p.writeUInt16BE(dstPort, 2); // Write destination port

    // generate checksum with utility function
    // using a pseudo header and the tcp packet scaffold
    var sum = raw.createChecksum(genPseudoHeader(srcIp, dstIp, p.length), p);

    // writing the checksum back to the packet. Packet complete!
    p.writeUInt16BE(sum, 16);

    return p;
};

module.exports =  function(src, dest, sp, dp) {
    const p = genSynPacket(src, dest, sp, dp);
    s.send(p, 0, p.length, dest, function () {
        console.log("sent TCP SYN");
    });

}