var express = require('express');
var app = express();
var http = require('http').Server(app);
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var io = require('socket.io')(http);

// Express

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


// UDP
server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  // var socket = socket.connected;
  // console.log(socket);
  // if (socket) {
  /*
    io.emit('', function(socket){
      console.log('geo', { test: 'test' });
    });
  */
  //}
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(52323);

// Socket IO


//$GPGLL,3746.87668,N,12223.89940,W,002610.00,A,A*73

function parse_coordinates(string line) {
  var array = line.split(",");
  var coord_pair =  {
    lat: array[1],
    long: array[3]
  };
  return coord_pair;
}
io.on('connection', function(socket){
  console.log('a user connected');
});

