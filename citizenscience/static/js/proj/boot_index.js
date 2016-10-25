//TODO
//Data location
dataOne = 'gbf_db/data';
dataTwo = 'nacd_db/data';

var featureList;

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

// ====================================================
// Main loader
// ====================================================
d3.queue()
  .defer(d3.json, dataOne)
  .defer(d3.json, dataTwo)
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
      featureList = new List("features", {
        valueNames: ["feature-sitedesc","feature-siteid","feature-date"]
      });
      featureList.sort("feature-date", {order:"desc"});

      //console.log(gbfSearch);
      // Search Form
      //------------------------------
      var gbfBH = new Bloodhound({
        name: "GBF",
        datumTokenizer: function (d) {
          return Bloodhound.tokenizers.whitespace(d.sitedesc);
        },
        queryTokenizer: function (d) {
          Bloodhound.tokenizers.whitespace(d.sitedesc);
        },
        local: gbfSearch,
        identify: function (obj) {
          return obj.sitedesc
        },
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
        displayKey: "sitedesc",
        source: gbfBH,
        templates: {
          header: "<h4 class='typeahead-header'><img src='static/images/map_green.png' width='22' height='22'>&nbsp;Galveston B. F.</h4>",
          suggestion: Handlebars.compile("{{sitedesc}}" + "<br/>&nbsp;<small>" + "{{date}}" + "</small>")
        }
      }, {
        name: "NACD",
        displayKey: "site",
        source: nacdBH.ttAdapter(),
        templates: {
          header: "<h4 class='typeahead-header'><img src='static/images/map_pink.png' width='22' height='22'>&nbsp;Nature's A.</h4>",
          suggestion: Handlebars.compile(["{{site}}<br>&nbsp;<small>{{date}}</small>"].join(""))
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
var container = $(".leaflet-control-layers")[0];
if (!L.Browser.touch) {
  L.DomEvent
  .disableClickPropagation(container)
  .disableScrollPropagation(container);
} else {
  L.DomEvent.disableClickPropagation(container);
}
