const dgram = require('dgram')
const net = require('net')
const os = require('os')
const { inspect } = require('util')

const tcpPort = 55555
const tcpPortBuffer = Buffer.alloc(4)
tcpPortBuffer.writeInt32BE(tcpPort)
const serverPort = 48654

// const updDgramDestinationAddress = '255.255.255.255'
const updDgramDestinationAddress = '192.168.1.110'

const udpSocket = dgram.createSocket('udp4')
udpSocket.send(tcpPortBuffer, 0, 4, serverPort, updDgramDestinationAddress, () => console.log(`SENT TCPPORT ${tcpPort}`))

function parseInput(buf) {
    const input = []
    for (let i = 0; i < buf.length / 4; ++i)
        input.push(buf.readInt32BE(i * 4))
    const len1 = input[1]
    const len2 = input[1 + len1 + 1]
    return {
        task: input[0],
        arr1: input.slice(2, 2 + len1),
        arr2: input.slice(2 + len1 + 1, 2 + len1 + 1 + len2)
    }
}

const tcpServer = net.createServer(socket => {
    console.log('★★★ SERVER STARTED ★★★')
    socket.on('data', buf => {
        // console.log(`RECEIVED BUFFER => ${JSON.stringify(buf)}`)
        // console.log(`LENGTH = ${buf.length}`)
        const parsed = parseInput(buf)
        console.log(inspect(parsed))
    })
})
tcpServer.listen(tcpPort, os.networkInterfaces().ppp0[0].address)
