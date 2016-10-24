/* global L:false */
var gbfSearch = [], gbfChart = [];
var nacdSearch = [], nacdChart = [];
var flaqSearch = [], flaqChart = [];
// popup window content variables
var flow, algae, wcolor, clarity, surface, conditions, odor, weather, tide;

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
//TODO (4) Edit initial basemap if necessary
/*
var esriOcean = L.layerGroup([
  L.esri.basemapLayer("Oceans"), L.esri.basemapLayer("OceansLabels")
]);
var esriImage = L.layerGroup([
  L.esri.basemapLayer("Imagery"), L.esri.basemapLayer("ImageryLabels")
]);
*/
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
var baseLayers = {
    "Light": cartodb_light,
    "Dark": cartodb_dark,
    //"Esri World Imagery": esriImage,
    //"Ocean": esriOcean,
    "Topography": esriTopo,
    "OpenStreetMap": osm
};

// ================================================================
// Initial Map Settings
// ================================================================
map = L.map("map", {
  zoomControl: false,
  scrollWheelZoom: true,
  zoom: 6,
  center: [27.0, -88.5],
  attributionControl: false
});
L.esri.basemapLayer('Imagery').addTo(map);
//L.esri.basemapLayer('ImageryLabels').addTo(map);
startLoading();

function setBasemap(basemap) {
  if (layer) {
    map.removeLayer(layer);
  }
  layer = L.esri.Vector.basemap(basemap);
  map.addLayer(layer);
}
function changeBasemap(basemaps){
  var basemap = basemaps.value;
  setBasemap(basemap);
}

// ================================================================
// Leaflet Map Base Functions
/* Zoom control (bottom right) */
// ================================================================
var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);
/* Home button - back to default extent (bottom right)*/
// ================================================================
L.control.defaultExtent({
  position: "bottomright"
}).addTo(map);

/* GPS enabled geolocation control set to follow the user's location (bottom right)*/
// ================================================================
var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
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
    maxZoom: 17,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);
map.on('dragstart', locateControl._stopFollowing, locateControl);

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

/* leaflet Measurement */
// ================================================================
var measureControl = new L.Control.Measure({
  position: 'topleft'
});

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
$('.leaflet-top.leaflet-left').hide();

// esri geocode
/*
var geoSearchControl = L.esri.Geocoding.geosearch({
  position: 'bottomright',
  placeholder: 'Search for places or addresses',
  title: 'Location Search'
}).addTo(map);
var results = L.layerGroup().addTo(map);
geoSearchControl.on('results', function(data){
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
  }
  console.log('geocoding!');
});
*/

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
  div.innerHTML = "<span class='hidden-xs'><a href='http://gcoos.tamu.edu/?page_id=5960' target='_blank'>GCOOS</a> | </span><a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);


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
var riverstreamLyr = L.esri.dynamicMapLayer({
  url: "http://earthobs1.arcgis.com/arcgis/rest/services/Live_Stream_Gauges/MapServer/",
  layers: [0]
});


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

