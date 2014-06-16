// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require jquery_ujs
//= require underscore
//= require bootstrap
//= require moment
//= require turbolinks
//= require leaflet

var IM = IM || {};

IM.HubwayStation = function(object) {
  this._props = object;

};
IM.HubwayStation.prototype.switchColor = function(type) {
  
};

$(document).ready(function() {
  var stations = {};
  var colors = ['rgb(255,247,251)','rgb(236,231,242)','rgb(208,209,230)','rgb(166,189,219)','rgb(116,169,207)','rgb(54,144,192)','rgb(5,112,176)','rgb(4,90,141)','rgb(2,56,88)'];
  $('.btn').button();
  $(".btn").click(function() {
    var action = $(this).children("input").attr("id");
    if(action == "open_bikes") {
      setColor(stations, "bikes");
    } else if(action == "open_docks") {
      setColor(stations, "docks");
    }
  });


  function calculateColor(val) {
    val = parseInt(val, 10);
    if (val >= 8) {
      val = 7;
    }
    return colors[val];
  }

  function generateColorLegend(colors) {
    _.each(colors, function(c, i) {
      $("#legend table").append("<tr><td class='text'>" + i + "</td><td><span class='sample' style='background:" + c + "'></span></td></tr>");
    });
  }

  function setColor(stations, type) {
    _.each(stations, function(s) {
      var value;
      if (type == "bikes") {
        value = s.bikes;
      } else {
        value = s.docks;
      }
      s.marker.setStyle({
        fillColor: calculateColor(value)
      });
    });
  }

  generateColorLegend(colors);
  map = L.map('map').setView([42.349624, -71.083603], 13).on("zoomend", function(e) {
    var zoom = this.getZoom();
    var markerSize = 5 + (zoom - 12) * 2;
    _.each(stations, function(s) {
      s.marker.setRadius(markerSize);
    });
  });
  L.tileLayer('http://{s}.tiles.mapbox.com/v3/willpots.ih11j74m/{z}/{x}/{y}.png', {
    attribution: 'Map by <a href="http://twitter.com/willpots">@willpots</a>. Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 12,
    maxBounds: L.latLngBounds(L.latLng(42.257841, -71.268311), L.latLng(42.447465, -70.923615))
  }).addTo(map);
  $.getJSON("/data/hubway/capacity.json", {}, function(result) {

    // Check if station exists in our global station object
    var lastUpdate = new Date(parseInt(result.stations.lastUpdate, 10));
    $(".lastUpdate").html("Last Updated " + moment(lastUpdate).fromNow());
    _.each(result.stations.station, function(c) {
      if (!(c.id in stations)) {
        stations[c.id] = {
          marker: L.circleMarker([parseFloat(c.lat, 10), parseFloat(c.long, 10)], {
            stroke: true,
            color: "#333",
            opacity: 0.8,
            fillOpacity: 1,
            radius: 8
          }).bindPopup(c.name).on('mouseover', function(e) {
            //open popup;
            this.openPopup();
          }).addTo(map),
          name: c.name,
          bikes: parseInt(c.nbBikes, 10),
          docks: parseInt(c.nbEmptyDocks, 10)
        };
        setColor(stations, "bikes");
      } else {

      }
    });
  });

});