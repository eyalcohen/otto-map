var express = require('express');
var app = express();
var http_server = require('http').createServer(app);
var io = require('socket.io').listen(http_server);
var _ = require('underscore');

var dgram = require('dgram');
var udp_server = dgram.createSocket('udp4');


// Initializations
var dev = process.env.NODE_ENV !== 'production';

ipMap = {
  '166.248.27.143':  'otto1',
  '166.130.150.240': 'otto1',
  '166.211.33.148':  'otto2',
  '166.130.151.39':  'otto2',
  '166.211.128.244': 'otto3',
  '166.130.151.81':  'otto3',
  '166.248.27.144':  'otto4',
  '166.130.151.69':  'otto4',
  '166.211.33.149':  'otto5',
  '166.130.151.66':  'otto5',
  '127.0.0.1': 'dev'
};

var truckNames = _.uniq(_.values(ipMap));

var truckLocation = {};
_.each(truckNames, function(t) {
  truckLocation[t] = [];
});

var max_entries = 12;

console.log(truckNames, truckLocation);

// Web server

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
  // console.log(`udp_server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
  var lat_lng = getLatLng(msg.toString('utf8'));
  var truck = ipMap[rinfo.address];
  if (truck) {
    var loc = {
      time: Date.now(),
      lat: lat_lng.lat,
      lng: lat_lng.lon
    }
    truckLocation[truck].push(loc);
    if (truckLocation[truck].length > max_entries) {
      truckLocation[truck].pop();
    }
    // console.log(truckLocation);
    io.emit('geo', truckLocation)
  }
});

udp_server.on('listening', () => {
  var address = udp_server.address();
  console.log(`udp_server listening ${address.address}:${address.port}`);
});

udp_server.bind(23000);

// for test
if (dev) {
  setInterval(function() {
    var message = new Buffer('$GPRMC,223229.00,A,4016.26077,N,10458.80805,W,40.683,0.79,171016,,,D*4');
    var client = dgram.createSocket('udp4');
    client.send(message, 0, message.length, 23000, '127.0.0.1', function(err, bytes) {
        if (err) throw err;
        console.log('UDP message sent');
        client.close();
    });
  }, 5000);
}

// Socket IO

io.on('connection', function(socket){
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
      lon: Number(lon)
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

