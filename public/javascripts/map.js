
var map;

function init(){
    // initiate leaflet map
    map = new L.Map('cartodb-map', {
        center: [0,0],
        zoom: 2
    });

    var layerUrl = 'http://documentation.cartodb.com/api/v2/viz/836e37ca-085a-11e4-8834-0edbca4b5057/viz.json';

    cartodb.createLayer(map, layerUrl)
        .addTo(map)
        .on('done', function(layer) {

        }).on('error', function() {
        //log the error
    });
}