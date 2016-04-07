
var map;
var cartoActiveLayers;
var sublayers=[];
var activeBufferLayer;
var bufferColor;
var bufferDistance;
var activeLayers=["rivers", "buildings"];

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



function updateMap(){
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
}

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



function buffer(){
    console.log('buffer method');

    createLayerDropdown();
    $("#overlay").show();
    $("#dialog").show();

    $(".bufferLayer").click(function(){
        activeBufferLayer=event.currentTarget.id;
        document.getElementById('dropdown-toggle').innerHTML=activeBufferLayer;
        toggleClose();
    });


}

function createBuffer(){
    bufferDistance=$('#bufferDistance').val();
    bufferColor=$("#bufferColor").val();
    console.log(bufferDistance);
    console.log(bufferColor);

    //check if everything is filled out
    if(activeBufferLayer && bufferColor && bufferDistance){
        var sublayer=createBufferSql(activeBufferLayer, bufferColor, bufferDistance);
        cartoActiveLayers.sublayers.push(sublayer);
        updateMap();
        popupClose();
        addToLayerList(activeBufferLayer+', buffer '+bufferDistance);

    }else{
        alert('Fill out all fields first');
    }

    //when created, empty fields:
    activeBufferLayer=null;
    bufferColor=null;
    bufferDistance=null;
}

function addToLayerList(newLayer){
    activeLayers.push(newLayer);
    var link=document.createElement('a');
    link.innerHTML=newLayer;
    var checkbox=document.createElement('input');
    checkbox.checked=true;
    checkbox.className=newLayer;
    checkbox.addEventListener("click", function(){
        handleLayers();
    });
    checkbox.id=activeLayers.length-1;
    console.log('id: '+checkbox.id);
    checkbox.type="checkbox";

    var list=document.getElementById("menuLayerDropdown");
    var li=document.createElement('li');
    li.appendChild(link);
    li.appendChild(checkbox);
    list.appendChild(li);

}

function createBufferSql(layer, color, distance){

    var sqlString="SELECT ST_Transform(ST_Buffer(the_geom::geography,"+distance+")::geometry, 3857) As the_geom_webmercator, cartodb_id FROM "+layer;
    var cartoString= '#'+layer+' {' +
        'line-color: #FFF;' +
        'polygon-fill:  '+color+';' +
        'polygon-opacity: 0.8;' +
        'line-opacity: 1;' +
        'line-width: 0.5;}';

    sublayer={
        sql: sqlString,
        cartocss: cartoString
    };
    return sublayer;
}

function popupClose(){
    $("#overlay").hide();
    $("#dialog").hide();
    toggleClose(); //closing layer menu if open

}

function createLayerDropdown(){
    var div=document.getElementById("layerDropdown-content");

    //delete previously made list first
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }


    for(var i=0; i<activeLayers.length; i++){
        var li= document.createElement("li");
        var link=document.createElement("a");
        link.className="bufferLayer";
        link.id=activeLayers[i];
        var txt=document.createTextNode(activeLayers[i]);
        link.appendChild(txt);
        li.appendChild(link);
        div.appendChild(li);
    }
}



function toggle(){
    console.log('dfs');
    var menu=document.getElementById("dropdown-toggle");
    if(menu.getAttribute('value')==="close"){
        console.log('lik');
        $("#layerDropdown-content").show();
        menu.setAttribute('value', 'open');
    }else{
        $("#layerDropdown-content").hide();
        menu.setAttribute('value', 'close');
    }
}

function toggleClose(){
    var menu=document.getElementById("dropdown-toggle");
    $("#layerDropdown-content").hide();
    menu.setAttribute('value', 'close');
}