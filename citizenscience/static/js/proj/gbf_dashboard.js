//TODO
//data location: mongodb
gbfData = 'gbf_db/data';

// GBF related custom variables
var tintGreenMarker = L.AwesomeMarkers.icon({
   icon: 'tint',
   markerColor: 'green'
 });
// popup window content variables
var content, flow, algae, wcolor, clarity, surface, conditions, odor, weather, tide;
// chart
var gbfChart = [];
// A common color for all of the bar and row charts
var commonChartBarColor = '#a1d99b';

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
    enterocChart = dc.rowChart("#enteroc-chart");

// This is where we will hold our crossfilter data
var xdata = null,
    all = null,
    locations = null,
    siteDescDim = null;


d3.queue()
    .defer(d3.json, gbfData)
    .await(function(error, data) {
        console.log("loading search list");
        //console.log(data.features);

        var dateFormat = d3.time.format("%m/%d/%Y %H:%M:%S"); //original data is in ths date format

        data.features.forEach(function(d, i) {
            //console.log(d);
            if (d.geometry.coordinates[1] !== null && d.geometry.coordinates[1] !== 'undefined' && d.geometry.coordinates[1] !== "") {
                d.date_e = dateFormat.parse(d.properties.Date_Time);
                d.date_f = moment(new Date(d.date_e).toISOString()).format("M/D/YYYY h:mm a");
                d.lat = d.geometry.coordinates[1];
                d.lng = d.geometry.coordinates[0];
                d.siteid = d.properties.Site_ID;
                d.area = d.properties.Area;
                d.siteDesc = d.properties.Site_Description;
                d.groupid = d.properties.Group_ID;
                d.monitorid = d.properties.Monitor_ID;
                //d.name = d.properties.Name;
                d.airtemp = +d.properties.Air_Temp_degC;
                d.wtemp = +d.properties.Water_Temp_degC;
                d.avgdo = +d.properties.Avg_DO;
                d.ph = +d.properties.pH;
                d.trans = +d.properties.Transparency_m;
                d.sampledepth = +d.properties.Sample_Depth_m;
                d.totaldepth = +d.properties.Total_Depth_m;
                d.sgravity = +d.properties.Specific_Gravity;
                d.spgrtemp = +d.properties.SpGr_Temp;
                d.salinity = +d.properties.Salinity;
                d.flow = +d.properties.Flow;
                d.algae = +d.properties.Algae;
                d.color = +d.properties.Color;
                d.clarity = +d.properties.Clarity;
                d.surface = +d.properties.Surface;
                d.conditions = +d.properties.Conditions;
                d.odor = +d.properties.Odor;
                d.weather = +d.properties.Weather;
                d.lastprecip = d.properties.Days_Since_Precip;
                d.rain3d = d.properties.Rain_Accum;
                d.enterococcus = d.properties.Enterococcus;
                d.tide = d.properties.Tide;
                d.comments = d.properties.Comments;

                d.ll = L.latLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);

                //convert numbers to meaningful description
                switch (isNaN(d.flow) || parseInt(d.flow)) {
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

                switch (isNaN(d.algae) || parseInt(d.algae)) {
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

                switch (isNaN(d.color) || parseInt(d.color)) {
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

                switch (isNaN(d.clarity) || parseInt(d.clarity)) {
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

                switch (isNaN(d.surface) || parseInt(d.surface)) {
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

                switch (isNaN(d.conditions) || parseInt(d.conditions)) {
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

                switch (isNaN(d.odor) || parseInt(d.odor)) {
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

                switch (isNaN(d.weather) || parseInt(d.weather)) {
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

                switch (isNaN(d.tide) || parseInt(d.tide)) {
                    case true:
                        tide = "Not measured";
                        break;
                    case 1:
                        tide = "Low";
                        break;
                    case 2:
                        tide = "falling";
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

                content = "<b>" + d.properties.Date_Time + "</b>&nbsp;&nbsp;Monitor ID: " + d.properties.Monitor_ID + ", " +
                    //d.properties.Name + "<br />" +
                    "TST Site ID: " + d.properties.Site_ID + "&nbsp;&nbsp; Site: " + d.properties.Site_Description + "&nbsp;&nbsp;&nbsp;<a href='#' onclick='createGBFChart(" + d.properties.Site_ID + ");' class='siteSummary'>Site Summary</a>" + "<br />" +
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
                    "<tr><td>Sample Depth (m)</td><td>" + d.properties.Sample_Depth_m + "</td></tr>" +
                    "<tr><td>Transparency (m)</td><td>" + d.properties.Transparency_m + "</td></tr>" +
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
                    "<div role='tabpanel' class='tab-pane' id='gbf_four'>Days since last precip: " + d.properties.Days_Since_Precip + "<br />Rainfall Accumulation last 3 days (inches): " + d.properties.Rain_Accum + "<br />" +
                    "<table class='table table-striped' id='gbf_wq2'>" +
                    "<tr><td>Weather</td><td>" + weather + "</td></tr>" +
                    "<tr><td>Tide</td><td>" + tide + "</td></tr>" +
                    "</table></div>" +
                    "</div>";

                var mark = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]],{
                    icon: tintGreenMarker
                }).bindPopup(content, {
                    minWidth: 350
                });
                markersLayer.addLayer(mark);
                clusterLayer.addLayer(mark);

                //console.log(d.properties);
                gbfChart.push({
                    datetime: moment(new Date(d.properties.Date_Time).toISOString()).valueOf(),
                    siteid: parseInt(d.properties.Site_ID),
                    airtemp: parseFloat(d.properties.Air_Temp_degC),
                    wtemp: parseFloat(d.properties.Water_Temp_degC),
                    avgdo: parseFloat(d.properties.Avg_DO),
                    avgph: parseFloat(d.properties.pH),
                    salinity: parseFloat(d.properties.Salinity),
                    enteroc: parseFloat(d.properties.Enterococcus),
                    sitedesc: d.properties.Site_Description,
                    source: "GBF"
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
            return d.properties.Area;
        });
        var siteDescCount = siteDescDim.group().reduceCount(function(d) {
            return d.siteDesc;
        });

        //monitorNumDim = xdata.dimension(function (d) { return d.monitorid; });
        //var monitorIdCount = monitorNumDim.group().reduceCount(function(d){ return d.monitorid; });

        var dayOfWeekNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var dayOfWeekEnteredDim = xdata.dimension(function(d) {
            //console.log(d.date_e);
            return d.date_e.getDay() + "." + dayOfWeekNames[d.date_e.getDay()];
        });

        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var monthNameFormat = d3.time.format("%B");
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
            if (d.salinity >= 0.0 && d.salinity < 0.5) {
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

        var enterocDim = xdata.dimension(function(d) {
            if (d.enterococcus > 0 && d.enterococcus <= 10) {
                return '0 - 10';
            } else if (d.enterococcus > 10 && d.enterococcus < 100) {
                return '10 - 100';
            } else if (d.enterococcus >= 100 && d.enterococcus < 1000) {
                return '100 - 1,000';
            } else if (d.enterococcus >= 1000 && d.enterococcus < 2005) {
                return '1,000 - 2,005';
            } else if (d.enterococcus >= 2005) {
                return '2,005+'
            } else {
                return 'Not measured';
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
            .height(300)
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
            .x(d3.time.scale().domain([new Date(2011, 1, 1), new Date(2020, 12, 31)]))
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

        enterocChart.width($('#enteroc-chart').innerWidth())
            .margins({
                top: 0,
                left: 5,
                right: 20,
                bottom: 20
            })
            .height(120)
            .dimension(enterocDim)
            .group(enterocDim.group())
            .label(function(d) {
                return d.key;
            })
            .elasticX(true)
            .on("filtered", onFilt);
        enterocChart.xAxis().ticks(5);

        //console.log(data.features);
        var datatable = $('#dc-data-table').dataTable({
            data: data.features,
            columns: [{
                    "mData": "date_f",
                    "sDefaultContent": ""
                }, //0
                {
                    "mData": "siteid",
                    "sDefaultContent": ""
                }, //1
                {
                    "mData": "area",
                    "sDefaultContent": ""
                }, //2
                {
                    "mData": "siteDesc",
                    "sDefaultContent": " "
                }, //3
                {
                    "mData": "groupid",
                    "sDefaultContent": ""
                }, //4
                {
                    "mData": "monitorid",
                    "sDefaultContent": ""
                }, //5
                //{ "mData": "name", "sDefaultContent": " "},
                {
                    "mData": "airtemp",
                    "sDefaultContent": ""
                }, //6
                {
                    "mData": "wtemp",
                    "sDefaultContent": ""
                }, //7
                {
                    "mData": "avgdo",
                    "sDefaultContent": ""
                }, //8
                {
                    "mData": "ph",
                    "sDefaultContent": ""
                }, //9
                {
                    "mData": "trans",
                    "sDefaultContent": ""
                }, //10
                {
                    "mData": "sampledepth",
                    "sDefaultContent": ""
                }, //11
                {
                    "mData": "totaldepth",
                    "sDefaultContent": ""
                }, //12
                {
                    "mData": "sgravity",
                    "sDefaultContent": ""
                }, //13
                {
                    "mData": "spgrtemp",
                    "sDefaultContent": ""
                }, //14
                {
                    "mData": "salinity",
                    "sDefaultContent": ""
                }, //15
                {
                    "mData": "flow",
                    "sDefaultContent": ""
                }, //16
                {
                    "mData": "algae",
                    "sDefaultContent": ""
                }, //17
                {
                    "mData": "color",
                    "sDefaultContent": ""
                }, //18
                {
                    "mData": "clarity",
                    "sDefaultContent": ""
                }, //19
                {
                    "mData": "surface",
                    "sDefaultContent": ""
                }, //20
                {
                    "mData": "conditions",
                    "sDefaultContent": ""
                }, //21
                {
                    "mData": "odor",
                    "sDefaultContent": ""
                }, //22
                {
                    "mData": "weather",
                    "sDefaultContent": ""
                }, //23
                {
                    "mData": "lastprecip",
                    "sDefaultContent": ""
                }, //24
                {
                    "mData": "rain3d",
                    "sDefaultContent": ""
                }, //25
                {
                    "mData": "reagent",
                    "sDefaultContent": ""
                }, //26
                {
                    "mData": "enterococcus",
                    "sDefaultContent": " "
                }, //27
                {
                    "mData": "tide",
                    "sDefaultContent": ""
                }, //28
                {
                    "mData": "comments",
                    "sDefaultContent": ""
                } //29
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
                "targets": [1],
                "visible": false
            }, {
                "targets": [3],
                "visible": false
            }, {
                "targets": [4],
                "visible": false
            }, {
                "targets": [5],
                "visible": false
            }, {
                "targets": [10],
                "visible": false
            }, {
                "targets": [11],
                "visible": false
            }, {
                "targets": [12],
                "visible": false
            }, {
                "targets": [13],
                "visible": false
            }, {
                "targets": [14],
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
            }, {
                "targets": [21],
                "visible": false
            }, {
                "targets": [22],
                "visible": false
            }, {
                "targets": [23],
                "visible": false
            }, {
                "targets": [24],
                "visible": false
            }, {
                "targets": [25],
                "visible": false
            }, {
                "targets": [26],
                "visible": false
            }, {
                "targets": [28],
                "visible": false
            }, {
                "targets": [29],
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
            enterocChart.filterAll();
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
    center: [29.35, -95.25],
    zoom: 9,
    layers: [cartodb_light, clusterLayer]
});
L.control.layers(baseMaps, overlays).addTo(map);
map._layersMinZoom = 8;

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
        if (d.geometry.coordinates[1] !== null && d.geometry.coordinates[1] !== 'undefined' && d.geometry.coordinates[1] !== "") {
            // add a Leaflet marker for the lat lng and insert the application's stated bacteria in popup
            d.ll = L.latLng(d.geometry.coordinates[1], d.geometry.coordinates[0]);

            //convert numbers to meaningful description
            switch (isNaN(d.flow) || parseInt(d.flow)) {
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

            switch (isNaN(d.algae) || parseInt(d.algae)) {
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

            switch (isNaN(d.color) || parseInt(d.color)) {
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

            switch (isNaN(d.clarity) || parseInt(d.clarity)) {
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

            switch (isNaN(d.surface) || parseInt(d.surface)) {
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

            switch (isNaN(d.conditions) || parseInt(d.conditions)) {
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

            switch (isNaN(d.odor) || parseInt(d.odor)) {
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

            switch (isNaN(d.weather) || parseInt(d.weather)) {
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

            switch (isNaN(d.tide) || parseInt(d.tide)) {
                case true:
                    tide = "Not measured";
                    break;
                case 1:
                    tide = "Low";
                    break;
                case 2:
                    tide = "falling";
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

            content = "<b>" + d.properties.Date_Time + "</b>&nbsp;&nbsp;Monitor ID: " + d.properties.Monitor_ID + ", " +
                //d.properties.Name + "<br />" +
                "TST Site ID: " + d.properties.Site_ID + "&nbsp;&nbsp; Site: " + d.properties.Site_Description + "&nbsp;&nbsp;&nbsp;<a href='#' onclick='createGBFChart(" + d.properties.Site_ID + ");' class='siteSummary'>Site Summary</a>" + "<br />" +
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
                "<tr><td>Sample Depth (m)</td><td>" + d.properties.Sample_Depth_m + "</td></tr>" +
                "<tr><td>Transparency (m)</td><td>" + d.properties.Transparency_m + "</td></tr>" +
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
                "<div role='tabpanel' class='tab-pane' id='gbf_four'>Days since last precip: " + d.properties.Days_Since_Precip + "<br />Rainfall Accumulation last 3 days (inches): " + d.properties.Rain_Accum + "<br />" +
                "<table class='table table-striped' id='gbf_wq2'>" +
                "<tr><td>Weather</td><td>" + weather + "</td></tr>" +
                "<tr><td>Tide</td><td>" + tide + "</td></tr>" +
                "</table></div>" +
                "</div>";

            var mark = L.marker([d.geometry.coordinates[1], d.geometry.coordinates[0]],{
                icon: tintGreenMarker
            }).bindPopup(content, {
                minWidth: 350
            });

            markersLayer.addLayer(mark);
            clusterLayer.addLayer(mark);
        }
    });
}

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

    var filtered = $(gbfChart).filter(function(i, n) {
        return n.siteid === siteid;
    });
    var pageTitle = "Site: " + filtered[0].sitedesc;
    //console.log(filtered);
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
        isNaN(filtered[i].airtemp) ? {} : arrayAirTemp.push([local_date, filtered[i].airtemp]);
        isNaN(filtered[i].wtemp) ? {} : arrayWTemp.push([local_date, filtered[i].wtemp]);
        isNaN(filtered[i].avgdo) ? {} : arrayAvgDO.push([local_date, filtered[i].avgdo]);
        isNaN(filtered[i].avgph) ? {} : arrayPH.push([local_date, filtered[i].avgph]);
        isNaN(filtered[i].salinity) ? {} : arraySalinity.push([local_date, filtered[i].salinity]);
        isNaN(filtered[i].enteroc) ? {} : arrayEnteroC.push([local_date, filtered[i].enteroc]);
    }

    //console.log(arrayAirTemp);

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
                valueSuffix: 'mg/L'
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

//Modal
$("#siteInfoModal").on('shown.bs.modal');
$('modal-body').scrollspy({ target: '.help_container' });
