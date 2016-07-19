var socket = io();

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 41.59746, lng: -87.34688},
    zoom: 12
  });
}

var circle;
socket.on('geo', function(msg){

  console.log(msg);

  if (circle) {
    circle.setMap(null);
  }
  circle = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map,
    center: msg,
    radius: 100
  });

  map.setCenter(msg);

});
