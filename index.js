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

var object = {
  truckName: "",
  lat: 0.0,
  lng: 0.0,
  active: true
}

udp_server.on('message', (msg, rinfo) => {
  console.log(`udp_server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  lat_lng = getLatLng(msg.toString('utf8'));
  var object = {
    truckName: translateIpToName(rinfo.address),
    lat: lat_lng.lat,
    lng: lat_lng.lng,
    active: true
  }
  console.log(object);
  // io.emit('geo', getLatLng(msg.toString('utf8')));
  io.emit('geo', object)
});

udp_server.on('listening', () => {
  var address = udp_server.address();
  var temp = `208.72.139.82`;
  console.log(`udp_server listening ${address.address}:${address.port}`);
  console.log(`at&t signal ${temp}:${address.port}`);
});

udp_server.bind(52323);


//$GPGLL,3746.87668,N,12223.89940,W,002610.00,A,A*73

io.on('connection', function(socket){
  console.log('a user connected');
});

// This function parses NMEA, RMC values into decimal longitude and latitude coordinates.
function getLatLng(d) {
    nmea = d.split(",");

    // LAT: North South
    coordNS = nmea[3];
    direction = nmea[4];
    days = coordNS.substring(0, 2);
    minutes = coordNS.substring(2, 10);
    lat = toDD(days,minutes, direction);

    // East West
    coordEW = nmea[5];
    direction = nmea[6];
    days = coordEW.substring(0, 3);
    minutes = coordEW.substring(3, 11);
    lon = toDD(days, minutes, direction);
    // console.log("\n"+lat+"\n"+lon);
    var coord_pair = {
      lat: Number(lat),
      lng: Number(lon)
    }
    return coord_pair;
}

function toDD(degrees, minutes, direction) {
   out = parseInt(degrees) + (parseFloat(minutes) / 60);
   if(direction == "S" || direction == "W") {
      out = out * -1.0;
   }
   return out;
}

function translateIpToName(ip) {
  var split_addr = ip.split('.');
  var num_trucks = 5;
  // Usually it's aaa.bbb.ccc.ddd for ip addresses
  var ddd = Number(split_addr[3]);
  var otto_truck = "Otto ";
  for (var i=1; i<=num_trucks; i++) {
    if (ddd == i+100) {
      otto_truck += i.toString();
      return otto_truck;
    }
  }
}