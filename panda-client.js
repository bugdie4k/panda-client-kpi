const dgram = require('dgram')
const net = require('net')
const os = require('os')

const tcpPort = 55555
const tcpPortBuffer = Buffer.alloc(4)
tcpPortBuffer.writeInt32BE(tcpPort)
const serverPort = 48654

const updDgramDestinationAddress = '255.255.255.255'
// const updDgramDestinationAddress = '192.168.1.110'

const udpSocket = dgram.createSocket('udp4')
udpSocket.on('listening', () => udpSocket.setBroadcast(true));

udpSocket.send(tcpPortBuffer, 0, 4,
    serverPort,
    updDgramDestinationAddress,
    () => console.log(`SENT TCPPORT ${tcpPort} TO ${updDgramDestinationAddress}\n`))

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
    console.log('★★★ SERVER STARTED ★★★\n')
    socket.on('data', buf => {
        const parsed = parseInput(buf)

        console.log(`-- RECEIVED TASK #${parsed.task} WITH ARRAYS OF LENGTHS ${parsed.arr1.length} AND ${parsed.arr2.length}`)
        console.log(JSON.stringify(parsed))

        const resArray = []
        for (let i = 0; i < parsed.arr1.length; ++i)
            resArray.push(parsed.arr1[i] + parsed.arr2[i])
        const responseBuffer = Buffer.alloc((resArray.length + 2) * 4)
        responseBuffer.writeInt32BE(parsed.task, 0)
        responseBuffer.writeInt32BE(resArray.length, 4)
        for (let i = 0; i < resArray.length; ++i) {
            responseBuffer.writeInt32BE(resArray[i], 8 + 4 * i)
        }

        console.log(`-- RESPONDING TO TASK #${parsed.task} WITH ARRAY OF LENGTH ${resArray.length}`)
        console.log(JSON.stringify(resArray))
        console.log()

        socket.write(responseBuffer)
    })
})
// os.networkInterfaces().ppp0[0].address,
tcpServer.listen(tcpPort, () => console.log(`LISTENING FOR TCP ON PORT ${tcpPort}`))
