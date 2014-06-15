// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require jquery_ujs
//= require underscore
//= require moment
//= require turbolinks
//= require leaflet


$(document).ready(function() {
  var stations = {};

  function calculateColor(val) {
    val = parseInt(val, 10);
    if (val < 3) {
      return "rgba(255, 81, 81, 0.7)";
    } else if (val < 6) {
      return "rgba(255, 238, 81, 0.7)";
    } else if (val < 9) {
      return "rgba(209, 255, 81, 0.7)";
    } else {
      return "rgba(100, 255, 81, 0.7)";
    }
  }

  map = L.map('map').setView([42.349624, -71.083603], 13);
  L.tileLayer('http://{s}.tiles.mapbox.com/v3/willpots.ih11j74m/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 12,
    maxBounds: L.latLngBounds(L.latLng(42.257841,-71.268311),L.latLng(42.447465,-70.923615))
  }).addTo(map);

  $.getJSON("/data/capacity.json", {}, function(result) {

    // Check if station exists in our global station object
    var lastUpdate = new Date(parseInt(result.stations.lastUpdate,10));
    $(".lastUpdate").html("Last Updated " + moment(lastUpdate).fromNow());
    _.each(result.stations.station, function(c) {
      if (!(c.id in stations)) {
        stations[c.id] = L.circleMarker([parseFloat(c.lat, 10), parseFloat(c.long, 10)], {
          stroke: false,
          opacity: 0,
          fillColor: calculateColor(c.nbBikes),
          fillOpacity: 1
        }).bindPopup(c.name).on('mouseover', function(e) {
          //open popup;
          this.openPopup();
        }).addTo(map);
      } else {

      }
    });
  });

});