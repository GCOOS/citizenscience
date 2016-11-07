/*
 Initial map and basemap Settings
 Home button, default extent button, geocoding button, measurement button,
 file uploading button, latlng info, highlight settings.
*/

// Create a new 'flag' to turn layer on/off
// Shouldn't appear on a map, thus use GeoJSON.
//TODO
var gbfLayer = L.geoJson(null),
    nacdLayer = L.geoJson(null);
var darkskykey = "fc1527cde610f13ea1ac9deb8a3c5c4c";

// ================================================================
/* Layer Size */
// ================================================================
$(window).resize(function() {
  sizeLayerControl();
});
function sizeLayerControl() {
  $(".leaflet-control-layers").css("max-height", $("#map").height() - 50);
}

// ================================================================
// Basemap Layers
// ================================================================
var esriOcean = L.layerGroup([
  L.esri.basemapLayer("Oceans"), L.esri.basemapLayer("OceansLabels")
]);
var esriImage = L.layerGroup([
  L.esri.basemapLayer("Imagery"), L.esri.basemapLayer("ImageryLabels")
]);
var esriTopo = L.esri.basemapLayer("Topographic");
var cartodb_light = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom:18
});
var cartodb_dark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom:18
});
var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
});

/* grouping basemap layers */
var basemapLayers = {
    "Light": cartodb_light,
    "Dark": cartodb_dark,
    "Ocean": esriOcean,
    "Imagery": esriImage,
    "Topography": esriTopo,
    "OpenStreetMap": osm
};

// ================================================================
// Ancillary Data Layers - Top Corner Layers Group
// ================================================================
var nauticalChart = L.esri.dynamicMapLayer({
  url:"http://seamlessrnc.nauticalcharts.noaa.gov/arcgis/rest/services/RNC/NOAA_RNC/MapServer/",
  opacity: 0.5
});
var platformLyr = L.esri.dynamicMapLayer({
  url: "http://gcoos3.tamu.edu/arcgis/rest/services/OceanEnergy/Platforms_Pipelines_ActiveLease/MapServer/",
  layers: [0],
  opacity: 0.8
});
var pipelineLyr = L.esri.dynamicMapLayer({
  url: "http://gcoos3.tamu.edu/arcgis/rest/services/OceanEnergy/Platforms_Pipelines_ActiveLease/MapServer/",
  layers: [1],
  opacity: 0.8
});
var riverstreamLyr = L.esri.featureLayer({
  url: "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/USA_Rivers_and_Streams/FeatureServer/0"
});

// ================================================================
/* grouping ancillayr data layers */
// ================================================================
var groupedOverlays = {
      "River stream": riverstreamLyr,
      "Platform": platformLyr,
      "Pipeline": pipelineLyr,
      "Nautical Chart <br/><hr>": nauticalChart,
      "<img src='static/images/map_green.png' width='28' height='28'>&nbsp;GBF Observations": gbfLayer,
      "<img src='static/images/map_pink.png' width='28' height='28'>&nbsp;NACD Observations": nacdLayer
};

// ================================================================
// Single marker cluster layer to hold all clusters
// ================================================================
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 13
});

// ================================================================
// Initial Map Settings
// ================================================================
map = L.map('map', {
  zoomControl: false,
  scrollWheelZoom: true,
  zoom: 6,
  center: [27.0, -88.5],
  attributionControl: true, //should be true for goecoding
  layers:[esriImage, markerClusters]
});
L.control.layers(basemapLayers, groupedOverlays).addTo(map);
startLoading();

