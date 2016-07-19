var express = require('express');
var app = express();
var http_server = require('http').createServer(app);
var io = require('socket.io').listen(http_server)

var dgram = require('dgram');
var udp_server = dgram.createSocket('udp4');

http_server.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

app.use(express.static(__dirname + '/public'));


// UDP
udp_server.on('error', (err) => {
  console.log(`udp_server error:\n${err.stack}`);
  udp_server.close();
});

udp_server.on('message', (msg, rinfo) => {
  console.log(`udp_server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  io.emit('geo', parseCoordinates(msg.toString('utf8')));
});

udp_server.on('listening', () => {
  var address = udp_server.address();
  console.log(`udp_server listening ${address.address}:${address.port}`);
});

udp_server.bind(52323);


//$GPGLL,3746.87668,N,12223.89940,W,002610.00,A,A*73

io.on('connection', function(socket){
  console.log('a user connected');
});

var parseCoordinates = function(line) {
  console.log(line);
  var array = line.split(",");
  var coord_pair =  {
    lat: Number(array[1] / 100) * (array[2] === 'N' ? 1 : -1),
    lng: Number(array[3] / 100) * (array[4] === 'E' ? 1 : -1)
  };
  return coord_pair;
}

