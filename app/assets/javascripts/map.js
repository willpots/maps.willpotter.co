// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
//= require jquery
//= require jquery_ujs
//= require underscore
//= require bootstrap
//= require moment
//= require turbolinks
//= require leaflet


$(document).ready(function() {
  var data = {
    hubwayStations: null,
    mbtaStations: null,
    mbtaLines: null
  };
  var mbtaStationMarkers = {};
  var keys = ["mbtaLines", "mbtaStations", "hubwayStations"];
  var colors = ['rgb(255,247,251)', 'rgb(236,231,242)', 'rgb(208,209,230)', 'rgb(166,189,219)', 'rgb(116,169,207)', 'rgb(54,144,192)', 'rgb(5,112,176)', 'rgb(4,90,141)', 'rgb(2,56,88)'];
  $('.btn').button();
  $(".btn").click(function() {
    var action = $(this).children("input").attr("id");
    if (action == "open_bikes") {
      setColor(data.hubwayStations, "bikes");
      $(".type").html("Bikes");
    } else if (action == "open_docks") {
      setColor(data.hubwayStations, "docks");
      $(".type").html("Docks");
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
    stations.eachLayer(function(station) {
      var value;
      if (type == "bikes") {
        value = station.data.bikes;
      } else {
        value = station.data.docks;
      }
      station.setStyle({
        fillColor: calculateColor(value)
      });
    });
  }
  function ensureData() {
    var ret = true;
    _.each(data, function(d) {
      if(d === null) {
        ret = false;
      }
    });
    if(ret === true) {
      _.each(keys, function(k) {
        data[k].addTo(map);
      });
    }
  }
  generateColorLegend(colors);

  map = L.map('map').setView([42.349624, -71.083603], 13);
  L.tileLayer('https://api.tiles.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoid2lsbHBvdHMiLCJhIjoiSTJYS0RCNCJ9.jPqwSxzqRHyjLAUoFS3vgQ', {
    attribution: 'Map by <a href="http://twitter.com/willpots">@willpots</a>. Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    minZoom: 12,
    maxBounds: L.latLngBounds(L.latLng(42.257841, -71.268311), L.latLng(42.447465, -70.923615))
  }).addTo(map);

  $.getJSON("/data/hubway/capacity.json", {}, function(result) {
    // Check if station exists in our global station object
    var stations = L.layerGroup();
    var lastUpdate = new Date(parseInt(result.stations.lastUpdate, 10));
    $(".lastUpdate").html("Last Updated " + moment(lastUpdate).fromNow());
    _.each(result.stations.station, function(c) {
      var marker = L.circleMarker([parseFloat(c.lat, 10), parseFloat(c.long, 10)], {
          stroke: true,
          color: "#333",
          opacity: 0.8,
          fillOpacity: 1,
          radius: 6
        })
        .bindPopup(c.name + "<br>" + c.nbBikes + " bikes<br>" + c.nbEmptyDocks + " docks");
      marker.data = {
               name: c.name,
        bikes: parseInt(c.nbBikes, 10),
        docks: parseInt(c.nbEmptyDocks, 10)
      };
      stations.addLayer(marker);

      data.hubwayStations = stations;
      map.on("zoomend", function(e) {
        var zoom = this.getZoom();
        var markerSize = Math.round(6 + (zoom - 12) * 1.5);
        data.hubwayStations.eachLayer(function(s) {
          s.setRadius(markerSize);
        });
      });
      ensureData();
      setColor(stations, "bikes");
    });
  });
  $.getJSON("/geodata/mbta_lines.geojson", {}, function(result) {
    mbtaLines = L.geoJson(result.features, {
      style: function(feature) {
        return {
          color: pickColor(feature.properties.LINE),
          opacity: 1,
          weight: 3
        };
      }
    });
    data.mbtaLines = mbtaLines;
    ensureData();
  });
  $.getJSON("/geodata/mbta_stations.geojson", {}, function(result) {
    var geojsonMarkerOptions = {
      radius: 5,
      width:2,
      fillColor: "#ff0000",
      color: "#ff0000",
      weight: 1,
      opacity: 1,
      fillOpacity: 1
    };
    mbtaStations = L.geoJson(result.features, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions);
      },
      style: function(feature) {
        return {
          color: pickColor(feature.properties.LINE),
          opacity: 1,
          weight: 2,
          fillColor: "white",
          fillOpacity: 1
        };
      }
    });
    data.mbtaStations = mbtaStations;
    mbtaStations.eachLayer(function(station) {
      var props = station.feature.properties;
      mbtaStationMarkers[props.STATION] = station;
    });
    map.on("zoomend", function(e) {
      var zoom = this.getZoom();
      var markerSize = 5 + (zoom - 12) * 1;
      data.mbtaStations.eachLayer(function(s) {
        s.setRadius(markerSize);
      });
    });
    ensureData();
    $.getJSON("/data/mbta/subway_lines.json", function(result) {
      arrivals = {};
      var currentTime = "";
      _.each(result, function(line) {
        _.each(line, function(r) {
          currentTime = r.CurrentTime;
          _.each(r.Trips, function(t) {
            var destination = t.Destination;
            _.each(t.Predictions, function(p) {
              var stop = p.Stop.trim();
              var marker = mbtaStationMarkers[stop];
              if(marker === undefined) return;
              if(marker.data === undefined) marker.data = {};
              if(marker.data[destination] === undefined) marker.data[destination] = [];
              marker.data[destination].push(p.Seconds);
              marker.data[destination] = marker.data[destination].sort();
            });
          });
        });
      });
      _.each(mbtaStationMarkers, function(marker, station) {
        popup = "<b>"+station+"</b><br>";
        _.each(marker.data, function(v, k) {
          popup += k + " bound train";
          if(v.length > 1) popup += "s";
          popup += " coming in ";
          var ar = v.sort();
          _.each(ar, function(time, i) {
            popup += formatMinutes(time);
            if(i != ar.length - 1) popup += ", ";
          });
          popup += " minutes<br>";
        });
        marker.bindPopup(popup);
      });
    });
  });
  function formatMinutes(seconds) {
    var minutes = Math.floor(seconds / 60);
    minutes += Math.round((seconds - (minutes * 60)) / 60);
    if(minutes === 0) return "now";
    return minutes;
  }
  function pickColor(line) {
    line = line.toLowerCase();
    if (line.indexOf("red") != -1) {
      return "rgba(239, 39, 39, 1)";
    } else if (line.indexOf("orange") != -1) {
      return "rgba(255, 153, 0, 1)";
    } else if (line.indexOf("blue") != -1) {
      return "rgba(25, 34, 221, 1)";
    } else if (line.indexOf("green") != -1) {
      return "rgba(0, 123, 14, 1)";
    } else if (line.indexOf("silver") != -1) {
      return "rgba(123, 123, 123, 1)";
    }
  }
});