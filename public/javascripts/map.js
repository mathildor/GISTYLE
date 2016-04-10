
var map;
var cartoActiveLayers;
var sublayers=[];
var activeBufferLayer;
var activeIntersectionLayers=[];
var bufferColor;
var bufferDistance;
var activeLayers=["Rivers", "Buildings", "Schools", "Water", "Railway"];

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
            cartocss: '#rivers {line-color: blue; line-width: 3; line-opacity: 0.4;}'
        },{

            sql: "SELECT * FROM buildings",
            cartocss: '#buildings {polygon-fill: #FF6600; polygon-opacity: 0.4;}'
        },{
            sql: "SELECT * FROM schools",
            cartocss: '#buildings {polygon-fill: green; polygon-opacity: 0.4;}'
        },{
            sql: "SELECT * FROM water",
            cartocss: '#buildings {polygon-fill: blue; polygon-opacity: 0.4;}'
        },{
            sql: "SELECT * FROM railway",
            cartocss: '#buildings {line-color: green; line-opacity: 0.4; }'
        }
        ]
    };

    getLayersFromDb();

    console.log(cartoActiveLayers);

    //BUFFER !!!!
    /*
    cartodb.createLayer(map, {
            user_name: 'mathildeo',
            typ e: 'cartodb',
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

function getLayersFromDb(){

    $.ajax({
        url:"layers",
        dataType: "json",
        data:{},
        success: "success"

    }).complete(function(data){
        //Add layer to cartoActiveLayers
        //OBS! probably a list of layers when correct

        var layers=JSON.parse(data.responseText);
        //go through all layers and add them:
        for(var i=0; i<layers.length;i++){

            var sqlString=layers[i].sqlString.toString();
            var cartoString=layers[i].cartoCss.toString();
            var layername=layers[i].layername.toString();
            console.log(sqlString);
            console.log(cartoString);
            var sublayer={
                sql: sqlString,
                cartocss: cartoString
            };
            console.log(sublayer);
            cartoActiveLayers.sublayers.push(sublayer);
            addToLayerList(layername);
            sublayers.push(layername);
        }
        updateMap();
    });
}


function updateMap(){
    cartodb.createLayer(map, cartoActiveLayers)
        .addTo(map)
        .done(function(layer) {
            // do stuff
            for (var i = 0; i < layer.getSubLayerCount(); i++) {
                sublayers[i] = layer.getSubLayer(i);
            }
        })
        .error(function(err) {
            // report error
            console.log("An error occurred: " + err);
        });
}

//checkbox action, activate and remove layers from map
function handleLayers(){

    var layerName=event.currentTarget.className;
    var layerId=event.currentTarget.id;
    console.log(layerId);
    console.log(activeLayers);


    if($.inArray(layerName, activeLayers)!==-1){ //if layer is active
        console.log('layer is active - should be hidden');
        activeLayers.splice($.inArray(layerName, activeLayers),1); //remove from list
        sublayers[layerId].hide();

    }else {
        activeLayers.push(layerName); //add to active list
        sublayers[layerId].show();
    }
}


//layerlist in main menu
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

    var id=sublayers.length;
    checkbox.id=id;
    checkbox.type="checkbox";

    var trash=document.createElement("img");
    trash.className=" trashLayer";
    trash.src="../images/trash.png";
    trash.addEventListener("click", function(){
        deleteLayer(newLayer, id);
    });
    var list=document.getElementById("menuLayerDropdown");
    var li=document.createElement('li');
    li.id=newLayer+"Li";
    li.appendChild(link);
    li.appendChild(checkbox);
    li.appendChild(trash);
    list.appendChild(li);
}

function deleteLayer(layerName, layerId){
    console.log(activeLayers);
    var layer = document.getElementById(layerName+"Li");
    while (layer.firstChild) {
        layer.removeChild(layer.firstChild);
    }
    layer.remove();

    //Remove from list activeLayers
    activeLayers.splice($.inArray(layer, activeLayers),1); //remove from list
    sublayers[layerId].hide();
    //remove sublayer from map - for know just hide, but better to actually delete

    console.log(activeLayers);

    $.ajax({
        url: "deleteLayer",
        type: 'DELETE',
        data: {"layername": layerName},
        success: console.log("delete success"),
        error: console.log("delete error")
    });
}

//----------------VIEW DATA------------------------

//Create a table to view the data, so user can do a select?
//Write sql after looking at table? Or choose rows, push create layer and automated sql gets written?



//---------------------------- COMMON DIALOG FUNCTIONS----------------------------

function createLayerDropdown(div){
    //var div=document.getElementById("layerDropdown-content");
    console.log(div);
    //delete previously made list first
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    for(var i=0; i<activeLayers.length; i++){
        var li= document.createElement("li");
        var link=document.createElement("a");
        link.className="contentLayer";
        link.id=activeLayers[i];
        var txt=document.createTextNode(activeLayers[i]);
        link.appendChild(txt);
        li.appendChild(link);
        div.appendChild(li);
    }
}

function popupClose(target){
    console.log(target);
    $("#overlay").hide();
    $(".dialog").hide();
    toggleClose(event.target, target); //closing layer menu if open
}


function toggle(target){
    //var menu=document.getElementById("dropdown-toggle");
    console.log(target);
    var menu=event.target;
    //var target=menu.nextSibling;
    console.log(target);
    //var jTarget=$(target);
    if(menu.getAttribute('value')==="close"){
        target.show();
        menu.setAttribute('value', 'open');
    }else{
        target.hide();
        menu.setAttribute('value', 'close');
    }
}

//close and reset value for layer-content dropdown
function toggleClose(menu, target){
    target.hide();
    menu.setAttribute('value', 'close');
}


//----------------------------INTERSECTION----------------------------


function intersection(){
    var target=document.getElementById('chosenIntersection');
    resetIntersectionValues(target);

    var content=document.getElementById("layerDropdown-content-intersection");
    createLayerDropdown(content);
    $("#overlay").show();
    $("#intersectionPopUp").show();

    $(".contentLayer").click(function(){

        addActiveLayer(event.target);
        var chosenLayer=target;
        chosenLayer.innerHTML=activeIntersectionLayers[activeIntersectionLayers.length-1];
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-intersection'));
    });
}

function createIntersection(){

    var intLayerName=$('#intersectionLayerName').val();
    var intColor=$("#intersectionColor").val();

    //check if everything is filled out
    if(activeIntersectionLayers.length>0 && intColor && intLayerName){
        var sublayer=createIntSql(activeIntersectionLayers, intColor);
        cartoActiveLayers.sublayers.push(sublayer);
        updateMap();
        popupClose($('#layerDropdown-content-buffer'));
        addToLayerList(intLayerName);
    }else{
        alert('Fill out all fields first');
    }

    //when created, empty fields:
    activeIntersectionLayers=[];
    intColor=null;
    intLayerName=null;
}

function createIntSql(layers, color){

}

//add to list over "chosen layers" to make sql from
function addActiveLayer(element){

    //check if already active
    if($.inArray(element.id, activeIntersectionLayers)!==-1){ //if layer is active
        alert('Layer is already chosen! Choose another instead'); //Change this so that layer instead is removed from list to choose from
        activeIntersectionLayers.splice($.inArray(element.id, activeIntersectionLayers),1); //remove from list

    }else {
        activeIntersectionLayers.push(element.id); //add to active list
        var li=document.createElement('li');
        li.className="li-layer";

        var name=document.createElement('h2');
        name.className="chosenLayer";
        name.innerHTML=element.id;

        var trashLink= document.createElement('a');
        trashLink.className="trash";
        trashLink.addEventListener("click", function(){
            removeActiveLayer()
        });
        var trashImg= document.createElement('img');
        trashImg.src="../../images/trash-black.png";
        trashLink.appendChild(trashImg);

        li.appendChild(name);
        li.appendChild(trashLink);

        document.getElementById('chosenLayersIntersection').appendChild(li);
    }
}

//remove layer from "chosen layers" list - trashcan event
function removeActiveLayer(){
    console.log(event.target.parentElement);
    var li=event.target.parentElement.parentElement;
    var layerName=li.firstChild;
    activeIntersectionLayers.splice($.inArray(layerName, activeIntersectionLayers),1); //remove from list

    while (li.firstChild) {
        li.removeChild(li.firstChild);
    }
    li.remove();
}

function resetIntersectionValues(target){
    console.log(target);
    $('#intersectionLayerName').val("");
    target.innerHTML=("Choose layer from list");

    //var choosenLayer=document.getElementById('dropdown-toggle');
    target.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);

    $("#intersectionColor").val("#243CEE");
}

//----------------------------BUFFER-----------------------------------
//action when buffer button click
function buffer(){
    var target=document.getElementById('chosenBuffer');
    resetBufferValues(target); //target is the buffer layer last chosen that needs to be reset

    var content=document.getElementById("layerDropdown-content-buffer");
    createLayerDropdown(content);
    $("#overlay").show();
    $("#bufferPopUp").show();

    $(".contentLayer").click(function(){
        activeBufferLayer=event.currentTarget.id;
        var chosenLayer=target;
        chosenLayer.innerHTML=activeBufferLayer;
        chosenLayer.className="chosenLayer";
        //Remove chosen layer when resetting values!
        toggleClose(event.target,$('#layerDropdown-content-buffer'));
    });
}

function createBuffer(){
    console.log('activeLayers, create buffer start: '+activeLayers);

    bufferDistance=$('#bufferDistance').val();
    bufferColor=$("#bufferColor").val();

    //check if everything is filled out
    if(activeBufferLayer && bufferColor && bufferDistance){
        console.log('activeBufferLayer: '+activeBufferLayer);
        var sublayer=createBufferSql(activeBufferLayer, bufferColor, bufferDistance);
        cartoActiveLayers.sublayers.push(sublayer);
        updateMap();
        popupClose($('#layerDropdown-content-buffer'));
        addToLayerList(activeBufferLayer+'_buffer_'+bufferDistance);

    }else{
        alert('Fill out all fields first');
    }

    //when created, empty fields:
    activeBufferLayer=null;
    bufferColor=null;
    bufferDistance=null;
    console.log('activeLayers when create buffer finished: '+activeLayers);
}

//Creates sql and calls post request to database
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

    //call post request to save layer to database:

    var layerNameString=layer+'_buffer_'+distance;
    $.post("/layer",
        {
            "layername": layerNameString, //makes up the new layer name
            "sql": sqlString,
            "carto":cartoString
        }
    ).complete(function(){
        console.log("completed");
    });

    return sublayer;
}

function resetBufferValues(target){
    console.log(target);
    $('#bufferDistance').val("");
    //$("#dropdown-toggle").html("Choose layer from list");
    target.innerHTML=("Choose layer from list");

    //var choosenLayer=document.getElementById('dropdown-toggle');
    target.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    //$("#dropdown-toggle").append(arrow);
    target.appendChild(arrow);

    $("#bufferColor").val("#243CEE");
}
