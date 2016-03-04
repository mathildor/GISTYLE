/**
 * Created by mathilde on 25/02/16.
 */

var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('//api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="://openstreetmap.org">OpenStreetMap</a> contributors, <a href="//creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="//mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoibW9yZ2FuaGVybG9ja2VyIiwiYSI6Ii1zLU4xOWMifQ.FubD68OEerk74AYCLduMZQ'
}).addTo(map);

var circle = L.circle([51.508, -0.11], 500, {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(map);

var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(map);


//Add popups the the different layers, example buffer with desctiption? i.e Buffer, 30m
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}

map.on('click', onMapClick);




//ADDING geoJSON TO THE MAP:

//L.geoJson(geojsonFeature).addTo(map);
