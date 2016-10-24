function hide_flask_message_container() {
    $('#flash_message_container').slideUp('fast');
}

var app = {};
var map, chart, featureList;

// ================================================================
/* For Social Apps */
// ================================================================
//TODO (1) Edit this settings
app.author = "Shin Kobara, GCOOS";
app.copyright = "GCOOS";
app.title = "Citizen Science for the Gulf of Mexico";
app.html = "http://products.gcoos.org/citizenscience";
app.desc = "Citizen Science Projects in the Gulf of Mexico";

// loading gif
function startLoading() {
  map.spin(true);
}
function finishedLoading() {
  setTimeout(function(){
    map.spin(false);
  }, 1000);
}

// ================================================================
// Top Nav Bar
// Common navigator buttons and fuctions
// ================================================================
$("#nav-btn").click(function() {
  $(".navbar-collapse").collapse("toggle");
  return false;
});
$("#about-btn").click(function() {
  $("#aboutModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
$("#help-btn").click(function(){
  $("#helpModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});
