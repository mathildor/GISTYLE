
var map;
var cartoActiveLayers;
var sublayers=[];

function initMap(){
    map = new L.Map('cartodb-map', {
        center: [63.43, 10.39],
        zoom: 14,
        zoomControl: true
    });
    map.zoomControl.setPosition('bottomright');


    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);


    cartoActiveLayers={
        user_name: 'mathildeo',
        type: 'cartodb',
        sublayers: [{
            sql: "SELECT * FROM rivers",
            cartocss: '#rivers {line-color: blue; line-width: 3}'
        },{

            sql: "SELECT * FROM buildings",
            cartocss: '#buildings {polygon-fill: #FF6600;}'
        }]
    };

    cartodb.createLayer(map, cartoActiveLayers)
        .addTo(map)
        .done(function(layer) {
            // do stuff
            console.log("Layer has " + layer.getSubLayerCount() + " layer(s).");
            for (var i = 0; i < layer.getSubLayerCount(); i++) {
                sublayers[i] = layer.getSubLayer(i);
                console.log("Congrats, you added sublayer #" + i + "!");
            }
        })
        .error(function(err) {
            // report error
            console.log("An error occurred: " + err);
        });


    //sublayers[0].hide();

    //BUFFER !!!!
    /*
    cartodb.createLayer(map, {
            user_name: 'mathildeo',
            type: 'cartodb',
            sublayers: [{
                sql: "SELECT ST_Transform(ST_Buffer(the_geom::geography,100)::geometry, 3857) As the_geom_webmercator, cartodb_id FROM rivers",
                cartocss: '#rivers {' +
                'line-color: #FFF;' +
                'polygon-fill:  #5CA2D1;' +
                'polygon-opacity: 0.8;' +
                'line-opacity: 1;' +
                'line-width: 0.5;}'
            }]
        })
        .addTo(map)
        .on('done', function(layer) {
            //do stuff
            map.addLayer(layer);
        });
     */
}


function onMapClick(e){
    var lat= e.latitude;
    var long= e.longitude;
}

var activeLayers=["rivers", "buildings"];


function handleLayers(){

    var layerName=event.currentTarget.className;
    var layerId=event.currentTarget.id;
    console.log(layerId);

    if($.inArray(layerName, activeLayers)!==-1){ //if layer is active
        activeLayers.splice($.inArray(layerName, activeLayers),1); //remove from list
        sublayers[layerId].hide();

    }else {
        activeLayers.push(layerName); //add to active list
        sublayers[layerId].show();
    }
}


 //   map.on('click', onMapClick)


