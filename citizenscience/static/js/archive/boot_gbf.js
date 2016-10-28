var gbfSearch = [], gbfChart = [], gbfLayer, GBF;

// ================================================================
// geojson layer - GBF
// ================================================================
gbfLayer = L.geoJson(null);

var tintGreenMarker = L.AwesomeMarkers.icon({
   icon: 'tint',
   markerColor: 'green'
 });
 
GBF = L.geoJson(null, {
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
      //console.log(gbfSearch);
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
