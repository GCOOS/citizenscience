//--------------------------------------------------
// Initialize our dc.js charts, passing the DOM Id in which we want the chart rendered as an argument
//--------------------------------------------------
var siteIDChart = dc.rowChart("#siteID-chart"),
    monitorIDChart = dc.rowChart("#monitorID-chart"),
    dayEnteredChart = dc.rowChart("#day-entered-chart"),
    timelineChart = dc.barChart("#timeline-chart");

// popup window content variables
var content, flow, algae, wcolor, clarity, surface, conditions, odor, weather, tide;

// A common color for all of the bar and row charts
var commonChartBarColor = '#a1d99b';

// This is where we will hold our crossfilter data
var xdata = null,
    all = null,
    locations = null,
    siteDescDim = null,
    monitorNumDim = null;

queue()
  .defer(d3.json, 'static/data/GBF_20150723.geojson')
//  .defer(d3.json, 'gbf_db/data')
  .await(function (error, data) {
    console.log("loading search list");
    //console.log(data);

    var dateFormat = d3.time.format("%m/%d/%Y %H:%M:%S");

      data.features.forEach( function(d,i) {
        //console.log(d);
          d.date_e = dateFormat.parse(d.properties.Date_Time);
          d.date_f = moment(d.date_e).format("M/D/YYYY h:mm a");
          d.lat = d.geometry.coordinates[1];
          d.lng = d.geometry.coordinates[0];
          d.siteid = d.properties.Site_ID;
          d.area = d.properties.Area,
          d.siteDesc = d.properties.Site_Description;
          d.groupid = d.properties.Group_ID;
          d.monitorid = d.properties.Monitor_ID;
          d.name = d.properties.Name;
          d.airtemp = +d.properties.Air_Temp_degC;
          d.wtemp = +d.properties.Water_Temp_degC;
          d.avgdo = +d.properties.Avg_DO;
          //d.do1 = +d.properties.DO_Tiration1;
          //d.do2 = +d.properties.DO_Tiration2;
          d.ph = +d.properties.pH;
          d.trans = +d.properties.Transparency;
          d.sampledepth = +d.properties.Sample_Depth_m;
          d.totaldepth = +d.properties.Total_Depth_m;
          d.sgravity = +d.properties.Specific_Gravity;
          d.spgrtemp = +d.properties.SpGr_Temp;
          d.salinity = +d.properties.Salinity;
          d.flow = d.properties.Flow;
          d.algae = d.properties.Algae;
          d.color = d.properties.Color;
          d.clarity = d.properties.Clarity;
          d.surface = d.properties.Surface;
          d.conditions = d.properties.Conditions;
          d.odor = d.properties.Odor;
          d.weather = d.properties.Weather;
          d.lastprecip = d.properties.Days_Since_Precip;
          d.rain3d = d.properties.Rainfall_Accum;
          d.enterococcus = d.properties.Enterococcus;
          d.tide = d.properties.Tide;
          d.comments = d.properties.Comments;

          // create a map marker if the lat lng is present
          if (d.properties.Latitude!==null && d.properties.Latitude!=='undefined') {
            d.ll = L.latLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);

            //convert numbers to meaningful description
            switch (d.flow) {
              case "1":
                flow = "No flow";
                break;
              case "2":
                flow = "Low";
                break;
              case "3":
                flow = "Normal";
                break;
              case "4":
                flow = "Flood";
                break;
              case "5":
                flow = "High";
                break;
              case "6":
                flow = "Dry";
                break;
            }

            switch (d.algae) {
              case "1":
                algae = "Absent";
                break;
              case "2":
                algae = "Rare (<25%)";
                break;
              case "3":
                algae = "Common (26-50%)";
                break;
              case "4":
                algae = "Abundant (50-75%)";
                break;
              case "5":
                algae = "Dominant (>75%)";
                break;
            }

            switch (d.color) {
              case "1":
                wcolor = "No color";
                break;
              case "2":
                wcolor = "Light green";
                break;
              case "3":
                wcolor = "Dark green";
                break;
              case "4":
                wcolor = "Tan";
                break;
              case "5":
                wcolor = "Red";
                break;
              case "6":
                wcolor = "Green/brown";
                break;
              case "7":
                wcolor = "Black";
                break;
            }

            switch (d.clarity) {
              case "1":
                clarity = "Clear";
                break;
              case "2":
                clarity = "Cloudy";
                break;
              case "3":
                clarity = "Turbid";
                break;
            }

            switch (d.surface) {
              case "1":
                surface = "Clear";
                break;
              case "2":
                surface = "Scum";
                break;
              case "3":
                surface = "Form";
                break;
              case "4":
                surface = "Debris";
                break;
              case "5":
                surface = "Sheen";
                break;
            }

            switch (d.conditions) {
              case "1":
                conditions = "Calm";
                break;
              case "2":
                conditions = "Ripples";
                break;
              case "3":
                conditions = "Waves";
                break;
              case "4":
                conditions = "White caps";
                break;
            }

            switch (d.odor) {
              case "1":
                odor = "None";
                break;
              case "2":
                odor = "Oil";
                break;
              case "3":
                odor = "Acrid (pungent)";
                break;
              case "4":
                odor = "Sewage";
                break;
              case "5":
                odor = "Rotten egg";
                break;
              case "6":
                odor = "Fishy";
                break;
              case "7":
                odor = "Musky";
                break;
            }

            switch (d.weather) {
              case "1":
                weather = "Clear";
                break;
              case "2":
                weather = "Cloudy";
                break;
              case "3":
                weather = "Overcast";
                break;
              case "4":
                weather = "Rain";
                break;
            }

            switch (d.tide) {
              case "1":
                tide = "Low";
                break;
              case "2":
                tide = "falling";
                break;
              case "3":
                tide = "Slack";
                break;
              case "4":
                tide = "Rising";
                break;
              case "5":
                tide = "High";
                break;
            }

            content = "<b>" + d.properties.Date_Time + "</b>&nbsp;&nbsp;Monitor ID: " + d.properties.Monitor_ID + ", " + d.properties.Name + "<br />" + "TST Site ID: " + d.properties.Site_ID + "&nbsp;&nbsp; Site: " + d.properties.Site_Description + "<br />" +
            "<ul class='nav nav-tabs' role='tablist'>" +
            "<li role='presentation' class='active'><a href='#gbf_one' role='tab' data-toggle='tab'>Common Data</a></li>" +
            "<li role='presentation'><a href='#gbf_two' role='tab' data-toggle='tab'>Data</a></li>" +
            "<li role='presentation'><a href='#gbf_three' role='tab' data-toggle='tab'>Water</a></li>" +
            "<li role='presentation'><a href='#gbf_four' role='tab' data-toggle='tab'>Weather</a></li>" +
            "</ul>" +
            "<div class='tab-content'>" +
            "<div role='tabpanel' class='tab-pane active' id='gbf_one'>" +
            "<table class='table table-striped'>" +
            "<tr><td>Air Temperature (&deg;C)</td><td>" + d.properties.Air_Temp_degC + "</td></tr>" +
            "<tr><td>Water Temperature (&deg;C)</td><td>" + d.properties.Water_Temp_degC + "</td></tr>" +
            "<tr><td>Average Dissolved Oxygen (mg/L)</td><td>" + d.properties.Avg_DO + "</td></tr>" +
            "<tr><td>pH</td><td>" + d.properties.pH + "</td></tr>" +
            "<tr><td>Salinity (ppt)</td><td>" + d.properties.Salinity + "</td></tr>" +
            "</table></div>" +
            "<div role='tabpanel' class='tab-pane' id='gbf_two'>" +
            "<table class='table table-striped'>" +
            "<tr><td>Sample Depth (m)</td><td>" + d.properties.Sample_Depth_m +"</td></tr>" +
            "<tr><td>Transparency (m)</td><td>" + d.properties.Transparency + "</td></tr>" +
            "<tr><td>Total Depth (m)</td><td>" + d.properties.Total_Depth_m + "</td></tr>" +
            "<tr><td>Specific Gravity</td><td>" + d.properties.Specific_Gravity + "</td></tr>" +
            "<tr><td>SpGr Temp (&deg;C)</td><td>" + d.properties.SpGr_Temp + "</td></tr>" +
            "</table></div>" +
            "<div role='tabpanel' class='tab-pane' id='gbf_three'>" +
            "<table class='table table-striped'>" +
            "Enterococcus (CFU/100ml): " + d.properties.Enterococcus +
            "<tr><td>Flow</td><td>" + flow + "</td></tr>" +
            "<tr><td>Algae</td><td>" + algae + "</td></tr>" +
            "<tr><td>Color</td><td>" + wcolor + "</td></tr>" +
            "<tr><td>Clarity</td><td>" + clarity + "</td></tr>" +
            "<tr><td>Surface</td><td>" + surface + "</td></tr>" +
            "<tr><td>Conditions</td><td>" + conditions + "</td></tr>" +
            "<tr><td>Odor</td><td>" + odor + "</td></tr>" +
            "</table></div>" +
            "<div role='tabpanel' class='tab-pane' id='gbf_four'>Days since last precip: " + d.properties.Days_Since_Precip + "<br />Rainfall Accumulation last 3 days (inches): " + d.properties.Rainfall_Accum + "<br />" +
            "<table class='table table-striped' id='gbf_wq2'>" +
            "<tr><td>Weather</td><td>" + weather + "</td></tr>" +
            "<tr><td>Tide</td><td>" + tide + "</td></tr>" +
            "</table></div>" +
            "</div>";

            var mark = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]]).bindPopup(content,{minWidth:350});
            markersLayer.addLayer(mark);
            clusterLayer.addLayer(mark);
          }

      });


    // Construct the data dimension
    //--------------------------------------------------
    xdata = crossfilter(data.features);

    // selects all records into a single group, reduceCount creates a count of the records.
    all = xdata.groupAll().reduceCount().value();
    //console.log("There are " + all + " here");
    $("#total").html(all);
    $("#active").html(all); //initial number

    // a dimension is to group or filter by.
    locations = xdata.dimension(function (d) { return d.properties.ll; });
    //siteDescDim = xdata.dimension(function (d) { return d.properties.Site_Description; });
    siteDescDim = xdata.dimension(function (d) { return d.properties.Area; });
    var siteDescCount = siteDescDim.group().reduceCount(function(d){ return d.siteDesc; });

    monitorNumDim = xdata.dimension(function (d) { return d.monitorid; });
    var monitorIdCount = monitorNumDim.group().reduceCount(function(d){ return d.monitorid; });

    var dayOfWeekNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    var dayOfWeekEnteredDim = xdata.dimension(function (d) {
      //console.log(d.OBJECTID, d.date_e);
      return d.date_e.getDay() + "." + dayOfWeekNames [ d.date_e.getDay() ];
    });
    var enteredMonthsDim = xdata.dimension(function (d) { return d3.time.month(d.date_e); });
    var enteredDatesDim = xdata.dimension(function (d) { return d.date_e; });

    //--------------------------------------------------
    // Start constructing the charts and setting each chart's options
    //--------------------------------------------------
    dayEnteredChart.width($('#day-entered-chart').innerWidth())
      .margins({top: 0, left: 5, right: 20, bottom: 20})
      .dimension(dayOfWeekEnteredDim)
      .group(dayOfWeekEnteredDim.group())
      .label(function (d) {
          return d.key.split(".")[1];
      })
      .title(function (d) {
          return d.value;
      })
      .elasticX(true)
      .xAxis().ticks(4);
    dayEnteredChart.on("filtered", onFilt);


    monitorIDChart.width($('#monitorID-chart').innerWidth())
      //.height(window.innerHeight)
      .height(1200)
      .dimension(monitorNumDim)
      .group(monitorIdCount)
      .colors('#ffff00')
      .margins({top: 0, left: 5, right: 20, bottom: 20})
      .elasticX(true)
      .on("filtered", onFilt);


    // SiteID dimension
    siteIDChart.width($('#siteID-chart').innerWidth())
      .height(400)
      .dimension(siteDescDim)
      .group(siteDescCount)
      .colors(commonChartBarColor)
      .margins({top: 0, left: 5, right: 20, bottom: 20})
      .elasticX(true)
      .on("filtered", onFilt);


    timelineChart.width($('#timeline-chart').innerWidth())
      .height(60)
      .margins({top: 5, left: 20, right: 10, bottom: 20})
      .dimension(enteredDatesDim)
      .group(enteredDatesDim.group(d3.time.day))
      .x(d3.time.scale().domain([new Date(2011, 1, 1), new Date(2014, 12, 31)]))
      .round(d3.time.day.round)
      .xUnits(d3.time.days)
      .elasticY(true)
      .elasticX(true)
      .on("filtered", onFilt);
      timelineChart.yAxis().ticks(2);
      //timelineChart.xAxis().ticks(4);

  /*
    var dataTable = dc.dataTable("#dc-data-table");
    dataTable.width(960).height(800)
      .dimension(monitorNumDim)
        .group(function(d){ return "Citizen Science Table" })
        .size(100)
        .columns([
          function(d) {return d.date_e; },
          function(d) {return d.siteDesc; },
          function(d) {return d.monitorid; },
          function(d) {return d.name; },
          function(d) {return d.airtemp; },
          function(d) {return d.wtemp; },
          function(d) {return d.avgdo; },
          function(d) {return d.ph; },
          function(d) {return d.salinity; },
          function(d) {return d.enterococcus; }
        ])
        .sortBy(function(d) {return d.date_e; })
        .order(d3.ascending);
  */

    var datatable = $('#dc-data-table').dataTable({
      "aaData": locations.top(Infinity),
      "aoColumns": [
        { "mData": "date_f", "sDefaultContent": ""},
        { "mData": "siteid", "sDefaultContent": ""},
        { "mData": "area", "sDefaultContent": ""},
        { "mData": "siteDesc", "sDefaultContent": " "},
        { "mData": "groupid", "sDefaultContent": ""},
        { "mData": "monitorid", "sDefaultContent": ""},
        { "mData": "name", "sDefaultContent": " "},
        { "mData": "airtemp", "sDefaultContent": ""},
        { "mData": "wtemp", "sDefaultContent": ""},
        { "mData": "avgdo", "sDefaultContent": ""},
        { "mData": "ph", "sDefaultContent": ""},
        { "mData": "trans", "sDefaultContent": ""},
        { "mData": "sampledepth", "sDefaultContent": ""},
        { "mData": "totaldepth", "sDefaultContent": ""},
        { "mData": "sgravity", "sDefaultContent": ""},
        { "mData": "spgrtemp", "sDefaultContent": ""},
        { "mData": "salinity", "sDefaultContent": ""},
        { "mData": "flow", "sDefaultContent": ""},
        { "mData": "algae", "sDefaultContent": ""},
        { "mData": "color", "sDefaultContent": ""},
        { "mData": "clarity", "sDefaultContent": ""},
        { "mData": "surface", "sDefaultContent": ""},
        { "mData": "conditions", "sDefaultContent": ""},
        { "mData": "odor", "sDefaultContent": ""},
        { "mData": "weather", "sDefaultContent": ""},
        { "mData": "lastprecip", "sDefaultContent": ""},
        { "mData": "rain3d", "sDefaultContent": ""},
        { "mData": "reagent", "sDefaultContent": ""},
        { "mData": "enterococcus", "sDefaultContent": " "},
        { "mData": "tide", "sDefaultContent": ""},
        { "mData": "comments", "sDefaultContent": ""}
      ],
      "bDestroy": true,
      "sDom": 'CT<"clear">lfrtip',
      "scrollX": true,
      "columnDefs": [
          {
              "targets": [ 1 ],
              "visible": false
          },
          {
              "targets": [ 3 ],
              "visible": false
          },
          {
              "targets": [ 4 ],
              "visible": false
          },
          {
              "targets": [ 11 ],
              "visible": false
          },
          {
              "targets": [ 12 ],
              "visible": false
          },
          {
              "targets": [ 13 ],
              "visible": false
          },
          {
              "targets": [ 14 ],
              "visible": false
          },
          {
              "targets": [ 15 ],
              "visible": false
          },
          {
              "targets": [ 17 ],
              "visible": false
          },
          {
              "targets": [ 18 ],
              "visible": false
          },
          {
              "targets": [ 19 ],
              "visible": false
          },
          {
              "targets": [ 20 ],
              "visible": false
          },
          {
              "targets": [ 21 ],
              "visible": false
          },
          {
              "targets": [ 22 ],
              "visible": false
          },
          {
              "targets": [ 23 ],
              "visible": false
          },
          {
              "targets": [ 24 ],
              "visible": false
          },
          {
              "targets": [ 25 ],
              "visible": false
          },
          {
              "targets": [ 26 ],
              "visible": false
          },
          {
              "targets": [ 27 ],
              "visible": false
          },
          {
              "targets": [ 29 ],
              "visible": false
          },
          {
              "targets": [ 30 ],
              "visible": false
          },
      ],
      "oColVis":{
        "activate":"mouseover",
        "sAlign": "right",
        "bRestore": true
      },
      "oTableTools":{
        "aButtons": [
          {
              "sExtends": "copy",
              "sButtonText": "Copy to clipboard"
          },
          {
              "sExtends": "csv",
              "sButtonText": "Save to CSV"
          },
          "print"
      ],
        "sSwfPath": "static/libs/datatables/extensions/TableTools/swf/copy_csv_xls_pdf.swf"
      }
    });

    function RefreshTable(){
      dc.events.trigger(function(){
        alldata = locations.top(Infinity);
        datatable.fnClearTable();
        datatable.fnAddData(alldata);
        datatable.fnDraw();
        onFilt();
      });
    }
    for (var i = 0; i < dc.chartRegistry.list().length; i++){
      var chartI = dc.chartRegistry.list()[i];
      chartI.on("filtered", RefreshTable);
    }

    dc.renderAll();

  	//When clicking the Reset all filters, we show all datapoints on every visualization
  	window.reset = function() {
      dayEnteredChart.filterAll();
      monitorIDChart.filterAll();
      timelineChart.filterAll();
      siteIDChart.filterAll();
  		dc.redrawAll();
  	};
  finishedLoading();
});


