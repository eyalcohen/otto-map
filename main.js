var express = require('express');
var app = express();
var http_server = require('http').createServer(app);
var io = require('socket.io').listen(http_server);
var _ = require('underscore');

var dgram = require('dgram');
var udp_server = dgram.createSocket('udp4');

// Initializations
var dev = process.env.NODE_ENV !== 'production';

ipMap = dev ? { '127.0.0.1': 'dev1' } : {
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
};

var truckNames = _.uniq(_.values(ipMap));

var truckLocation = {};
_.each(truckNames, function(t) {
  truckLocation[t] = [];
});

var webport = dev ? 3000: 80;
var udpport = 23000;
var max_entries = 60;

// Web server

http_server.listen(webport, function () {
  console.log('app listening on port ' + webport);
});

app.use(express.static(__dirname + '/public'));

app.get('/truckgeo.json', function(req, res) {
  res.send(truckLocation);
});

// UDP
udp_server.on('error', (err) => {
  udp_server.close();
});

udp_server.bind(udpport);

udp_server.on('message', (msg, rinfo) => {
  var lat_lng = getLatLng(msg.toString('utf8'));
  var truck = ipMap[rinfo.address];
  if (truck) {
    var loc = {
      time: Date.now(),
      lat: lat_lng.lat,
      lng: lat_lng.lon
    }
    var arr = truckLocation[truck];
    arr.unshift(loc);
    var ageout = 1000 * 60 * 60
    if (arr[arr.length - 1].time + ageout < Date.now() ||
        arr.length > max_entries) {
      arr.pop();
    }
  }
});

// Push down incremental updates on socket

setInterval(function() {
  io.emit('geo', truckLocation);
}, 10000);

// for test
if (dev) {
  setInterval(function() {
    var messages = [
      new Buffer('$GPRMC,223229.00,A,4016.26077,N,10458.80805,W,40.683,0.79,171016,,,D*4'),
      new Buffer('$GPRMC,223229.00,A,4016.36077,N,10458.80805,W,40.683,0.79,171016,,,D*4'),
      new Buffer('$GPRMC,223229.00,A,4016.46077,N,10458.80805,W,40.683,0.79,171016,,,D*4')
    ];

    var which = Date.now() % messages.length;
    var client = dgram.createSocket('udp4');
    client.send(messages[which], 0, messages[which].length, 23000, '127.0.0.1', function(err, bytes) {
        if (err) throw err;
        client.close();
    });
  }, 1000);
}

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