// ================================================================
// Leaflet Map Base Functions
/* Zoom control (bottom right) */
// ================================================================
var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);
// ================================================================
/* Home button - back to default extent (bottom right)*/
// ================================================================
L.control.defaultExtent({
  position: "bottomright"
}).addTo(map);
// ================================================================
/* GPS enabled geolocation control set to follow the user's location (bottom right)*/
// ================================================================
var locateControl = L.control.locate({
  position: "bottomright",
  flyTo: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "fa fa-map-marker",
  metric: false,
  strings: {
    title: "My location",
    feetUnit: "feet",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 16,
    setView: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);
// ================================================================
/* Geocoding button (bottom right)*/
// ================================================================
// create the geocoding control and add it to the map
// esri geocode
var geosearchControl = L.esri.Geocoding.geosearch({
  position: "bottomright"
}).addTo(map);
var georesults = L.layerGroup().addTo(map);
geosearchControl.on('georesults', function(data){
  georesults.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    georesults.addLayer(L.marker(data.results[i].latlng));
  }
});

// ================================================================
/* leaflet draw (top left corner) */
// ================================================================
var drawnItems = new L.FeatureGroup();
map.addControl(new L.Control.Draw({
  edit: {
    featureGroup: drawnItems
  }
}));
map.on('draw:created', function(event) {
  var layer = event.layer;
  drawnItems.addLayer(layer);
});

// ================================================================
/* leaflet filelayer (load local files suc as GeoJSON, GPX, KML) */
// ================================================================
L.Control.FileLayerLoad.LABEL = '<i class="fa fa-folder-open"></i>';
L.Control.fileLayerLoad({
  fitBounds: true,
  layerOptions: {
    style: {
      color: 'red',
      opacity: 1.0,
      fillOpacity: 1.0,
      weight: 2,
      clickable: false
    }
  },
  // File size limit in kb (default: 1024) ?
  fileSizeLimit: 1024,
  // Restrict accepted file formats (default: .geojson, .kml, and .gpx) ?
  formats: [
    '.geojson',
    '.kml'
  ]
}).addTo(map);

// ================================================================
/* leaflet Measurement */
// ================================================================
var measureControl = L.control.measure({
  position: 'topleft'
}).addTo(map);

// ================================================================
// Hiding topleft tools
// ================================================================
$('.leaflet-top.leaflet-left').hide();

// ================================================================
/* Attribution control (bottom right. Order:bottom to top) */
// ================================================================
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);
var attributionControl = L.control({
  position: "bottomleft"
});
attributionControl.onAdd = function(map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "<span class='hidden-xs'><a href='http://gcoos.org/?page_id=5960' target='_blank'>GCOOS</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);


//=================================================================
// Weather Info from Forecast.io
//=================================================================
var redMarker = L.ExtraMarkers.icon({
  icon: 'fa-info-circle',
  prefix: 'fa',
  shape: 'circle',
  markerColor: 'red',
  iconColor: 'white'
});
var weatherMarker = L.marker([30, -90], {
  icon: redMarker,
  riseOnHover: true, // z-index offset 250
  zIndexOffset: 2000,
  draggable: true
}).addTo(map);
weatherMarker.on({
  click: function(e) {
    $("#weatherModal").modal("show");
  }
});
// every time the marker is dragged, update the weather container
weatherMarker.on('dragend', onDragEnd);
// Set the initial marker coordinate on load.
onDragEnd();

// ================================================================
// Weather update
// ================================================================
function onDragEnd() {
  //$("#latlng_div").html('');
  $("#weather_div").html('');
  var m = weatherMarker.getLatLng();
  //console.log('Latitude: ' + m.lat + ' Longitude: ' + m.lng);
  var address;
  $.ajax({
    // forecast.io
    url: "https://api.darksky.net/forecast/" + darkskykey + "/" + m.lat + "," + m.lng,
    dataType: "jsonp",
    success: function(pjson) { //prased json data
      $("#weather_div").append("<iframe id='forecast_embed' type='text/html' frameborder='0' height='245' width='100%'' src='http://forecast.io/embed/#lat=" + m.lat + "&lon=" + m.lng + "&name=" + "Lat:" + m.lat.toFixed(2) + "&deg; Long:" + m.lng.toFixed(2) + "&deg;'> </iframe>");
    },
    error: function(thrownError) {
      console.warn(thrownError);
    }
  });

  // ================================================================
  // Copy to ClipBoard
  // ================================================================
  var client = new ZeroClipboard($('.clip_button'));
  client.on('ready', function(event) {
    client.on('copy', function(event) {
      //var clip = m.lng.toFixed(5)+","+m.lat.toFixed(5);
      var clip = address;
      //console.log(clip);
      event.clipboardData.setData('text/plain', clip);
    });
    client.on("aftercopy", function(event) {
      alert("Copied text to clipboard: " + event.data["text/plain"]);
    });
  });
  client.on('error', function(event) {
    // console.log( 'ZeroClipboard error of type "' + event.name + '": ' + event.message );
    ZeroClipboard.destroy();
  });
}

// ================================================================
// Map Tools Settings
// ================================================================
/* Print */
/*
$("#print-btn").click(function() {
  $("#map").print({
    stylesheet: "../css/bootmap.css",
    //Add this on top
    append: "Citizen Science<br/>",
    //Add this at bottom
    //prepend: "<br />GCOOS"
  });
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
*/
/* Map Tools - all top left tools */
$("#tools-btn").click(function() {
  $('.leaflet-top.leaflet-left').toggle();
  return false;
});

// ================================================================
// Lat Long
// ================================================================
var mousemove = document.getElementById('mousemove');
map.on('mousemove', function(e){
  //console.log('checking');
  window[e.type].innerHTML = e.latlng.toString();
});

// ================================================================
// Layer Controls - Highlight for geoJson data
// ================================================================
var highlight = L.geoJson(null);
var highlightStyle = {
  stroke: false,
  fillColor: "#00FFFF",
  fillOpacity: 0.7,
  radius: 10
};
function clearHighlight() {
  highlight.clearLayers();
}
map.addLayer(highlight);

// ================================================================
// Clear feature highlight when map is clicked
// ================================================================
map.on("click", function(e) {
  highlight.clearLayers();
});

// ================================================================
$(document).on("click", ".feature-row", function(e) {
  $(document).off("mouseout", ".feature-row", clearHighlight);
  sidebarClick(parseInt($(this).attr("id"), 10));
});
$(document).on("mouseover", ".feature-row", function(e) {
  highlight.clearLayers().addLayer(L.circleMarker([$(this).attr("lat"), $(this).attr("lng")], highlightStyle));
});
$(document).on("mouseout", ".feature-row", clearHighlight);

// ================================================================
// Modal - Feature
// ================================================================
$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});