//--------------------------------------------------
// Map Settings
//--------------------------------------------------
// Create a new group to which we can (later) add or remove our markers
var markersLayer = new L.LayerGroup();
// Create a new cluster group to which we can (later) add or remove our markers
var clusterLayer = new L.MarkerClusterGroup();
// Set up the base map
var osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom: 18
});
var cartodb_light = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',{
attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom:18
});
var cartodb_dark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',{
attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom:18
});
var baseMaps = {
  "Light": cartodb_light,
  "Dark": cartodb_dark,
  "OSM Default": osm
};
// Overlayed layers
var overlays = {
  "Clustered Markers": clusterLayer,
  "Individual Markers": markersLayer
};
// Initialize the Leaflet map
var map = L.map('map', {
  zoomControl: false,
  scrollWheelZoom: true,
  center: [29.35, -94.65],
  zoom: 9,
  layers: [cartodb_light, clusterLayer]
});
L.control.layers(baseMaps, overlays).addTo(map);
map._layersMinZoom=8;

function startLoading() {
  map.spin(true);
}
function finishedLoading() {
  setTimeout(function(){
    map.spin(false);
  }, 1000);
}
startLoading();

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

// Called when dc.js is filtered (typically from user click interaction)
var onFilt = function(chart, filter) {
  updateMap(locations.top(Infinity));
};

