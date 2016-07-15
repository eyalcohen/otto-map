var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});



const dgram = require('dgram');
const server = dgram.createSocket('udp4');


server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

server.on('message', (msg, rinfo) => {
  console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
});

server.on('listening', () => {
  var address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(52323);

// server listening 0.0.0.0:41234


//$GPGLL,3746.87668,N,12223.89940,W,002610.00,A,A*73

function parse_coordinates(string line) {
  var array = line.split(",");
  var coordinates = array[1] + ","  + array[3];
  return coordinates;
}