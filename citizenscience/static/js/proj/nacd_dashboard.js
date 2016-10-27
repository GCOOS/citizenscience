//TODO
//data location
//mongodb
nacdData = 'nacd_db/data';
//local
//nacdData = 'static/data/nacd_2015_09_03.geojson';

//--------------------------------------------------
// Initialize our dc.js charts, passing the DOM Id in which we want the chart rendered as an argument
//--------------------------------------------------
var siteIDChart = dc.rowChart("#siteID-chart"),
    //monitorIDChart = dc.rowChart("#monitorID-chart"),
    dayEnteredChart = dc.rowChart("#day-entered-chart"),
    monthlyChart = dc.rowChart("#monthly-chart"),
    yearlyChart = dc.rowChart("#yearly-chart"),
    timelineChart = dc.barChart("#timeline-chart");

var airtempChart = dc.rowChart("#airtemp-chart"),
    watertempChart = dc.rowChart("#watertemp-chart"),
    doChart = dc.rowChart("#do-chart"),
    phChart = dc.rowChart("#ph-chart"),
    salinityChart = dc.rowChart("#salinity-chart"),
    nitratesChart = dc.rowChart("#nitrates-chart");

// A common color for all of the bar and row charts
var commonChartBarColor = '#a1d99b';

var nacdChart = [];

// This is where we will hold our crossfilter data
var xdata = null,
    all = null,
    locations = null,
    siteDescDim = null;
//monitorNumDim = null;
d3.queue()
    //  .defer(d3.json, 'static/data/nacd_2015_09_03.geojson')
    .defer(d3.json, nacdData)
    .await(makeDashboard);