// Updates the displayed map markers to reflect the crossfilter dimension passed in
var updateMap = function(locs) {
  // clear the existing markers from the map
  markersLayer.clearLayers();
  clusterLayer.clearLayers();

  $("#active").html("<b>" + locs.length + "</b>");

  locs.forEach( function(d, i) {
    if (d.geometry.coordinates[1]!==null && d.geometry.coordinates[1]!=='undefined') {
      // add a Leaflet marker for the lat lng and insert the application's stated bacteria in popup
      d.ll = L.latLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);

      //convert numbers to meaningful description
      switch (d.flow) {
        case "1":
          flow = "No flow";
          break;
        case "2":
          flow = "Low";
          break;
        case "3":
          flow = "Normal";
          break;
        case "4":
          flow = "Flood";
          break;
        case "5":
          flow = "High";
          break;
        case "6":
          flow = "Dry";
          break;
      }

      switch (d.algae) {
        case "1":
          algae = "Absent";
          break;
        case "2":
          algae = "Rare (<25%)";
          break;
        case "3":
          algae = "Common (26-50%)";
          break;
        case "4":
          algae = "Abundant (50-75%)";
          break;
        case "5":
          algae = "Dominant (>75%)";
          break;
      }

      switch (d.color) {
        case "1":
          wcolor = "No color";
          break;
        case "2":
          wcolor = "Light green";
          break;
        case "3":
          wcolor = "Dark green";
          break;
        case "4":
          wcolor = "Tan";
          break;
        case "5":
          wcolor = "Red";
          break;
        case "6":
          wcolor = "Green/brown";
          break;
        case "7":
          wcolor = "Black";
          break;
      }

      switch (d.clarity) {
        case "1":
          clarity = "Clear";
          break;
        case "2":
          clarity = "Cloudy";
          break;
        case "3":
          clarity = "Turbid";
          break;
      }

      switch (d.surface) {
        case "1":
          surface = "Clear";
          break;
        case "2":
          surface = "Scum";
          break;
        case "3":
          surface = "Form";
          break;
        case "4":
          surface = "Debris";
          break;
        case "5":
          surface = "Sheen";
          break;
      }

      switch (d.conditions) {
        case "1":
          conditions = "Calm";
          break;
        case "2":
          conditions = "Ripples";
          break;
        case "3":
          conditions = "Waves";
          break;
        case "4":
          conditions = "White caps";
          break;
      }

      switch (d.odor) {
        case "1":
          odor = "None";
          break;
        case "2":
          odor = "Oil";
          break;
        case "3":
          odor = "Acrid (pungent)";
          break;
        case "4":
          odor = "Sewage";
          break;
        case "5":
          odor = "Rotten egg";
          break;
        case "6":
          odor = "Fishy";
          break;
        case "7":
          odor = "Musky";
          break;
      }

      switch (d.weather) {
        case "1":
          weather = "Clear";
          break;
        case "2":
          weather = "Cloudy";
          break;
        case "3":
          weather = "Overcast";
          break;
        case "4":
          weather = "Rain";
          break;
      }

      switch (d.tide) {
        case "1":
          tide = "Low";
          break;
        case "2":
          tide = "falling";
          break;
        case "3":
          tide = "Slack";
          break;
        case "4":
          tide = "Rising";
          break;
        case "5":
          tide = "High";
          break;
      }

      content = "<b>" + d.properties.Date_Time + "</b>&nbsp;&nbsp;Monitor ID: " + d.properties.Monitor_ID + ", " + d.properties.Name + "<br />" + "TST Site ID: " + d.properties.Site_ID + "&nbsp;&nbsp; Site: " + d.properties.Site_Description + "<br />" +
      "<ul class='nav nav-tabs' role='tablist'><li role='presentation' class='active'><a href='#gbf_one' role='tab' data-toggle='tab'>Common Data</a></li><li role='presentation'><a href='#gbf_two' role='tab' data-toggle='tab'>Data</a></li><li role='presentation'><a href='#gbf_three' role='tab' data-toggle='tab'>Field Observations</a></li></ul>" +
      "<div class='tab-content'><div role='tabpanel' class='tab-pane active' id='gbf_one'>" +
      "<table class='table table-striped'>" +
      "<tr><td>Air Temperature (&deg;C)</td><td>" + d.properties.Air_Temp_degC + "</td></tr>" +
      "<tr><td>Water Temperature (&deg;C)</td><td>" + d.properties.Water_Temp_degC + "</td></tr>" +
      "<tr><td>Average Dissolved Oxygen (mg/L)</td><td>" + d.properties.Avg_DO + "</td></tr>" +
      "<tr><td>pH</td><td>" + d.properties.pH + "</td></tr>" +
      "<tr><td>Salinity (ppt)</td><td>" + d.properties.Salinity + "</td></tr>" +
      "</table></div>" +
      "<div role='tabpanel' class='tab-pane' id='gbf_two'>" +
      "<table class='table table-striped'>" +
      "<tr><td>Sample Depth (m)</td><td>" + d.properties.Sample_Depth_m +"</td></tr>" +
      "<tr><td>Transparency (m)</td><td>" + d.properties.Transparency + "</td></tr>" +
      "<tr><td>Total Depth (m)</td><td>" + d.properties.Total_Depth_m + "</td></tr>" +
      "<tr><td>Specific Gravity</td><td>" + d.properties.Specific_Gravity + "</td></tr>" +
      "<tr><td>SpGr Temp (&deg;C)</td><td>" + d.properties.SpGr_Temp + "</td></tr>" +
      "</table></div>" +
      "<div role='tabpanel' class='tab-pane' id='gbf_three'>Days since last precip: " + d.properties.Days_Since_Precip + "<br />Rainfall Accumulation last 3 days (inches): " + d.properties.Rainfall_Accum + "<br />Enterococcus (CFU/100ml): " + d.properties.Enterococcus + "<br />" +
      "<table class='table table-striped' id='gbf_wq2'>" +
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

      var mark = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]]).bindPopup(content,{minWidth:350});

      markersLayer.addLayer(mark);
      clusterLayer.addLayer(mark);
    }
  });
};

//Modal
$("#siteInfoModal").on('shown.bs.modal');
