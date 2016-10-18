var socket = io();

var map;
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.78, lng: -122.4},
    zoom: 17
  });
}

var truckPaths = {};
var truckMarkers = {};
socket.on('geo', function(msg){

  var allMinLat = Number.MAX_VALUE;
  var allMaxLat = Number.MIN_VALUE;
  var allMinLng = Number.MAX_VALUE;
  var allMaxLng = Number.MIN_VALUE;

  $.each(msg, function(k, t) {

    if (t.length > 0) {

      var lats = t.map(function(m) { return m.lat });
      var lngs = t.map(function(m) { return m.lng });
      var minLat = Math.min.apply(null, lats);
      var maxLat = Math.max.apply(null, lats);
      var minLng = Math.min.apply(null, lngs);
      var maxLng = Math.max.apply(null, lngs);

      allMinLat = Math.min(allMinLat, minLat);
      allMaxLat = Math.min(allMaxLat, maxLat);
      allMinLng = Math.min(allMinLat, minLng);
      allMaxLng = Math.min(allMaxLat, maxLng);


      if (t.length > 1) {
        if (truckPaths[t.name]) {
          truckPaths[t.name].setMap(null);
        }
        truckPaths[t.name] = new google.maps.Polyline({
          path: t,
          geodesic: true,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });
        truckPaths[t.name].setMap(map);
      }
      truckMarkers[t.name] = new google.maps.Marker({
        position: new google.maps.LatLng(t[0].lat, t[0].lon),
        title: k,
        icon: 'truck.png'
      });
      truckMarkers[t.name].setMap(map);
    }
  });

  var bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(allMinLat, allMinLng), // sw
      new google.maps.LatLng(allMaxLat, allMaxLng)) // ne

  map.panToBounds(bounds);
});
