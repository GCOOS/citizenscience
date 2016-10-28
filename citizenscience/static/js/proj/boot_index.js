/*
  data layers settings
  synchoronized list and search tool
*/

//Data location
dataOne = 'gbf_db/data';
dataTwo = 'nacd_db/data';

// ================================================================
/* Navigator and Side bar */
// ================================================================
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

// ====================================================
// Main loader
// ====================================================
d3.queue()
  .defer(d3.json, dataOne)
  .defer(d3.json, dataTwo)
  .await(function (error, gbfData, nacdData) {
    GBF.addData(gbfData); //GBF from boot_gbf.js
    map.addLayer(gbfLayer);
    NACD.addData(nacdData); //NACD from boot_nacd.js
    map.addLayer(nacdLayer);

    sizeLayerControl();

    // Typeahead Search Form
    //------------------------------
    $("#searchbox").val(""); // clear input form first

    var gbfBH = new Bloodhound({
      name: "GBF",
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('sitedesc'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: gbfSearch,
      identify: function(obj) { return obj.sitedesc; },
      limit: 10
    });
    gbfBH.initialize();

    var nacdBH = new Bloodhound({
      name: "NACD",
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('site'),
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      local: nacdSearch,
      identify: function(obj) { return obj.site; },
      limit: 10
    });
    nacdBH.initialize();

    $("#searchbox").typeahead({
      minLength: 2,
      highlight: true
    }, {
      name: "GBF",
      source: gbfBH,
      templates: {
        header: '<h4 class="typeahead-header"><img src="static/images/map_green.png" width="22" height="22">&nbsp;Galveston Bay Foundation</h4>',
        suggestion: Handlebars.compile('<div>{{sitedesc}}</div>')
      }
    }, {
      name: "NACD",
      source: nacdBH,
      templates: {
        header: "<h4 class='typeahead-header'><img src='static/images/map_pink.png' width='22' height='22'>&nbsp;Nature's Academy</h4>",
        suggestion: Handlebars.compile('<div>{{site}}</div>')
      }
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
// List in Side Panel
// ================================================================
function syncSidebar() {
  // Loop through gbf layer and add only features which are in the map bounds
  GBF.eachLayer(function (layer) {
    if (map.hasLayer(gbfLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list-sidebar tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="18" height="18" src="static/images/map_green.png"></td><td><span class="feature-sitedesc"><small>' + layer.feature.properties.Site_Description + '</small></span><br /><small><span class="feature-date">' + moment(layer.feature.properties.Date_Time, 'MM/DD/YYYY h:mm:ss').format('M/D/YYYY h:mm a') + '</small></span></td><td style="vertical-align: middle;"><i class="fa fa-chevron-right pull-right"></i></td></tr>');
      }
    }
  });
  NACD.eachLayer(function (layer) {
    if (map.hasLayer(nacdLayer)) {
      if (map.getBounds().contains(layer.getLatLng())) {
        $("#feature-list-sidebar tbody").append('<tr class="feature-row" id="' + L.stamp(layer) + '" lat="' + layer.getLatLng().lat + '" lng="' + layer.getLatLng().lng + '"><td style="vertical-align: middle;"><img width="18" height="18" src="static/images/map_pink.png"></td><td><span class="feature-sitedesc"><small>' + layer.feature.properties.Site + '</small></span><br /><small><span class="feature-date">' + moment(new Date(layer.feature.properties.Date_Time).toISOString()).format("M/D/YYYY h:mm a") + "</small></span></td><td style='vertical-align: middle;'><i class='fa fa-chevron-right pull-right'></i></td></tr>");
      }
    }
  });
  /* Update list.js featureList */
  var featureList = new List("features-list", {
    valueNames: ["feature-sitedesc","feature-date"]
  });
  featureList.sort("feature-date", {
    order: "desc"
  });
}

// ================================================================
// click a row to zoom in
// ================================================================
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
// Grouping each data and show as clustering icon
// Synchronize with list in a side bar
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
// Leaflet patch to make layer control scrollable on touch browsers
// ================================================================
/*
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
*/