function onDragEnd() {
  $("#latlng_div").html('');
  $("#weather_div").html('');
  var m = weatherMarker.getLatLng();
  //console.log('Latitude: ' + m.lat + ' Longitude: ' + m.lng);
  var address;
  $.ajax({
    // forecast.io based on gcoos3@gmail.com
    url: "https://api.forecast.io/forecast/fc1527cde610f13ea1ac9deb8a3c5c4c/" + m.lat + "," + m.lng,
    dataType: "jsonp",
    success: function(pjson) { //prased json data
      //console.log(pjson);
      L.esri.Geocoding.reverseGeocode().latlng([m.lat, m.lng]).run(function(error, result) {
        if (result) {
          address = result.address.Match_addr;
        } else {
          address = "Cannot find";
        }
        $('#reverseAddress').html(address);
      });
      $("#latlng_div").append("Latitude: <b>" + m.lat.toFixed(5) + "</b>&deg;<br />Longitude: <b>" + m.lng.toFixed(5) + "</b>&deg;<br /><br />" + "Address: " + "<div id='reverseAddress'></div>");
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
// Clear feature highlight when map is clicked
map.on("click", function(e) {
  highlight.clearLayers();
});

// ================================================================
// Single marker cluster layer to hold all clusters
// ================================================================
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 13
});
map.addLayer(markerClusters);
map.addLayer(highlight);


// ================================================================
// geojson layer - GBF
// ================================================================
var gbfLayer = L.geoJson(null);
var tintGreenMarker = L.AwesomeMarkers.icon({
   icon: 'tint',
   markerColor: 'green'
 });
var GBF = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: tintGreenMarker,
      title: feature.properties.Area,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    //console.log(feature.properties);
    if (feature.properties) {
      //convert numbers to meaningful description
      switch (isNaN(feature.properties.Flow) || parseInt(feature.properties.Flow)) {
        case true:
          flow = "Not measured";
          break;
        case 1:
          flow = "No flow";
          break;
        case 2:
          flow = "Low";
          break;
        case 3:
          flow = "Normal";
          break;
        case 4:
          flow = "Flood";
          break;
        case 5:
          flow = "High";
          break;
        case 6:
          flow = "Dry";
          break;
      }

      switch (isNaN(feature.properties.Algae) || parseInt(feature.properties.Algae)) {
        case true:
          algae = "Not measured";
          break;
        case 1:
          algae = "Absent";
          break;
        case 2:
          algae = "Rare (<25%)";
          break;
        case 3:
          algae = "Common (26-50%)";
          break;
        case 4:
          algae = "Abundant (50-75%)";
          break;
        case 5:
          algae = "Dominant (>75%)";
          break;
      }

      switch (isNaN(feature.properties.Color) || parseInt(feature.properties.Color)) {
          case true:
            wcolor = "Not measured";
            break;
          case 1:
            wcolor = "No color";
            break;
          case 2:
            wcolor = "Light green";
            break;
          case 3:
            wcolor = "Dark green";
            break;
          case 4:
            wcolor = "Tan";
            break;
          case 5:
            wcolor = "Red";
            break;
          case 6:
            wcolor = "Green/brown";
            break;
          case 7:
            wcolor = "Black";
            break;
        }

        switch (isNaN(feature.properties.Clarity) || parseInt(feature.properties.Clarity)) {
          case true:
            clarity = "Not measured";
            break;
          case 1:
            clarity = "Clear";
            break;
          case 2:
            clarity = "Cloudy";
            break;
          case 3:
            clarity = "Turbid";
            break;
        }

        switch (isNaN(feature.properties.Surface) || parseInt(feature.properties.Surface)) {
          case true:
            surface = "Not measured";
            break;
          case 1:
            surface = "Clear";
            break;
          case 2:
            surface = "Scum";
            break;
          case 3:
            surface = "Form";
            break;
          case 4:
            surface = "Debris";
            break;
          case 5:
            surface = "Sheen";
            break;
        }

        switch (isNaN(feature.properties.Conditions) || parseInt(feature.properties.Conditions)) {
          case true:
            conditions = "Not measured";
            break;
          case 1:
            conditions = "Calm";
            break;
          case 2:
            conditions = "Ripples";
            break;
          case 3:
            conditions = "Waves";
            break;
          case 4:
            conditions = "White caps";
            break;
        }

        switch (isNaN(feature.properties.Odor) || parseInt(feature.properties.Odor)) {
          case true:
            odor = "Not measured";
            break;
          case 1:
            odor = "None";
            break;
          case 2:
            odor = "Oil";
            break;
          case 3:
            odor = "Acrid (pungent)";
            break;
          case 4:
            odor = "Sewage";
            break;
          case 5:
            odor = "Rotten egg";
            break;
          case 6:
            odor = "Fishy";
            break;
          case 7:
            odor = "Musky";
            break;
        }

        switch (isNaN(feature.properties.Weather) || parseInt(feature.properties.Weather)) {
          case true:
            weather = "Not measured";
            break;
          case 1:
            weather = "Clear";
            break;
          case 2:
            weather = "Cloudy";
            break;
          case 3:
            weather = "Overcast";
            break;
          case 4:
            weather = "Rain";
            break;
        }

        switch (isNaN(feature.properties.Tide) || parseInt(feature.properties.Tide)) {
          case true:
            tide = "Not measured";
            break;
          case 1:
            tide = "Low";
            break;
          case 2:
            tide = "Falling";
            break;
          case 3:
            tide = "Slack";
            break;
          case 4:
            tide = "Rising";
            break;
          case 5:
            tide = "High";
            break;
        }

      //console.log(feature.properties.Date_Time);
      var sampleDateTime;
      if (moment(new Date(feature.properties.Date_Time).toISOString()).valueOf() > 0) {
        sampleDateTime = feature.properties.Date_Time;
      } else {
        sampleDateTime = "";
      }

      var content = "<b>" + moment(new Date(sampleDateTime).toISOString()).format("M/D/YYYY h:mm a") + "</b>&nbsp;&nbsp;Site ID: " + feature.properties.Site_ID +
      "&nbsp;&nbsp;&nbsp;</span><a href='#' onclick='createGBFChart(" + feature.properties.Site_ID + ");' class='siteSummary'>Site Summary</a>" + "<br />Group ID: " + feature.properties.Group_ID + "&nbsp;&nbsp;Monitor ID: " + feature.properties.Monitor_ID + "<br /><ul class='nav nav-tabs' role='tablist'><li role='presentation' class='active'><a href='#gbf_one' role='tab' data-toggle='tab'>Data</a></li><li role='presentation'><a href='#gbf_two' role='tab' data-toggle='tab'>Field Observations</a></li></ul>" + "<div class='tab-content'><div role='tabpanel' class='tab-pane active' id='gbf_one'>" + "<table class='table table-striped'>" +
      "<tr><td>Sample Depth (m)</td><td>" + feature.properties.Sample_Depth_m +"</td></tr>" +
      "<tr><td>Air Temperature (&deg;C)</td><td>" + feature.properties.Air_Temp_degC + "</td></tr>" +
      "<tr><td>Water Temperature (&deg;C)</td><td>" + feature.properties.Water_Temp_degC + "</td></tr>" +
      "<tr><td>Average Dissolved Oxygen (mg/L)</td><td>" + feature.properties.Avg_DO + "</td></tr>" +
      "<tr><td>pH</td><td>" + feature.properties.pH + "</td></tr>" +
      "<tr><td>Transparency (m)</td><td>" + feature.properties.Transparency_m + "</td></tr>" +
      "<tr><td>Total Depth (m)</td><td>" + feature.properties.Total_Depth_m + "</td></tr>" +
      "<tr><td>Specific Gravity</td><td>" + feature.properties.Specific_Gravity + "</td></tr>" +
      "<tr><td>SpGr Temp (&deg;C)</td><td>" + feature.properties.SpGr_Temp + "</td></tr>" +
      "<tr><td>Salinity (ppt)</td><td>" + feature.properties.Salinity + "</td></tr>" +
      "<tr><td>Enterococcus (CFU/100ml)</td><td>" + feature.properties.Enterococcus + "</td></tr>" +
      "</table></div>" +
      "<div role='tabpanel' class='tab-pane' id='gbf_two'>" +
      "<table class='table table-striped' id='gbf_wq2'>" +
      "<tr><td>Since last precip (days)</td><td>" + feature.properties.Days_Since_Precip + "</td></tr>" +
      "<tr><td>Rainfall accumulation (inches)</td><td>" + feature.properties.Rain_Accum + "</td></tr>" +
      "<tr><td>Flow</td><td>" + flow + "</td></tr>" +
      "<tr><td>Algae</td><td>" + algae + "</td></tr>" +
      "<tr><td>Color</td><td>" + wcolor + "</td></tr>" +
      "<tr><td>Clarity</td><td>" + clarity + "</td></tr>" +
      "<tr><td>Surface</td><td>" + surface + "</td></tr>" +
      "<tr><td>Conditions</td><td>" + conditions + "</td></tr>" +
      "<tr><td>Odor</td><td>" + odor + "</td></tr>" +
      "<tr><td>Weather</td><td>" + weather + "</td></tr>" +
      "<tr><td>Tide</td><td>" + tide + "</td></tr>" +
      "</table></div></div>";

      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Site_Description);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });

      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="18" height="18" src="static/images/map_green.png"></td><td class="feature-name">' + layer.feature.properties.Name + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

      gbfSearch.push({
        name: feature.properties.Name,
        monitorid: feature.properties.Monitor_ID,
        sitedesc: feature.properties.Site_Description,
        date: moment(new Date(sampleDateTime).toISOString()).format("YYYY-MM-DD h:mm a"),
        source: "GBF",
        id: L.stamp(feature),
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      });
      //if (feature.properties.Site_ID === 999999 || feature.properties.Site_ID === "999999") {
        gbfChart.push({
          datetime: moment(new Date(sampleDateTime).toISOString()).valueOf(),
          siteid: parseInt(feature.properties.Site_ID),
          airtemp: parseFloat(feature.properties.Air_Temp_degC),
          wtemp: parseFloat(feature.properties.Water_Temp_degC),
          avgdo: parseFloat(feature.properties.Avg_DO),
          avgph: parseFloat(feature.properties.pH),
          salinity: parseFloat(feature.properties.Salinity),
          enteroc: parseFloat(feature.properties.Enterococcus),
          sitedesc: feature.properties.Site_Description,
          source: "GBF"
        });
      //}
    }
  }
});
// ================================================================
// GBF Summary Chart function
// ================================================================
function createGBFChart(siteid) {
  console.log("Site ID:", siteid);

  gbfChart.sort();

  var arrayAirTemp = [],
  arrayWTemp = [],
  arrayAvgDO = [],
  arrayPH = [],
  arraySalinity = [],
  arrayEnteroC = [],
  filtered = "";

  // Chart Title
  $("#siteinfo-title").html("Site ID: <b>" + siteid + "</b>");

  var filtered = $(gbfChart).filter(function (i,n){return n.siteid===siteid;});
  var pageTitle = "Site: " + filtered[0].sitedesc;
  //console.log(filtered);
  filtered.sort(function (a, b) {
      // convert to integers from strings
      a = a.datetime;
      b = b.datetime;
      // compare
      if(a > b) {
          return 1;
      } else if(a < b) {
          return -1;
      } else {
          return 0;
      }
  });

  for (var i=0;i<filtered.length;i++)
  {
    // For datetime axes, the X value is the timestamp in milliseconds since 1970.
    var local_date = filtered[i].datetime;
    isNaN(filtered[i].airtemp) ? { } : arrayAirTemp.push([local_date, filtered[i].airtemp]);
    isNaN(filtered[i].wtemp) ? { } : arrayWTemp.push([local_date, filtered[i].wtemp]);
    isNaN(filtered[i].avgdo) ? { } : arrayAvgDO.push([local_date, filtered[i].avgdo]);
    isNaN(filtered[i].avgph) ? { } : arrayPH.push([local_date, filtered[i].avgph]);
    isNaN(filtered[i].salinity) ? { } : arraySalinity.push([local_date, filtered[i].salinity]);
    isNaN(filtered[i].enteroc) ? { } : arrayEnteroC.push([local_date, filtered[i].enteroc]);
  }

  // Highcharts
  var mheight, mwidth;
  if (document.body.clientWidth <= 767) {
    mheight = 480;
  } else {
    //mheight = 720;
    mheight = 620;
  }
  $('#data_Charts').highcharts('StockChart', {
    chart: {
      height: mheight
    },
    colors: ['#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80'],
    title: {
      text: pageTitle
    },
    exporting: {
      chartOptions: {
        title: {
          text: pageTitle,
          style: {
            color: '#000000',
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        day: '%e. %b',
        month: '%b %Y',
        year: '%Y'
      }
    },
    yAxis: [{
      labels: {
        format: '{value}°C',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      title: {
        text: 'Air Temp.',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      height: '20%'
    }, {
      labels: {
        format: '{value}°C',
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      title: {
        text: 'Water Temp.',
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      height: '20%'
    }, {
      labels: {
        format: '{value} mg/L',
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      },
      title: {
        text: 'Dissolved Oxygen',
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      },
      top: '20%',
      height: '20%',
      offset: 0
    }, {
      labels: {
        format: '{value}',
        style: {
          color: Highcharts.getOptions().colors[4]
        }
      },
      title: {
        text: 'pH',
        style: {
          color: Highcharts.getOptions().colors[4]
        }
      },
      top: '40%',
      height: '20%',
      max: 11,
      min: 5,
      offset: 0
    }, {
      labels: {
        format: '{value} ppt',
        style: {
          color: Highcharts.getOptions().colors[5]
        }
      },
      title: {
        text: 'Salinity',
        style: {
          color: Highcharts.getOptions().colors[5]
        }
      },
      top: '60%',
      height: '20%',
      min: 0,
      offset: 0
    }, {
      labels: {
        format: '{value} CFU/100ml'
      },
      title: {
        text: 'Enterococcus'
      },
      top: '80%',
      height: '20%',
      min: 0,
      offset: 0
    }],
    tooltip: {
      shared: true
    },

    series: [{
      name: 'Air Temperature',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayAirTemp,
      tooltip: {
        valueSuffix: '°C'
      }
    }, {
      name: 'Water Temperature',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayWTemp,
      tooltip: {
        valueSuffix: '°C'
      }
    }, {
      name: 'Dissolved Oxygen',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayAvgDO,
      tooltip: {
        valueSuffix: 'mg/L'
      },
      yAxis: 2
    }, {
      name: 'pH',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayPH,
      tooltip: {
        valueSuffix: ''
      },
      yAxis: 3
    }, {
      name: 'Salinity',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arraySalinity,
      tooltip: {
        valueSuffix: 'ppt'
      },
      yAxis: 4
    }, {
      name: 'Enterococcus',
      type: 'column',
      data: arrayEnteroC,
      tooltip: {
        valueSuffix: ' CFU/100ml'
      },
      yAxis: 5
    }]
  }); // end of highcharts


  $('#siteInfoModal').modal('show');
  $('#siteInfoModal').on('show.bs.modal', function() {
      $('#data_Charts').css('visibility', 'hidden');
  });
  $('#siteInfoModal').on('shown.bs.modal', function() {
      $('#data_Charts').css('visibility', 'initial');
      chart = $("#data_Charts").highcharts().reflow(); // this will not work with bar chart
  });
}


// ================================================================
// geoJson layer - Nature's Academy
// ================================================================
var nacdLayer = L.geoJson(null);
var tintPinkMarker = L.AwesomeMarkers.icon({
   icon: 'tint',
   markerColor: 'pink'
 });
var NACD = L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {
      icon: tintPinkMarker,
      title: feature.properties.Site,
      riseOnHover: true
    });
  },
  onEachFeature: function (feature, layer) {
    //console.log(feature.properties);
    if (feature.properties) {
      var sampleDateTime;
      if (moment(new Date(feature.properties.Date_Time).toISOString()).valueOf() > 0) {
        sampleDateTime = feature.properties.Date_Time;
      } else {
        sampleDateTime = "";
      }

      var content = "<b>" + moment(new Date(sampleDateTime).toISOString()).format("M/D/YYYY h:mm a") + "</b>&nbsp;&nbsp;Monitor ID: " + feature.properties.Monitor_ID + " (Participants:" + feature.properties.Participants + ")" +
      "<a href='#' onclick='createNACDChart(" + feature.properties.Site_ID + ");' class='siteSummary'> Site Summary</a>" +
      "<ul class='nav nav-tabs' role='tablist'>" +
      "<li role='presentation' class='active'><a href='#nacd_one' role='tab' data-toggle='tab'>Common Data</a></li>" +
      "<li role='presentation'><a href='#nacd_two' role='tab' data-toggle='tab'>Weather</a></li>" +
      "<li role='presentation'><a href='#nacd_three' role='tab' data-toggle='tab'>Others</a></li>" +
      "</ul>" +
      "<div class='tab-content'>" +
      "<div role='tabpanel' class='tab-pane active' id='nacd_one'>" +
      "<table class='table table-striped'>" +
      "<tr><td>Air Temperature (&deg;C)</td><td>" + feature.properties.AirTemp_C + "</td></tr>" +
      "<tr><td>Water Temperature (&deg;C)</td><td>" + feature.properties.WaterTemp_C + "</td></tr>" +
      "<tr><td>Dissolved Oxygen (ppm)</td><td>" + feature.properties.DissolvedOxygen_ppm + "</td></tr>" +
      "<tr><td>pH</td><td>" + feature.properties.pH + "</td></tr>" +
      "<tr><td>Salinity (ppt)</td><td>" + feature.properties.Salinity_ppt + "</td></tr>" +
      "</table></div>" +
      "<div role='tabpanel' class='tab-pane' id='nacd_two'>" +
      "<table class='table table-striped'>" +
      "<tr><td>Weather</td><td>" + feature.properties.Weather +"</td></tr>" +
      "<tr><td>Land Use</td><td>" + feature.properties.Land_Use + "</td></tr>" +
      "<tr><td>Wind Speed (mph)</td><td>" + feature.properties.Wind_Speed_mph + "</td></tr>" +
      "<tr><td>Wind Direction</td><td>" + feature.properties.Wind_Direction + "</td></tr>" +
      "</table></div>" +
      "<div role='tabpanel' class='tab-pane' id='nacd_three'>" +
      "<table class='table table-striped'>" +
      "<tr><td>Turbidity (NTU)</td><td>" + feature.properties.Turbidity_NTU + "</td></tr>" +
      "<tr><td>Nitrate (ppm)</td><td>" + feature.properties.Nitrates_ppm + "</td></tr>" +
      "<tr><td>Litter(kg)</td><td>" + feature.properties.Litter_kg + "</td></tr>" +
      "<tr><td>Most Abundant Litter</td><td>" + feature.properties.Most_Abundant_Litter + "</td></tr>" +
      "<tr><td>Species</td><td>" + feature.properties.Species_Found + "</td></tr>" +
      "<tr><td>Most abundant species</td><td>" + feature.properties.Most_Abundant_Species + "</td></tr>" +
      "</table></div>" +
      "</div>";

      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.Site);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
          highlight.clearLayers().addLayer(L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], highlightStyle));
        }
      });

      $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="18" height="18" src="static/images/map_pink.png"></td><td class="feature-name">' + layer.feature.properties.Site + '</td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');

      //console.log(sampleDateTime);
      nacdSearch.push({
        site: feature.properties.Site,
        monitorid: feature.properties.Monitor_ID,
        date: moment(new Date(sampleDateTime).toISOString()).format("YYYY-MM-DD h:mm a"),
        source: "NACD",
        id: L.stamp(feature),
        lat: feature.geometry.coordinates[1],
        lng: feature.geometry.coordinates[0]
      });
      nacdChart.push({
        datetime: moment(new Date(sampleDateTime).toISOString()).valueOf(),
        siteid: parseInt(feature.properties.Site_ID),
        airtemp: parseFloat(feature.properties.AirTemp_C),
        wtemp: parseFloat(feature.properties.WaterTemp_C),
        avgdo: parseFloat(feature.properties.DissolvedOxygen_ppm),
        avgph: parseFloat(feature.properties.pH),
        salinity: parseFloat(feature.properties.Salinity_ppt),
        nitrates: parseFloat(feature.properties.Nitrates_ppm),
        sample_no: parseInt(feature.properties.No),
        sitedesc: feature.properties.Site,
        source: "NACD"
      });
    }
  }
});
// ================================================================
// NACD Summary Chart function
// ================================================================
function createNACDChart(siteid) {
  console.log("Site ID:", siteid);

  var arrayAirTemp = [],
  arrayWTemp = [],
  arrayAvgDO = [],
  arrayPH = [],
  arraySalinity = [],
  arrayNitrates = [];

  // Chart Title
  $("#siteinfo-title").html("Site ID: <b>" + siteid + "</b>");

  var filtered = $(nacdChart).filter(function (i,n){return n.siteid===siteid;});
  var pageTitle = "Site: " + filtered[0].sitedesc;
  //console.log(filtered);
  // sort based on timestamp attribute
  filtered.sort(function (a, b) {
      // convert to integers from strings
      a = a.datetime;
      b = b.datetime;
      // compare
      if(a > b) {
          return 1;
      } else if(a < b) {
          return -1;
      } else {
          return 0;
      }
  });

  for (var i=0;i<filtered.length;i++) {
    // For datetime axes, the X value is the timestamp in milliseconds since 1970.
    var local_date = filtered[i].datetime;
    //console.log(local_date);
    isNaN(filtered[i].airtemp) ? { } : arrayAirTemp.push([local_date, filtered[i].airtemp]);
    isNaN(filtered[i].wtemp) ? { } : arrayWTemp.push([local_date, filtered[i].wtemp]);
    isNaN(filtered[i].avgdo) ? { } : arrayAvgDO.push([local_date, filtered[i].avgdo]);
    isNaN(filtered[i].avgph) ? { } : arrayPH.push([local_date, filtered[i].avgph]);
    isNaN(filtered[i].salinity) ? { } : arraySalinity.push([local_date, filtered[i].salinity]);
    isNaN(filtered[i].nitrates) ? { } : arrayNitrates.push([local_date, filtered[i].nitrates]);
  }

  // Highcharts
  var mheight, mwidth;
  if (document.body.clientWidth <= 767) {
    mheight = 480;
  } else {
    //mheight = 720;
    mheight = 620;
  }
  $('#data_Charts').highcharts('StockChart', {
    chart: {
      height: mheight
    },
    colors: ['#7cb5ec', '#90ed7d', '#f7a35c', '#8085e9', '#f15c80'],
    title: {
      text: pageTitle
    },
    exporting: {
      chartOptions: {
        title: {
          text: pageTitle,
          style: {
            color: '#000000',
            fontWeight: 'bold',
            fontSize: '14px'
          }
        }
      }
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
        day: '%e. %b',
        month: '%b %Y',
        year: '%Y'
      }
    },
    yAxis: [{
      labels: {
        format: '{value}°C',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      title: {
        text: 'Air Temp.',
        style: {
          color: Highcharts.getOptions().colors[0]
        }
      },
      height: '20%'
    }, {
      labels: {
        format: '{value}°C',
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      title: {
        text: 'Water Temp.',
        style: {
          color: Highcharts.getOptions().colors[2]
        }
      },
      height: '20%'
    }, {
      labels: {
        format: '{value} mg/L',
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      },
      title: {
        text: 'Dissolved Oxygen',
        style: {
          color: Highcharts.getOptions().colors[3]
        }
      },
      top: '20%',
      height: '20%',
      offset: 0
    }, {
      labels: {
        format: '{value}',
        style: {
          color: Highcharts.getOptions().colors[4]
        }
      },
      title: {
        text: 'pH',
        style: {
          color: Highcharts.getOptions().colors[4]
        }
      },
      top: '40%',
      height: '20%',
      max: 11,
      min: 5,
      offset: 0
    }, {
      labels: {
        format: '{value} ppt',
        style: {
          color: Highcharts.getOptions().colors[5]
        }
      },
      title: {
        text: 'Salinity',
        style: {
          color: Highcharts.getOptions().colors[5]
        }
      },
      top: '60%',
      height: '20%',
      min: 0,
      offset: 0
    }, {
      labels: {
        format: '{value} ppm'
      },
      title: {
        text: 'Nitrates'
      },
      top: '80%',
      height: '20%',
      min: 0,
      offset: 0
    }],
    tooltip: {
      shared: true
    },
    series: [{
      name: 'Air Temperature',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayAirTemp,
      tooltip: {
        valueSuffix: '°C'
      }
    }, {
      name: 'Water Temperature',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayWTemp,
      tooltip: {
        valueSuffix: '°C'
      }
    }, {
      name: 'Dissolved Oxygen',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayAvgDO,
      tooltip: {
        valueSuffix: ' mg/L'
      },
      yAxis: 2
    }, {
      name: 'pH',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arrayPH,
      tooltip: {
        valueSuffix: ''
      },
      yAxis: 3
    }, {
      name: 'Salinity',
      //type: 'spline',
      lineWidth : 0,
      marker : {
          enabled : true,
          radius : 2
      },
      data: arraySalinity,
      tooltip: {
        valueSuffix: ' ppt'
      },
      yAxis: 4
    }, {
      name: 'Nitrates',
      type: 'column',
      data: arrayNitrates,
      tooltip: {
        valueSuffix: ' ppm'
      },
      yAxis: 5
    }]
  }); // end of highcharts


  $('#siteInfoModal').modal('show');
  $('#siteInfoModal').on('show.bs.modal', function() {
      $('#data_Charts').css('visibility', 'hidden');
  });
  $('#siteInfoModal').on('shown.bs.modal', function() {
      $('#data_Charts').css('visibility', 'initial');
      chart = $("#data_Charts").highcharts().reflow(); // this will not work with bar chart
  });
}



// ====================================================
// Main loader
// ====================================================
d3.queue()
  //.defer(d3.json, 'static/data/GBF_20150723.geojson')
  .defer(d3.json, 'gbf_db/data')
  .defer(d3.json, 'nacd_db/data')
  .await(function (error, gbfData, nacdData) {
      //console.log(gbfData);
      //console.log(nacdData);

      GBF.addData(gbfData);
      NACD.addData(nacdData);
      //FLAQ.addData(flaqData);

      map.addLayer(gbfLayer);
      map.addLayer(nacdLayer);
      //map.addLayer(flaqLayer);

      sizeLayerControl();

      /* Fit map to boroughs bounds */
      featureList = new List("features", {valueNames: ["feature-sitedesc","feature-siteid","feature-date"]});
      featureList.sort("feature-date", {order:"desc"});

      // Search Form
      //------------------------------
      var gbfBH = new Bloodhound({
        name: "GBF",
        datumTokenizer: function (d) {
          return Bloodhound.tokenizers.whitespace(d.sitedesc);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: gbfSearch,
        limit: 10
      });
      gbfBH.initialize();

      var nacdBH = new Bloodhound({
        name: "NACD",
        datumTokenizer: function (d) {
          return Bloodhound.tokenizers.whitespace(d.site);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: nacdSearch,
        limit: 10
      });
      nacdBH.initialize();
      /*
      var flaqBH = new Bloodhound({
        name: "FLAQ",
        datumTokenizer: function (d) {
          return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: flaqSearch,
        limit: 10
      });
      flaqBH.initialize();
      */
      /* instantiate the typeahead UI */
      $("#searchbox").typeahead({
        minLength: 1,
        highlight: true,
        hint: false
      }, {
        name: "GBF",
        displayKey: "site",
        source: gbfBH.ttAdapter(),
        templates: {
          header: "<h4 class='typeahead-header'><img src='static/images/map_green.png' width='22' height='22'>&nbsp;Galveston B. F.</h4>",
          suggestion: Handlebars.compile(["{{sitedesc}}<br>&nbsp;<small>{{date}}</small>"].join(""))
        }
      }, {
        name: "NACD",
        displayKey: "site",
        source: nacdBH.ttAdapter(),
        templates: {
          header: "<h4 class='typeahead-header'><img src='static/images/map_pink.png' width='22' height='22'>&nbsp;Nature's A.</h4>",
          suggestion: Handlebars.compile(["{{site}}<br>&nbsp;<small>{{date}}</small>"].join(""))
        }
/*        {
          name: "FLAQ",
          displayKey: "name",
          source: flaqBH.ttAdapter(),
          templates: {
            header: "<h4 class='typeahead-header'><img src='static/images/mapicon01.png' width='22' height='22'>&nbsp;GBF</h4>",
            suggestion: Handlebars.compile(["{{name}}<br>&nbsp;<small>{{sitedesc}}&nbsp;{{date}}</small>"].join(""))
        } */
      }).on("typeahead:selected", function (obj, datum) {
        if (datum.source === "GBF") {
          if (!map.hasLayer(gbfLayer)) {
            map.addLayer(gbfLayer);
          }
          map.setView([datum.lat, datum.lng], 17);
          if (map._layers[datum.id]) {
            map._layers[datum.id].fire("click");
          }
        }
        if (datum.source === "NACD") {
          if (!map.hasLayer(nacdLayer)) {
            map.addLayer(nacdLayer);
          }
          map.setView([datum.lat, datum.lng], 17);
          if (map._layers[datum.id]) {
            map._layers[datum.id].fire("click");
          }
        }
        if (datum.source === "FLAQ") {
          if (!map.hasLayer(flaqLayer)) {
            map.addLayer(flaqLayer);
          }
          map.setView([datum.lat, datum.lng], 17);
          if (map._layers[datum.id]) {
            map._layers[datum.id].fire("click");
          }
        }
        if ($(".navbar-collapse").height() > 50) {
          $(".navbar-collapse").collapse("hide");
        }
      }).on("typeahead:opened", function () {
        $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
        $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
      }).on("typeahead:closed", function () {
        $(".navbar-collapse.in").css("max-height", "");
        $(".navbar-collapse.in").css("height", "");
      });
      $(".twitter-typeahead").css("position", "static");
      $(".twitter-typeahead").css("display", "block");

  finishedLoading();
});

// ================================================================
/* grouping ancillayr data layers */
// ================================================================
var groupedOverlays = {
    "River stream": riverstreamLyr,
    "Platform": platformLyr,
    "Pipeline": pipelineLyr,
    "Nautical Chart": nauticalChart,
    "<img src='static/images/map_green.png' width='28' height='28'>&nbsp;GBF Observations": gbfLayer,
    "<img src='static/images/map_pink.png' width='28' height='28'>&nbsp;NACD Observations": nacdLayer
};

// ================================================================
// List in Side Panel
// ================================================================
function syncSidebar() {
  /* Empty sidebar features */
  $("#feature-list tbody").empty();
  // Loop through gbf layer and add only features which are in the map bounds
  GBF.eachLayer(function (layer) {
    if (map.hasLayer(gbfLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="18" height="18" src="static/images/map_green.png"></td><td><span class="feature-sitedesc"><small>' + layer.feature.properties.Site_Description + '</small></span><br /><small><span class="feature-date">' + moment(layer.feature.properties.Date_Time, 'MM/DD/YYYY h:mm:ss').format('M/D/YYYY h:mm a') + '</small></span></td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  NACD.eachLayer(function (layer) {
    if (map.hasLayer(nacdLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="18" height="18" src="static/images/map_pink.png"></td><td><span class="feature-sitedesc"><small>' + layer.feature.properties.Site + '</small></span><br /><small><span class="feature-date">' + moment(new Date(layer.feature.properties.Date_Time).toISOString()).format("M/D/YYYY h:mm a") + '</small></span></td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  /* Update list.js featureList */
  featureList = new List("features", {
    valueNames: ["feature-sitedesc","feature-date"]
  });
  featureList.sort("feature-date", {
    order: "desc"
  });
}

function sidebarClick(id) {
  var layer = markerClusters.getLayer(id);
  map.setView([layer.getLatLng().lat, layer.getLatLng().lng], 17);
  layer.fire("click");
  /* Hide sidebar and go to the map on small screens */
  if (document.body.clientWidth <= 767) {
    $("#sidebar").hide();
    map.invalidateSize();
  }
}
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
map.on("overlayadd", function(e) {
  if (e.layer === gbfLayer) {
    markerClusters.addLayer(GBF);
    syncSidebar();
  }
  if (e.layer === nacdLayer) {
    markerClusters.addLayer(NACD);
    syncSidebar();
  }
/*  if (e.layer === flaqLayer) {
    markerClusters.addLayer(FLAQ);
    syncSidebar();
  }
*/
});
map.on("overlayremove", function(e) {
  if (e.layer === gbfLayer) {
    markerClusters.removeLayer(GBF);
    syncSidebar();
  }
  if (e.layer === nacdLayer) {
    markerClusters.removeLayer(NACD);
    syncSidebar();
  }
  /*
  if (e.layer === flaqLayer) {
    markerClusters.removeLayer(FLAQ);
    syncSidebar();
  }
  */
});
map.on("moveend", function (e) {
  syncSidebar();
});


// ================================================================
/* Larger screens get expanded layer control and visible sidebar */
// ================================================================
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
};
L.control.layers(baseLayers, groupedOverlays).addTo(map);

// ================================================================
// Leaflet patch to make layer control scrollable on touch browsers
// ================================================================
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}

// ================================================================
/* Navigator and Side bar */
// ================================================================
$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});
$("#sidebar-toggle-btn").click(function() {
  $("#sidebar").toggle();
  map.invalidateSize();
  return false;
});
$("#sidebar-hide-btn").click(function() {
  $('#sidebar').hide();
  map.invalidateSize();
});
$("#panel-btn").click(function() {
  $('#sidebar').toggle();
  map.invalidateSize();
  return false;
});

// ================================================================
// Map Tools Settings
// ================================================================
/* Print */
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
/* Map Tools - all top left tools */
$("#tools-btn").click(function() {
  $('.leaflet-top.leaflet-left').toggle();
  return false;
});
/* Draw Tools */
$("#draw-btn").click(function() {
  $('.leaflet-draw').toggle();
  return false;
});
/* Distance measurement (require Leaflet.Draw) */
$("#distance-btn").click(function() {
  $('.leaflet-control-draw-measure').toggle();
  return false;
});
/* Upload tool */
$("#upload-btn").click(function() {
  $('.leaflet-control-filelayer').toggle();
  return false;
});
// Lat Long
var mousemove = document.getElementById('mousemove');
map.on('mousemove', function(e){
  //console.log('checking');
  window[e.type].innerHTML = e.latlng.toString();
});

// ================================================================
// Typeahead Search box
// ================================================================
$("#searchbox").click(function () {
  $(this).select();
});
/* Prevent hitting enter from refreshing the page */
$("#searchbox").keypress(function (e) {
  if (e.which == 13) {
    e.preventDefault();
  }
});

// ================================================================
// Modal - Feature
// ================================================================
$("#featureModal").on("hidden.bs.modal", function (e) {
  $(document).on("mouseout", ".feature-row", clearHighlight);
});