function makeDashboard(error, data) {
    console.log("loading search list");
    //console.log(data);

    var dateFormat = d3.time.format("%m/%d/%Y %H:%M:%S");
    data.features.forEach(function(d, i) {
        if (d.geometry.coordinates[1] !== null && d.geometry.coordinates[1] !== 'undefined' && d.geometry.coordinates[1] !== "") {
            d.no = d.properties.No;
            d.date_e = dateFormat.parse(d.properties.Date_Time);
            d.date_f = moment(new Date(d.date_e).toISOString()).format("M/D/YYYY h:mm a");
            d.lat = d.geometry.coordinates[1];
            d.lng = d.geometry.coordinates[0];
            d.siteid = d.properties.Site_ID;
            d.siteDesc = d.properties.Site;
            d.monitorid = d.properties.Monitor_ID;
            d.participants = d.properties.Participants;
            d.landuse = d.properties.Land_Use;
            d.airtemp = d.properties.AirTemp_C;
            d.windspeed = d.properties.Wind_Speed_mph;
            d.winddir = d.properties.Wind_Direction;
            d.tide = d.properties.Tide_stage;
            d.weather = d.properties.Weather;
            d.wtemp = d.properties.WaterTemp_C;
            d.salinity = d.properties.Salinity_ppt;
            d.turbidity = d.properties.Turbidity_NTU;
            d.ph = d.properties.pH;
            d.avgdo = d.properties.DissolvedOxygen_ppm;
            d.nitrates = d.properties.Nitrates_ppm;
            d.litter = d.properties.Litter_kg;
            d.abdlitter = d.properties.Most_Abundant_Litter;
            d.abdspecies = d.properties.Most_Abundant_Species;
            d.species = d.properties.Species_Found;

            d.ll = L.latLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);

            content = "<b>" + d.date_f + "</b>&nbsp;&nbsp;Monitor ID: " + d.monitorid +
                //", " + d.monitor +
                " (Participants:" + d.participants + ")<br />" + "&nbsp;&nbsp; Site: " + d.siteDesc + "&nbsp;&nbsp;&nbsp;<a href='#' onclick='createNACDChart(" + d.properties.Site_ID + ");' class='siteSummary'>Site Summary</a>" + "<br />" +
                "<ul class='nav nav-tabs' role='tablist'>" +
                "<li role='presentation' class='active'><a href='#nacd_one' role='tab' data-toggle='tab'>Common Data</a></li>" +
                "<li role='presentation'><a href='#nacd_two' role='tab' data-toggle='tab'>Weather</a></li>" +
                "<li role='presentation'><a href='#nacd_three' role='tab' data-toggle='tab'>Others</a></li>" +
                "</ul>" +
                "<div class='tab-content'>" +
                "<div role='tabpanel' class='tab-pane active' id='nacd_one'>" +
                "<table class='table table-striped'>" +
                "<tr><td>Air Temperature (&deg;C)</td><td>" + d.airtemp + "</td></tr>" +
                "<tr><td>Water Temperature (&deg;C)</td><td>" + d.wtemp + "</td></tr>" +
                "<tr><td>Dissolved Oxygen (ppm)</td><td>" + d.avgdo + "</td></tr>" +
                "<tr><td>pH</td><td>" + d.ph + "</td></tr>" +
                "<tr><td>Salinity (ppt)</td><td>" + d.salinity + "</td></tr>" +
                "</table></div>" +
                "<div role='tabpanel' class='tab-pane' id='nacd_two'>" +
                "<table class='table table-striped'>" +
                "<tr><td>Weather</td><td>" + d.weather + "</td></tr>" +
                "<tr><td>Land Use</td><td>" + d.landuse + "</td></tr>" +
                "<tr><td>Wind Speed (mph)</td><td>" + d.windspeed + "</td></tr>" +
                "<tr><td>Wind Direction</td><td>" + d.winddir + "</td></tr>" +
                "</table></div>" +
                "<div role='tabpanel' class='tab-pane' id='nacd_three'>" +
                "<table class='table table-striped'>" +
                "<tr><td>Turbidity (NTU)</td><td>" + d.turbidity + "</td></tr>" +
                "<tr><td>Nitrate (ppm)</td><td>" + d.nitrates + "</td></tr>" +
                "<tr><td>Litter(kg)</td><td>" + d.litter + "</td></tr>" +
                "<tr><td>Most Abundant Litter</td><td>" + d.abdlitter + "</td></tr>" +
                "<tr><td>Species</td><td>" + d.species + "</td></tr>" +
                "<tr><td>Most abundant species</td><td>" + d.abdspecies + "</td></tr>" +
                "</table></div>" +
                "</div>";

            var mark = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]]).bindPopup(content, {
                minWidth: 350
            });
            markersLayer.addLayer(mark);
            clusterLayer.addLayer(mark);

            nacdChart.push({
                datetime: moment(new Date(d.date_e).toISOString()).valueOf(),
                siteid: parseInt(d.properties.Site_ID),
                airtemp: parseFloat(d.properties.AirTemp_C),
                wtemp: parseFloat(d.properties.WaterTemp_C),
                avgdo: parseFloat(d.properties.DissolvedOxygen_ppm),
                avgph: parseFloat(d.properties.pH),
                salinity: parseFloat(d.properties.Salinity_ppt),
                nitrates: parseFloat(d.properties.Nitrates_ppm),
                sample_no: parseInt(d.properties.No),
                sitedesc: d.properties.Site,
                source: "NACD"
            });
        } else {
            console.log("passed " + d.properties.Date_Time + " Row " + i);
        }

    });

    // Construct the data dimension
    //--------------------------------------------------
    xdata = crossfilter(data.features);

    // selects all records into a single group, reduceCount creates a count of the records.
    all = xdata.groupAll().reduceCount().value();
    //console.log("There are " + all + " here");
    $("#total_entry").html(all);
    $("#active_entry").html(all); //initial number

    // a dimension is to group or filter by.
    locations = xdata.dimension(function(d) {
        return d.properties.ll;
    });
    siteDescDim = xdata.dimension(function(d) {
        return d.properties.Site;
    });
    var siteDescCount = siteDescDim.group().reduceCount(function(d) {
        return d.siteDesc;
    });

    //monitorNumDim = xdata.dimension(function (d) { return d.monitorid; });
    //var monitorIdCount = monitorNumDim.group().reduceCount(function(d){ return d.monitorid; });

    var dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var dayOfWeekEnteredDim = xdata.dimension(function(d) {
        //console.log(d.no, d.date_e);
        return d.date_e.getDay() + "." + dayOfWeekNames[d.date_e.getDay()];
    });

    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var enteredMonthsDim = xdata.dimension(function(d) {
        //return d.date_e.getMonth() + "." + monthNames[ d.date_e.getMonth() ];
        d.month = ("0" + (d.date_e.getMonth() + 1)).slice(-2);
        return d.month + "." + monthNames[d.date_e.getMonth()];
    });
    var enteredDatesDim = xdata.dimension(function(d) {
        return d.date_e;
    });

    var enteredYearDim = xdata.dimension(function(d) {
        return d.date_e.getFullYear();
    });

    var airtempDim = xdata.dimension(function(d) {
        if (d.airtemp > 0 && d.airtemp < 10) {
            return '0-10°C';
        } else if (d.airtemp >= 10 && d.airtemp < 20) {
            return '10-20°C';
        } else if (d.airtemp >= 20 && d.airtemp < 30) {
            return '20-30°C';
        } else if (d.airtemp >= 30 && d.airtemp < 40) {
            return '30-40°C';
        } else if (d.airtemp >= 40) {
            return '>40';
        } else {
            return 'Not measured'
        }
    });

    var watertempDim = xdata.dimension(function(d) {
        if (d.wtemp > 0 && d.wtemp < 10) {
            return '0-10°C';
        } else if (d.wtemp >= 10 && d.wtemp < 20) {
            return '10-20°C';
        } else if (d.wtemp >= 20 && d.wtemp < 30) {
            return '20-30°C';
        } else if (d.wtemp >= 30 && d.wtemp < 40) {
            return '30-40°C';
        } else if (d.wtemp >= 40) {
            return '>40';
        } else {
            return 'Not measured'
        }
    });

    var doDim = xdata.dimension(function(d) {
        if (d.avgdo > 0 && d.avgdo < 3) {
            return '0 - 3 mg/L';
        } else if (d.avgdo >= 3 && d.avgdo < 5) {
            return '3 - 5 mg/L';
        } else if (d.avgdo >= 5 && d.avgdo < 7) {
            return '5 - 7 mg/L';
        } else if (d.avgdo >= 7 && d.avgdo < 9) {
            return '7 - 9 mg/L';
        } else if (d.avgdo >= 9) {
            return '9+';
        } else {
            return 'Not measured'
        }
    });

    var phDim = xdata.dimension(function(d) {
        if (d.ph > 0 && d.ph < 5) {
            return '3-5: Strongly acid';
        } else if (d.ph >= 5 && d.ph < 6) {
            return '5-6: Moderately acid';
        } else if (d.ph >= 6 && d.ph < 7) {
            return '6-7:Slightly acid';
        } else if (d.ph == 7) {
            return '7: Neutral';
        } else if (d.ph > 7 && d.ph < 8) {
            return '7-8: Slightly alkaline';
        } else if (d.ph >= 8 && d.ph < 9) {
            return '8-9: Moderately alkaline';
        } else if (d.ph >= 9) {
            return '9+: Strongly alkaline';
        } else {
            return 'Not measured'
        }
    });

    var salinityDim = xdata.dimension(function(d) {
        if (d.salinity >= 0 && d.salinity < 0.5) {
            return '0-0.5 PPT: Fresh water';
        } else if (d.salinity >= 0.5 && d.salinity < 30) {
            return '0.5-30 PPT: Brackish water';
        } else if (d.salinity >= 30 && d.salinity < 50) {
            return '30-50 PPT: Saline water';
        } else if (d.salinity >= 50) {
            return '50+ PPT: Brine water';
        } else {
            return 'Not measured'
        }
    });

    var nitratesDim = xdata.dimension(function(d) {
        if (d.nitrates > 0 && d.nitrates <= 1) {
            return '0-1 ppm';
        } else if (d.nitrates > 1 && d.nitrates <= 3.0) {
            return '1-3 ppm';
        } else if (d.nitrates > 3.0 && d.nitrates <= 6.0) {
            return '3-6 ppm';
        } else if (d.nitrates > 6.0 && d.nitrates <= 12.0) {
            return '6-12 ppm'
        } else if (d.nitrates > 12.0) {
            return '>12 ppm'
        } else {
            return 'Not measured'
        }
    });



    //--------------------------------------------------
    // Start constructing the charts and setting each chart's options
    //--------------------------------------------------
    dayEnteredChart.width($('#day-entered-chart').innerWidth())
        .height(200)
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .dimension(dayOfWeekEnteredDim)
        .group(dayOfWeekEnteredDim.group())
        .label(function(d) {
            return d.key.split(".")[1];
        })
        .title(function(d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4);
    dayEnteredChart.on("filtered", onFilt);


    monthlyChart.width($('#monthly-chart').innerWidth())
        .height(250)
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .dimension(enteredMonthsDim)
        .group(enteredMonthsDim.group())
        .label(function(d) {
            return d.key.split(".")[1];
        })
        .title(function(d) {
            return d.value;
        })
        .elasticX(true)
        .xAxis().ticks(4);
    monthlyChart.on("filtered", onFilt);


    yearlyChart.width($('#yearly-chart').innerWidth())
        .height(200)
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .dimension(enteredYearDim)
        .group(enteredYearDim.group())
        .elasticX(true)
        .xAxis().ticks(4);
    yearlyChart.on("filtered", onFilt);

    // SiteID dimension
    siteIDChart.width($('#siteID-chart').innerWidth())
        .height(400)
        .dimension(siteDescDim)
        .group(siteDescCount)
        .colors(commonChartBarColor)
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .elasticX(true)
        .on("filtered", onFilt);


    timelineChart.width($('#timeline-chart').innerWidth())
        .height(60)
        .margins({
            top: 5,
            left: 20,
            right: 10,
            bottom: 20
        })
        .dimension(enteredDatesDim)
        .group(enteredDatesDim.group(d3.time.day))
        .x(d3.time.scale().domain([new Date(2011, 1, 1), new Date(2015, 12, 31)]))
        .round(d3.time.day.round)
        .xUnits(d3.time.days)
        .elasticY(true)
        .elasticX(true)
        .on("filtered", onFilt);
    timelineChart.yAxis().ticks(2);
    //timelineChart.xAxis().ticks(4);

    airtempChart.width($('#airtemp-chart').innerWidth())
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .height(120)
        .dimension(airtempDim)
        .group(airtempDim.group())
        .label(function(d) {
            return d.key;
        })
        .elasticX(true)
        .on("filtered", onFilt);
    airtempChart.xAxis().ticks(5);

    watertempChart.width($('#watertemp-chart').innerWidth())
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .height(120)
        .dimension(watertempDim)
        .group(watertempDim.group())
        .label(function(d) {
            return d.key;
        })
        .elasticX(true)
        .on("filtered", onFilt);
    watertempChart.xAxis().ticks(5);

    doChart.width($('#do-chart').innerWidth())
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .height(120)
        .dimension(doDim)
        .group(doDim.group())
        .label(function(d) {
            return d.key;
        })
        .elasticX(true)
        .on("filtered", onFilt);
    doChart.xAxis().ticks(5);

    phChart.width($('#ph-chart').innerWidth())
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .height(120)
        .dimension(phDim)
        .group(phDim.group())
        .label(function(d) {
            return d.key;
        })
        .elasticX(true)
        .on("filtered", onFilt);
    phChart.xAxis().ticks(5);

    salinityChart.width($('#salinity-chart').innerWidth())
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .height(120)
        .dimension(salinityDim)
        .group(salinityDim.group())
        .label(function(d) {
            return d.key;
        })
        .elasticX(true)
        .on("filtered", onFilt);
    salinityChart.xAxis().ticks(5);

    nitratesChart.width($('#nitrates-chart').innerWidth())
        .margins({
            top: 0,
            left: 5,
            right: 20,
            bottom: 20
        })
        .height(120)
        .dimension(nitratesDim)
        .group(nitratesDim.group())
        .label(function(d) {
            return d.key;
        })
        .elasticX(true)
        .on("filtered", onFilt);
    nitratesChart.xAxis().ticks(5);

    //console.log(data.features)
    var datatable = $('#dc-data-table').dataTable({
        data: data.features,
        columns: [{
                "mData": "no",
                "sDefaultContent": ""
            }, //0
            {
                "mData": "date_f",
                "sDefaultContent": ""
            }, //1
            {
                "mData": "siteid",
                "sDefaultContent": ""
            }, //2
            {
                "mData": "siteDesc",
                "sDefaultContent": " "
            }, //3
            {
                "mData": "monitorid",
                "sDefaultContent": ""
            }, //4
            //{ "mData": "monitor", "sDefaultContent": " "},
            {
                "mData": "participants",
                "sDefaultContent": ""
            }, //5
            {
                "mData": "weather",
                "sDefaultContent": ""
            }, //6
            {
                "mData": "landuse",
                "sDefaultContent": ""
            }, //7
            {
                "mData": "turbidity",
                "sDefaultContent": ""
            }, //8
            {
                "mData": "airtemp",
                "sDefaultContent": ""
            }, //9
            {
                "mData": "wtemp",
                "sDefaultContent": ""
            }, //10
            {
                "mData": "avgdo",
                "sDefaultContent": ""
            }, //11
            {
                "mData": "ph",
                "sDefaultContent": ""
            }, //12
            {
                "mData": "salinity",
                "sDefaultContent": ""
            }, //13
            {
                "mData": "nitrates",
                "sDefaultContent": ""
            }, //14
            {
                "mData": "litter",
                "sDefaultContent": " "
            }, //15
            {
                "mData": "abdlitter",
                "sDefaultContent": ""
            }, //16
            {
                "mData": "abdspecies",
                "sDefaultContent": ""
            }, //17
            {
                "mData": "species",
                "sDefaultContent": ""
            }, //18
            {
                "mData": "windspeed",
                "sDefaultContent": ""
            }, //19
            {
                "mData": "winddir",
                "sDefaultContent": " "
            } //20
        ],
        order: [
            [0, "desc"]
        ],
        colReorder: true,
        rowReorder: false,
        responsive: true,
        deferRender: true,
        select: true,
        dom: 'Bfrtip',
        lengthMenu: [
            [10, 25, 50, 100, -1],
            ['10 rows', '25 rows', '50 rows', '100 rows', 'Show all']
        ],
        "columnDefs": [{
            "targets": [0],
            "visible": false
        }, {
            "targets": [2],
            "visible": false
        }, {
            "targets": [4],
            "visible": false
        }, {
            "targets": [5],
            "visible": false
        }, {
            "targets": [6],
            "visible": false
        }, {
            "targets": [7],
            "visible": false
        }, {
            "targets": [8],
            "visible": false
        }, {
            "targets": [14],
            "visible": false
        }, {
            "targets": [15],
            "visible": false
        }, {
            "targets": [16],
            "visible": false
        }, {
            "targets": [17],
            "visible": false
        }, {
            "targets": [18],
            "visible": false
        }, {
            "targets": [19],
            "visible": false
        }, {
            "targets": [20],
            "visible": false
        }],
        buttons: [{
            extend: 'pageLength'
        }, {
            extend: 'copyHtml5',
            text: 'Copy selected',
            exportOptions: {
                columns: ':visible',
                modifier: {
                    page: 'current',
                    selected: true
                }
            }
        }, {
            extend: 'csvHtml5',
            text: 'Export as CSV',
            title: 'Galveston Bay Foundation Data',
            exportOptions: {
                columns: ':visible',
                modifier: {
                    page: 'current'
                }
            }
        }, {
            extend: 'excelHtml5',
            text: 'Save as XLSX',
            title: 'Galveston Bay Foundation Data',
            exportOptions: {
                columns: ':visible',
                modifier: {
                    page: 'current'
                }
            }
        }, {
            extend: 'pdfHtml5',
            text: "Export as PDF",
            title: 'Galveston Bay Foundation Data',
            orientation: 'landscape',
            download: 'open',
            exportOptions: {
                columns: ':visible',
                modifier: {
                    page: 'current'
                }
            }
        }, {
            extend: 'colvis'
        }]
    });

    function RefreshTable() {
        dc.events.trigger(function() {
            alldata = locations.top(Infinity);
            datatable.fnClearTable();
            datatable.fnAddData(alldata);
            datatable.fnDraw();
            onFilt();
        });
    }
    for (var i = 0; i < dc.chartRegistry.list().length; i++) {
        var chartI = dc.chartRegistry.list()[i];
        chartI.on("filtered", RefreshTable);
    }

    dc.renderAll();

    //When clicking the Reset all filters, we show all datapoints on every visualization
    window.reset = function() {
        dayEnteredChart.filterAll();
        monthlyChart.filterAll();
        yearlyChart.filterAll();
        timelineChart.filterAll();
        siteIDChart.filterAll();
        airtempChart.filterAll();
        watertempChart.filterAll();
        doChart.filterAll();
        phChart.filterAll();
        salinityChart.filterAll();
        nitratesChart.filterAll();
        dc.redrawAll();
    };
    finishedLoading();
}


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
var cartodb_light = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom: 18
});
var cartodb_dark = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a> | Points data from <a href="http://galvbay.org">galvbay.org</a>',
    maxZoom: 18
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
map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: true,
    center: [28.09, -82.78],
    zoom: 7,
    layers: [cartodb_light, clusterLayer]
});
L.control.layers(baseMaps, overlays).addTo(map);
//map._layersMinZoom=7;

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

    $("#active_entry").html("<b>" + locs.length + "</b>");

    locs.forEach(function(d, i) {
        if (d.geometry.coordinates[1] !== null && d.geometry.coordinates[1] !== 'undefined') {
            // add a Leaflet marker for the lat lng and insert the application's stated bacteria in popup
            d.ll = L.latLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);

            content = "<b>" + d.date_f + "</b>&nbsp;&nbsp;Monitor ID: " + d.monitorid +
                //", " + d.monitor +
                " (Participants:" + d.participants + ")<br />" + "&nbsp;&nbsp; Site: " + d.siteDesc + "&nbsp;&nbsp;&nbsp;<a href='#' onclick='createNACDChart(" + d.properties.Site_ID + ");' class='siteSummary'>Site Summary</a>" + "<br />" +
                "<ul class='nav nav-tabs' role='tablist'>" +
                "<li role='presentation' class='active'><a href='#nacd_one' role='tab' data-toggle='tab'>Common Data</a></li>" +
                "<li role='presentation'><a href='#nacd_two' role='tab' data-toggle='tab'>Weather</a></li>" +
                "<li role='presentation'><a href='#nacd_three' role='tab' data-toggle='tab'>Others</a></li>" +
                "</ul>" +
                "<div class='tab-content'>" +
                "<div role='tabpanel' class='tab-pane active' id='nacd_one'>" +
                "<table class='table table-striped'>" +
                "<tr><td>Air Temperature (&deg;C)</td><td>" + d.airtemp + "</td></tr>" +
                "<tr><td>Water Temperature (&deg;C)</td><td>" + d.wtemp + "</td></tr>" +
                "<tr><td>Dissolved Oxygen (ppm)</td><td>" + d.avgdo + "</td></tr>" +
                "<tr><td>pH</td><td>" + d.ph + "</td></tr>" +
                "<tr><td>Salinity (ppt)</td><td>" + d.salinity + "</td></tr>" +
                "</table></div>" +
                "<div role='tabpanel' class='tab-pane' id='nacd_two'>" +
                "<table class='table table-striped'>" +
                "<tr><td>Weather</td><td>" + d.weather + "</td></tr>" +
                "<tr><td>Land Use</td><td>" + d.landuse + "</td></tr>" +
                "<tr><td>Wind Speed (mph)</td><td>" + d.windspeed + "</td></tr>" +
                "<tr><td>Wind Direction</td><td>" + d.winddir + "</td></tr>" +
                "</table></div>" +
                "<div role='tabpanel' class='tab-pane' id='nacd_three'>" +
                "<table class='table table-striped'>" +
                "<tr><td>Turbidity (NTU)</td><td>" + d.turbidity + "</td></tr>" +
                "<tr><td>Nitrate (ppm)</td><td>" + d.nitrates + "</td></tr>" +
                "<tr><td>Litter(kg)</td><td>" + d.litter + "</td></tr>" +
                "<tr><td>Most Abundant Litter</td><td>" + d.abdlitter + "</td></tr>" +
                "<tr><td>Species</td><td>" + d.species + "</td></tr>" +
                "<tr><td>Most abundant species</td><td>" + d.abdspecies + "</td></tr>" +
                "</table></div>" +
                "</div>";

            var mark = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]]).bindPopup(content, {
                minWidth: 350
            });

            markersLayer.addLayer(mark);
            clusterLayer.addLayer(mark);
        }
    });
};

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

    var filtered = $(nacdChart).filter(function(i, n) {
        return n.siteid === siteid;
    });
    var pageTitle = "Site: " + filtered[0].sitedesc;
    //console.log(filtered);
    // sort based on timestamp attribute
    filtered.sort(function(a, b) {
        // convert to integers from strings
        a = a.datetime;
        b = b.datetime;
        // compare
        if (a > b) {
            return 1;
        } else if (a < b) {
            return -1;
        } else {
            return 0;
        }
    });

    for (var i = 0; i < filtered.length; i++) {
        // For datetime axes, the X value is the timestamp in milliseconds since 1970.
        var local_date = filtered[i].datetime;
        //console.log(local_date);
        isNaN(filtered[i].airtemp) ? {} : arrayAirTemp.push([local_date, filtered[i].airtemp]);
        isNaN(filtered[i].wtemp) ? {} : arrayWTemp.push([local_date, filtered[i].wtemp]);
        isNaN(filtered[i].avgdo) ? {} : arrayAvgDO.push([local_date, filtered[i].avgdo]);
        isNaN(filtered[i].avgph) ? {} : arrayPH.push([local_date, filtered[i].avgph]);
        isNaN(filtered[i].salinity) ? {} : arraySalinity.push([local_date, filtered[i].salinity]);
        isNaN(filtered[i].nitrates) ? {} : arrayNitrates.push([local_date, filtered[i].nitrates]);
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
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
            },
            data: arrayAirTemp,
            tooltip: {
                valueSuffix: '°C'
            }
        }, {
            name: 'Water Temperature',
            //type: 'spline',
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
            },
            data: arrayWTemp,
            tooltip: {
                valueSuffix: '°C'
            }
        }, {
            name: 'Dissolved Oxygen',
            //type: 'spline',
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
            },
            data: arrayAvgDO,
            tooltip: {
                valueSuffix: ' mg/L'
            },
            yAxis: 2
        }, {
            name: 'pH',
            //type: 'spline',
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
            },
            data: arrayPH,
            tooltip: {
                valueSuffix: ''
            },
            yAxis: 3
        }, {
            name: 'Salinity',
            //type: 'spline',
            lineWidth: 0,
            marker: {
                enabled: true,
                radius: 2
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

//Modal
$("#siteInfoModal").on('shown.bs.modal');
