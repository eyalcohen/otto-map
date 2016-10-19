var socket = io();

var map;

var styledMapType = new google.maps.StyledMapType(
    [
    {
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#212121"
        }
      ]
    },
    {
      "featureType": "administrative",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#757575"
        },
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.country",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#9e9e9e"
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.locality",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#bdbdbd"
        }
      ]
    },
    {
      "featureType": "administrative.neighborhood",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "poi",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#181818"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "poi.park",
      "elementType": "labels.text.stroke",
      "stylers": [
        {
          "color": "#1b1b1b"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": "#2c2c2c"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.icon",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#8a8a8a"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#373737"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#3c3c3c"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.highway.controlled_access",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#4e4e4e"
        }
      ]
    },
    {
      "featureType": "road.local",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#616161"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#757575"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
        {
          "color": "#000000"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "elementType": "labels.text.fill",
      "stylers": [
        {
          "color": "#3d3d3d"
        }
      ]
    }
  ],
  {name: 'Styled'}
);

var colorWheel = [
  "#ffb014",
  "#07f41f",
  "#2552f7",
  "#fc2020",
  "#f7eb07",
];

var truckToIndex = function(truckName) {
  return truckName[truckName.length - 1];
};

var truckColor = function(truckName) {
  return colorWheel[truckToIndex(truckName) % colorWheel.length];
};

var truckPaths = {};
var truckMarkers = {};
var truckPosition = {};

// Initialize the map
$.get('/truckgeo.json', '', function(data, status) {
  renderMap(data);
});

// Incremental updates
socket.on('geo', function(data){
  // re-render all for now
  renderMap(data);
});

function initMap(trucks) {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.78, lng: -122.4},
    zoom: 13,
    mapTypeControlOptions: {
      mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
              'styled_map']
    }
  });

  //Associate the styled map with the MapTypeId and set it to display.
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  var legend = document.getElementById('legend');
  for (var key in trucks) {
    var div = document.createElement('div');
    var color = truckColor(key);
    div.innerHTML =
        '<div class="legend-item"><div class="legend-color" style = "background-color:' + color + '"></div>' +
        '<span class="legend-name">' + key + '</span></div>';
    legend.appendChild(div);
  };
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);

  // For demo
  truckMarkers['demo-start'] = new google.maps.Marker({
    position: new google.maps.LatLng(40.556397, -105.001330),
    title: 'Fort Collins Weigh Station',
    label: {
      text: 'S',
    },
    map: map,
  });

  truckMarkers['demo-end'] = new google.maps.Marker({
    position: new google.maps.LatLng(38.894023, -104.826370),
    title: 'Anheuser-Busch Distribution Center',
    label: {
      text: 'E',
    },
    map: map,
  });

}

var renderMap = function(data) {
  if (!map) {
    initMap(data);
  }

  $.each(data, function(k, t) {

    if (t.length > 0) {
      if (t.length > 1) {
        if (truckPaths[k]) {
          truckPaths[k].setMap(null);
        }
        truckPaths[k] = new google.maps.Polyline({
          path: t,
          geodesic: true,
          strokeColor: truckColor(k),
          strokeOpacity: 0.5,
          strokeWeight: 14
        });
        truckPaths[k].setMap(map);
      }
      if (!truckMarkers[k]) {
        truckMarkers[k] = new google.maps.Marker({
          position: new google.maps.LatLng(t[0].lat, t[0].lng),
          title: k,
          label: {
            text: truckToIndex(k),
            color: 'white'
          },
          map: map,
          icon: {
            url: 'truck_tiny.png',
            size: new google.maps.Size(64, 48),
            anchor: new google.maps.Point(32, 24),
            labelOrigin: new google.maps.Point(64, 12)
          },
        });
      } else {
        truckMarkers[k].setPosition(new google.maps.LatLng(t[0].lat, t[0].lng));
      }
    }
  });

  // Panning
  if ($('#checkbox-follow').is(':checked')) {
    var bounds = new google.maps.LatLngBounds();

    $.each(truckMarkers, function(k, v) {
      bounds.extend(v.getPosition());
    });

    $.each(truckPaths, function(k, v) {
      v.getPath().forEach(function(latlng) {
        bounds.extend(latlng);
      });
    });
    var extendPoint1 = new google.maps.LatLng(bounds.getNorthEast().lat() + 0.01, bounds.getNorthEast().lng() + 0.01);
    var extendPoint2 = new google.maps.LatLng(bounds.getSouthWest().lat() - 0.01, bounds.getSouthWest().lng() - 0.01);
    bounds.extend(extendPoint1);
    bounds.extend(extendPoint2);
    map.fitBounds(bounds);
  }

};
