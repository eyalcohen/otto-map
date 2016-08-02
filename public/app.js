var socket = io();

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.78, lng: -122.4},
    zoom: 17
  });
}

var circle;
socket.on('geo', function(msg){

  //console.log(msg);

  if (circle) {
    circle.setMap(null);
  }
  circle = new google.maps.Circle({
    strokeColor: '#FFFFFF',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#4682B4',
    fillOpacity: 0.35,
    map: map,
    center: {
      lat: 37.78155,
      lng: -122.3981075
    },
    radius: 38,
    title: 'HQ'
  });

});

var image_hq;
var truckMarker =[];
var truck_names = [];
var index = 0;

socket.on('geo', function(object) {
  image_hq = '/trucks/truck_blue_' + object.truckName.slice(5);

  var coordinates = new google.maps.LatLng(object.lat, object.lng);

  if (circle.getBounds().contains(coordinates)) {
    image_hq = '/trucks/truck_red_' + object.truckName.slice(5);
  }

  if (truck_names.length > 0) {
  for (var i=0; i<truck_names.length; i++) {
    if (truck_names[i] == object.truckName) {
      truck_names.splice(i,1);
      --i;
    }
  }

  for (var j = 0; j<truckMarker.length; j++) {
      if(truckMarker[j] == null) {
        continue;
      }
        if((truckMarker[j].title) === object.truckName) {
          truckMarker[j].setVisible(false);
          truckMarker[j].setMap(null);
          truckMarker.splice(j,1);
          --j;
          break;
        }
      }
  }

  truck_names.push(object.truckName);
  marker = new google.maps.Marker({
    position: {
      lat:object.lat,
      lng: object.lng
    },
    map: map,
    icon: image_hq,
    title: object.truckName
  });
  truckMarker[index] = marker;
  index++;


  if(index > 32) {
    index = 0;
  }
});
