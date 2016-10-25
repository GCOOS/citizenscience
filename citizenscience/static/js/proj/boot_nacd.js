var nacdSearch = [], nacdChart = [];

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
