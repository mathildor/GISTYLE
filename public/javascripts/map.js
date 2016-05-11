
var map;
var leafletLayers=[];

var fillAgain=false; //used to know if popup should be reset or not, if missed some info the already filled out should stay
var activeBufferLayer;

var activeWithinArea;
var activeWithinOutput;

var activeMergeLayer1;
var activeMergeLayer2;

var activeDifference1;
var activeDifference2;

var activeClipInputLayer;
var activeClipClipLayer;
var bufferColor;
var bufferDistance;
var activeLayers=["Rivers", "Buildings", "Schools", "Water", "Railway"]; //used for side menu
var activeStyleLayer;
var activeStyleLayerName;
var projectName;

//method called when project is chosen
//TODO: how set whan page is updated????? Through controller? Or backend project session like user session is set?
function setProjectName(name){
    projectName=name;
}

function initMap(){
    console.log('init map!!!!');
    map = new L.Map('cartodb-map', {
        center: [63.43, 10.39],
        zoom: 14,
        zoomControl: true
    });
    map.zoomControl.setPosition('bottomright');


    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    getLayersFromDB();


}

function getLayersFromDB(){

    leafletLayers=[];

    //get all default layers:
    $.ajax({ //gets all for specific user and project
        url:"defaultGeojsons",
        type:"get",
        dataType: "json",
        data:{}
    }).complete(function(data) {
        var layerStyle;
        var layers=JSON.parse(data.responseText);
        var i;
        for(i=0; i<layers.length;i++) {
            getStyleAndAddToMap(layers[i].layerName, layers[i], true);
            var newLayer={
                name:layers[i].layerName
            }
            addToLayerList(newLayer.name, newLayer);
        }
    });

    //get user and project specific
    $.ajax({ //gets all for specific user and project
        url:"geojsons",
        type:"post",
        dataType: "json",
        data:{
            projectName:projectName
        }
    }).complete(function(data){
        //go through all layers and add them:
        var layerStyle;
        var layers=JSON.parse(data.responseText);
        var i;
        for(i=0; i<layers.length;i++) {
            getStyleAndAddToMap(layers[i].layerName, layers[i], false);
            var newLayer={
                name:layers[i].layerName
            }
            addToLayerList(newLayer.name, newLayer);
        }
    });
}

function getStyleAndAddToMap(layerName, layer, defaultLayer){

    $.ajax({ //gets all for specific user and project
        url:"getStyling",
        type:"post",
        dataType: "json",
        data:{
            projectName: projectName,
            layerName: layerName,
        }
    }).complete(function(data){

        var styling=JSON.parse(data.responseText)[0].layerStyle;
        addLayerToMap(layer, styling, layerName, defaultLayer);
    });
}

function enterProject(projectName){
    leafletLayers=[];
    getLayersFromDB();
}

function addLayerToMap(layer, styling, layerName, defaultLayer){

    console.log('layer: ');
    console.log(layer);
    console.log(styling.color);
    var newLayer;
    if(layer.features[0].geometry.type === "Point"){
        var style = {
            radius: styling.radius,
            fillColor: styling.color,
            color: styling.lineColor,
            weight: styling.weight,
            fillOpacity: styling.opacity
        };

        newLayer=L.geoJson(layer, {
            pointToLayer: function (feature, latlng) {
                return L.circleMarker(latlng, style);
            }
        }).addTo(map);
    }else{
        newLayer=L.geoJson(layer,{
            //style:styling
            style:{
                "fillColor": styling.color,
                "fillOpacity": styling.opacity,
                "weight": styling.weight,
                "color": styling.lineColor //stroke-color
            }
        }).addTo(map);
    }


    //add the layer to leafletLayers list:
    leafletLayers.push({
        name: layerName,
        layer: newLayer,
        geojsonLayer:layer,
        defaultLayer:defaultLayer,
        type: layer.features[0].geometry.type,
        active:true
    });

    return newLayer;
}

function saveLayerStylingToDBAndUpdateView(layerName, projectName, style){

    $.ajax({ //gets all for specific user and project
        url:"layerStyling",
        type:"post",
        dataType: "json",
        data:{
            projectName: projectName,
            layerName:layerName,
            layerStyle:JSON.stringify(style)
        }
    }).complete(function(data){
        var layer;
        var geojsonLayer;
        for(var i=0; i<leafletLayers.length; i++){
            if(leafletLayers[i].name === layerName){
                layer=leafletLayers[i].layer;
                geojsonLayer=leafletLayers[i].geojsonLayer;
            }
        }
        map.removeLayer(layer);
        removeFromLeafletLayerList(layerName);
        addLayerToMap(geojsonLayer, style, layerName);
    });
}

function removeFromLeafletLayerList(layerName){
    for(var i=0; i<leafletLayers.length; i++){
        if(leafletLayers[i].name === layerName){
            leafletLayers.splice(i,1);
        }
    }
}

function saveLeafletLayerToDB(geoLayer, layerName){

    console.log('saveLeafletLayerToDB');
    console.log(geoLayer);
    $.ajax({
        "url": "saveGeojson",
        "type":"post",
        "data":{
            layerName:layerName,
            projectName: projectName,
            defaultLayer: false,
            features: geoLayer
        }
    });
}


function newLayer(){
    $("#uploadPopUp").show();
    $("#overlay").show();
}

function uploadLayer(){
    //get file from user

    $("#uploadPopUp").hide();
    $("#overlay").hide();

    var color=document.getElementById('newLayerColor').value;
    var layerName=document.getElementById('uploaded-layer-name').value;
    var file = document.getElementById('inputFile').files[0];

    console.log(file);

    var reader = new FileReader();
    var text;
    reader.onload = function(e) {
        text = reader.result;
        var layerFeatures = JSON.parse(text).features;
        console.log(layerFeatures.length);
        uploadGeoJson(projectName, layerFeatures, layerName, color);
    }
    reader.readAsText(file);

}
function uploadGeoJson(projectName, layerFeatures, layerName, color){
    console.log(layerFeatures);

    var styling={
        'color': color,
        'weight': 3,
        'opacity':0.6,
        'radius': 5
    };


    $.ajax({ //gets all for specific user and project
        url:"layerStyling",
        type:"post",
        dataType: "json",
        data: {
            layerStyle: JSON.stringify(styling),
            projectName: projectName,
            layerName: layerName,
            defaultLayer: false
        }
    }).complete(function(styleData){

        $.ajax({ //gets all for specific user and project
            url:"saveGeojson",
            type:"post",
            dataType: "json",
            data:{
                features:JSON.stringify(layerFeatures),
                projectName: projectName,
                layerName: layerName,
                defaultLayer: false
            }
        }).complete(function(geolayerData){
            console.log('uploaded geo layer');
            var layer=addLayerToMap(JSON.parse(geolayerData.responseText), styling, layerName, false);
            addToLayerList(layerName, layer);
        });
    });
}

function reorderLayers(){
    console.log('reorder!!!');
    var layersInOrder=[];
    var listOfDomChildren=document.getElementById('menuLayerDropdown').childNodes;
    for(var i = 0; i<listOfDomChildren.length; i++){
        layersInOrder.push(listOfDomChildren[i].childNodes[0].innerHTML);
    }
    console.log(layersInOrder);

    for(var j=layersInOrder.length-1; j>-1; j--){
        console.log(layersInOrder[j]);
        getLeafletLayerFromName(layersInOrder[j]).layer.bringToFront();
    }

}

//----------------------------Main menu methods -------------------------------------

//checkbox action, activate and remove layers from map
function toggleLayerView(){
    var layerName=event.currentTarget.className.split('fa-eye ')[1].split(' ')[0];

    for(var i=0; i<leafletLayers.length;i++){
        if(leafletLayers[i].name === layerName){
            if(leafletLayers[i].active == true){
                event.currentTarget.className="fa fa-eye "+layerName+" inactive";
                map.removeLayer(leafletLayers[i].layer);
                leafletLayers[i].active=false;

            }else{
                event.currentTarget.className="fa fa-eye "+layerName+" active";
                map.addLayer(leafletLayers[i].layer);
                leafletLayers[i].active=true;
            }
        }
    }
}

function getLeafletLayerFromName(layerName){
    console.log(layerName);
    console.log(leafletLayers);
    var layer;
    for(var i=0; i<leafletLayers.length; i++){
        if(leafletLayers[i].name === layerName){
            layer=leafletLayers[i];
        }
    }
    console.log(layer);
    return layer;
}

function removeLayerFromMapView(layerName){

    for(var i=0; i<leafletLayers.length; i++){
        if(leafletLayers[i].name === layerName){
            map.removeLayer(layer);
            leafletLayers[i].active=false;
        }
    }
};

function addLayerToMapView(layerName){
    for(var i=0; i<leafletLayers.length; i++){
        if(leafletLayers[i].name === layerName){
            map.addLayer(layer);
            leafletLayers[i].active=true;
        }
    }
};


//layerlist in main menu
function addToLayerList(newLayer, newSublayer){

    activeLayers.push(newLayer);

    var link=document.createElement('a');
    link.innerHTML=newLayer;

    var checkbox=document.createElement('i');

    checkbox.className="fa fa-eye "+newLayer+" active";
    checkbox.setAttribute("checked","true");
    checkbox.setAttribute('aria-hidden','false');
    checkbox.addEventListener("click", function(){
        toggleLayerView();
    });

    var list=document.getElementById("menuLayerDropdown");
    var li=document.createElement('li');
    li.draggable="true";
    li.id=newLayer+"Li";
    li.appendChild(link);
    li.appendChild(checkbox);

    //enable drag and drop
    var sortable=Sortable.create(list,{
        animation:200,
        onUpdate: function(){
            reorderLayers();
        }
    });

    var edit=document.createElement("img");
    edit.className="editLayer";
    edit.src="../images/edit-white.png";

    if(true){ //just while working to fast delete from database! :)
        //if(!newSublayer.defaultLayer){ //the default layers cannot be deleted

        edit.addEventListener("click", function(){ //call differenet api depending on default layer or not
            changeLayerDesign(newLayer);
        });

        var trash=document.createElement("img");
        trash.className=" trashLayer";
        trash.src="../images/trash.png";
        trash.addEventListener("click", function(){
            deleteLayer(newLayer);
        });
        li.appendChild(trash);
    }else{
        li.className="defaultLayer";
        edit.addEventListener("click", function(){
            changeLayerDesign(newLayer, true);
        });
    }
    li.appendChild(edit);
    list.appendChild(li);
}

function deleteLayer(layerName){

    //Delete list element in menu
    var layerEl = document.getElementById(layerName+"Li");
    while (layerEl.firstChild) {
        layerEl.removeChild(layerEl.firstChild);
    }
    layerEl.remove();

    //Delete from map
    console.log('layerName');
    console.log(layerName);
    var layer;
    console.log(leafletLayers);
    for(var i=0; i<leafletLayers.length; i++){
        if(leafletLayers[i].name === layerName){
            console.log('removing:');
            leafletLayers[i];
            map.removeLayer(leafletLayers[i].layer) //remove from map

            //Delete from DB
            if(leafletLayers[i].defaultLayer == false){
                //Delete from database
                $.ajax({
                    url: "deleteLayer",
                    type: 'DELETE',
                    data: {
                        layerName: layerName,
                        projectName: projectName
                    }
                });

                $.ajax({
                    url: "deleteStyling",
                    type: 'DELETE',
                    data: {
                        layerName: layerName,
                        projectName: projectName
                    }
                });
            }
            leafletLayers.splice(i,1);
        }
    }


}


//----------------VIEW DATA------------------------

//Create a table to view the data, so user can do a select?
//Write sql after looking at table? Or choose rows, push create layer and automated sql gets written?



//---------------------------- COMMON DIALOG FUNCTIONS----------------------------

function createLayerDropdown(div, type, alreadyChosen){

    //type contains the only type that should be in dropdown:
    console.log(alreadyChosen);
    console.log(type);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    var validTypes=[];
    if(type==null){
        validTypes=["Point","MultiPoint", "Polygon", "MultiPolygon", "LineString", "MultiLineString", "Positions"];
    }else{
        for(var i=0; i<type.length; i++){
            validTypes.push(type[i]);
            validTypes.push('Multi'+type[i]);
        }
    }

    //check if layer has valid type and is not already chosen
    for(var j=0; j<leafletLayers.length;j++) {
        for(var k=0; k<validTypes.length;k++) {
            if(leafletLayers[j].type === validTypes[k]) {

                //check if not already chosen
                if(leafletLayers[j].name !== alreadyChosen){
                    //console.log(leafletLayers[i].type+' is added when type is: '+type);
                    var li = document.createElement("li");
                    li.className='contentLi';
                    var link = document.createElement("a");
                    link.className = "contentLayer";
                    link.id = leafletLayers[j].name;
                    var txt = document.createTextNode(leafletLayers[j].name);
                    link.appendChild(txt);
                    li.appendChild(link);
                    div.appendChild(li);
                }
            }
        }
    }
}

function popupClose(target){
    $("#overlay").hide();
    $(".dialog").hide();
    toggleClose(event.target, target); //closing layer menu if open
}


function toggle(target){
    var menu=event.target;
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
    try{
        target.hide();
        menu.setAttribute('value', 'close');
    }catch(err){
        console.log('no target');
    }
}

//--------------------COMMON TOOLS FUNCTIONS ----------------------------


function changeLayerDesign(layerName){

    resetStyleValues();

    activeStyleLayer=getLeafletLayerFromName(layerName).layer;
    activeStyleLayerName=layerName;

    $.ajax({ //gets all for specific user and project
        url:"getStyling",
        type:"post",
        dataType: "json",
        data:{
            projectName: projectName,
            layerName: layerName
        }
    }).complete(function(data){
        var styling=JSON.parse(data.responseText)[0].layerStyle;
        var color=styling.color;
        var lineColor=styling.color;
        var opacity=styling.opacity;
        var lineWidth=styling.weight;

        document.getElementById('color').value=color;
        document.getElementById('opacity').value=opacity;
        document.getElementById('lineWidth').value=lineWidth;
        document.getElementById('lineColor').value=lineColor;

    });

    $("#overlay").show();
    $("#changeDesignPopUp").show();
}


function resetStyleValues(){
    activeStyleLayer=null;
    activeStyleLayerName="";
}

function saveStyleChanges(){

    var color=document.getElementById('color').value;
    var opacity=document.getElementById('opacity').value;
    var lineWidth=document.getElementById('lineWidth').value;
    var lineColor=document.getElementById('lineColor').value;

    var style={
        "color":color,
        "lineColor":lineColor,
        "opacity": opacity,
        "weight": lineWidth,
        "radius":4
    }

    //delete old style from db
    $.ajax({
        url:"deleteStyling",
        type:"delete",
        dataType: "json",
        data:{
            projectName: projectName,
            layerName: activeStyleLayerName
        }
    }).complete(function(data){
        saveLayerStylingToDBAndUpdateView(activeStyleLayerName, projectName, style);
        popupClose();
    });
}


//----------------------------CLIP----------------------------


function clip(){
    var targetInput=document.getElementById('chosenClipInputLayer');
    var targetClip=document.getElementById('chosenClipClipLayer');
    resetClipValues(targetInput, targetClip);

    var contentInputlayer=document.getElementById("layerDropdown-content-clip-inputlayer");
    createLayerDropdown(contentInputlayer);

    var contentCliplayer=document.getElementById("layerDropdown-content-clip-cliplayer");
    createLayerDropdown(contentCliplayer);

    $("#overlay").show();
    $("#clipPopUp").show();

    $(".contentLayer").click(function(){
        var id= event.target.parentElement.parentElement.id;
        var typeOfClipLayer=id.split('clip-')[1];
        addActiveClipLayer(event.target, id);
        var chosenLayer=target;
        if(typeOfClipLayer==='input'){
            chosenLayer.innerHTML=activeClipInputLayer;
        }else{
            chosenLayer.innerHTML=activeClipClipLayer;
        }
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-clip-cliplayer'));
        toggleClose(event.target, $('#layerDropdown-content-clip-inputlayer'));
    });
}

function createClip(){

    var intLayerName=$('#clipLayerName').val();
    var intColor=$("#clipColor").val();

    //check if everything is filled out
    if(activeClipInputLayer && activeClipClipLayer && intColor && intLayerName){

        var sublayerObj=createClipSql(activeClipInputLayer, activeClipClipLayer, intColor, intLayerName);

        var newSublayer={
            name: intLayerName,
            sql:sublayerObj.sql,
            cartocss:sublayerObj.cartocss,
            subLayer:{},
            active: true,
            type: activeClipLayers[0].type
        };

        sublayers.push(newSublayer);
        sublayers[sublayers.length-1].subLayer=addSublayerToMap(newSublayer);
        popupClose($('#layerDropdown-content-cliplayer'));
        popupClose($('#layerDropdown-content-inputlayer'));
        addToLayerList(intLayerName, newSublayer);

        //call post request to save layer to database:
        $.post("/layer",
            {
                name: newSublayer.name,
                sql: newSublayer.sql,
                cartocss:newSublayer.cartocss,
                active: newSublayer.active,
                type: newSublayer.type,
                defaultLayer:false,
                projectName:projectName
            }
        ).complete(function(){
            console.log("completed");
        });

    }else{
        alert('Fill out all fields first');
    }
    //when created, empty fields:
    activeClipInputLayer=null;
    activeClipClipLayer=null;
    intColor=null;
    intLayerName=null;
}

function createClipSql(layerInputName,layerClipName, color){

    //check type, split if buffer ++
    var layer_input=layerInputName.toLowerCase();
    var layer_clip=layerClipName.toLowerCase();

    //TODO: write sql for clip
    var sqlString="";

    var typeOfInputLayer=getSublayerFromLayerName(layerInputName).type;
    var cartoString= getCarto(typeOfInputLayer, layerInputName, color);

    var sublayerObj={
        sql:sqlString,
        cartocss:cartoString
    };

    return sublayerObj;
}

//add to list over "chosen layers" to make sql from
function addActiveClipLayer(element, id){ //element is the html-element

    var typeOfClipLayer=id.split('clip_')[1];

    if(typeOfClipLayer === 'inputlayer'){  //if input layer
        activeClipInputLayer=element.id;
    }else { //clip layer
        activeClipClipLayer=element.id; //add to active list
    }
    var li=document.createElement('li');
    li.className="li-layer";

    var name=document.createElement('h2');
    name.className="chosenLayer";
    name.innerHTML=element.id;

    var trashLink= document.createElement('a');
    trashLink.className="trash";
    trashLink.addEventListener("click", function(){
        removeActiveClipLayer(typeOfClipLayer);
    });
    var trashImg= document.createElement('img');
    trashImg.src="../../images/trash-black.png";
    trashLink.appendChild(trashImg);

    li.appendChild(name);
    li.appendChild(trashLink);

    document.getElementById('chosenLayersClip').appendChild(li);
}

//remove layer from "chosen layers" list - trashcan event
function removeActiveClipLayer(typeOfClipLayer){
    var li=event.target.parentElement.parentElement;
    var layerName=li.firstChild;

    if(typeOfClipLayer==='inputlayer'){
        activeClipInputLayer=null;
    }else{
        activeClipClipLayer=null;
    }

    while (li.firstChild) {
        li.removeChild(li.firstChild);
    }
    li.remove();
}

function resetClipValues(targetInput, targetClip){

    //delete chosenLayers from last used
    var ul=document.getElementById('chosenClipInputLayer');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
    var ul2=document.getElementById('chosenClipClipLayer');
    while (ul2.firstChild) {
        ul2.removeChild(ul2.firstChild);
    }

    $('#clipLayerName').val("");
    targetInput.innerHTML=("Choose layer from list");
    targetClip.innerHTML=("Choose layer from list");


    targetInput.className="";
    targetClip.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    var arrow1=document.createElement("span");
    arrow1.className="caret";
    targetInput.appendChild(arrow);
    targetClip.appendChild(arrow1);

    $("#clipColor").val("#243CEE");
}


//-------------------------DIFFERENCE------------------------

function difference(){
    $("#differenceColor").val("#243CEE");
    $('#differenceLayerName').val("");


    var target1=document.getElementById('chosenDifference1');
    var target2=document.getElementById('chosenDifference2');
    resetDifferenceValuesForLayer(target1);
    resetDifferenceValuesForLayer(target2);

    $("#overlay").show();
    $("#differencePopUp").show();

    var content1=document.getElementById("layerDropdown-content-difference1");
    var content2=document.getElementById("layerDropdown-content-difference2");

    createLayerDropdown(content1, ["Polygon"]);

    $(".contentLayer").click(function(){
        activeDifference1=(event.target.id);
        var chosenLayer=target1;
        chosenLayer.innerHTML=activeDifference1;
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-difference1'));
        var firstSublayer=getLeafletLayerFromName(activeDifference1);
        resetDifferenceValuesForLayer(target2);
        addSecondDifferenceLayer(content2, "Polygon", firstSublayer.name);
    });
}

function addSecondDifferenceLayer(content2, type, chosen){
    var target2=document.getElementById('chosenDifference2');
    createLayerDropdown(content2, [type], chosen);
    $(".contentLayer").click(function(){
        activeDifference2=(event.target.id);
        var chosenLayer=target2;
        chosenLayer.innerHTML=activeDifference2;
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-difference2'));
    });
}

function createDifference(){

    var diffLayerName=$('#differenceLayerName').val();
    var diffColor=$("#differenceColor").val();

    //check if everything is filled out
    var layer1= getLeafletLayerFromName(activeDifference1);
    var layer2= getLeafletLayerFromName(activeDifference2);

    if(activeDifference1 && activeDifference2 && diffColor && diffLayerName && (layer1.type === layer2.type)){

        popupClose($('#layerDropdown-content-difference2'));
        popupClose($('#layerDropdown-content-difference1'));


        $.ajax({ //gets all for specific user and project
            url:"difference",
            type:"post",
            dataType: "json",
            data:{
                projectName:projectName,
                layer1name: activeDifference1,
                layer1default: layer1.defaultLayer,
                layer2name:activeDifference2,
                layer2default: layer2.defaultLayer,
                color: diffColor,
                newLayerName: diffLayerName
            }
        }).complete(function(data){

            var styling={
                "color":diffColor
            }
            console.log('data: ');
            console.log(JSON.parse(data.responseText));
            var layer=addLayerToMap(JSON.parse(data.responseText), styling, diffLayerName, false);
            addToLayerList(diffLayerName, layer);
        });

    }else{
        alert('Fill out all fields first, and make sure that the two inputs are of same type, example polygon');
    }
    //when created, empty fields:
    activeDifference2=null;
    activeDifference1=null;
    intColor=null;
    intLayerName=null;

}


function resetDifferenceValuesForLayer(target){
    target.innerHTML=("Choose layer from list");
    target.className="";

    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);
}


//----------------------------MERGE----------------------------

function merge(){

    if(!fillAgain){
        $("#mergeColor").val("#243CEE");
        $('#mergeLayerName').val("");
    }else{
        fillAgain=false;
    }

    popupClose($('#layerDropdown-content-merge1'));
    popupClose($('#layerDropdown-content-merge2'));


    var target1=document.getElementById('chosenMerge1');
    var target2=document.getElementById('chosenMerge2');
    resetMergeValuesForLayer(target1);
    resetMergeValuesForLayer(target2);

    $("#overlay").show();
    $("#mergePopUp").show();

    var content1=document.getElementById("layerDropdown-content-merge1");
    var content2=document.getElementById("layerDropdown-content-merge2");

    createLayerDropdown(content1);

    $(".contentLi").click(function(){
        console.log(event.currentTarget.firstChild);
        var active= event.currentTarget.firstChild;
        activeMergeLayer1=(active.id);
        var chosenLayer=target1;
        chosenLayer.innerHTML=activeMergeLayer1;
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(active, $('#layerDropdown-content-merge1'));
        var firstLayer=getLeafletLayerFromName(activeMergeLayer1);
        resetMergeValuesForLayer(document.getElementById('chosenMerge2'));
        addSecondMergeLayer(content2, firstLayer.type, firstLayer.name);
    });
}

function addSecondMergeLayer(content2, type, chosen){
    var target2=document.getElementById('chosenMerge2');
    createLayerDropdown(content2, [type], chosen);
    $(".contentLayer").click(function(){
        activeMergeLayer2=(event.target.id);
        var chosenLayer=target2;
        chosenLayer.innerHTML=activeMergeLayer2;
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-merge2'));
    });
}

function createMerge(){

    if(!fillAgain) { //unless failed filling info last time
        var mergeLayerName = $('#mergeLayerName').val();
        var mergeColor = $("#mergeColor").val();
    }

    //check if everything is filled out
    var layer1= getLeafletLayerFromName(activeMergeLayer1);
    var layer2= getLeafletLayerFromName(activeMergeLayer2);

    console.log(layer1.type);
    console.log(layer2.type);
    console.log(activeMergeLayer1);
    console.log(activeMergeLayer2);
    console.log(mergeColor);
    console.log(mergeLayerName);

    //ops, multipolygon should be included!
    //if(activeMergeLayer1 && activeMergeLayer2 && mergeColor && mergeLayerName && (layer1.type === layer2.type)){
    if(activeMergeLayer1 && activeMergeLayer2 && mergeColor && mergeLayerName){

        popupClose($('#layerDropdown-content-merge'));

        $.post("/merge",
            {
                layer1:activeMergeLayer1,
                layer2:activeMergeLayer2,
                default1: layer1.defaultLayer,
                default2: layer2.defaultLayer,
                color:mergeColor,
                newLayerName: mergeLayerName,
                projectName:projectName
            }
        ).complete(function(data){
            console.log("completed");
        });

        var styling={
            "color":mergeColor
        }
        var layer=addLayerToMap(JSON.parse(data.responseText), styling, mergeLayerName, false);
        addToLayerList(mergeLayerName, layer);

    }else{
        alert('Fill out all fields first, and make sure that the two inputs are of same type, example polygon');
        fillAgain=true;
    }
    //when created, empty fields:
    mergeColor=null;
    mergeLayerName=null;
}


function resetMergeValuesForLayer(target){
    console.log(target);
    document.getElementById(target.id).innerHTML="choose layer from list";
    console.log(document.getElementById(target.id));

    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);

    //when created, empty fields:
    activeMergeLayer1=null;
    activeMergeLayer2=null;

}

//----------------------------WITHIN----------------------------


function within(){

    popupClose($('#layerDropdown-content-area-within'));
    popupClose($('#layerDropdown-content-output-within'));

    //Reset prev chosen layers
    var area=document.getElementById('chosenAreaWithin');
    var output=document.getElementById('chosenOutputWithin');

    if(!fillAgain){
        resetWithinValues(area);
        resetWithinValues(output);
    }else{
        fillAgain=false;
    }


    var contentArea=document.getElementById("layerDropdown-content-area-within");
    var validTypes=["Polygon", "Point"];
    createLayerDropdown(contentArea, validTypes);

    var contentOutput=document.getElementById("layerDropdown-content-output-within");
    createLayerDropdown(contentOutput);

    $("#overlay").show();
    $("#withinPopUp").show();

    $(".contentLayer").click(function(){

        //check if pushed layer is from area or output!
        if(event.target.parentElement.parentElement.id === "layerDropdown-content-area-within"){
            activeWithinArea=event.target.id;
            area.innerHTML=activeWithinArea;
            area.className="chosenLayer";
            //when first layer is chosen, remove the layer from the other list

        }else{
            activeWithinOutput=event.target.id;
            output.innerHTML=activeWithinOutput;
            output.className="chosenLayer";
        }

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-area-within'));
        toggleClose(event.target, $('#layerDropdown-content-output-within'));
    });
}


function addSecondWithinLayer(content2, type, chosen){
    var target2=document.getElementById('chosenDifference2');
    createLayerDropdown(content2, [type], chosen);
    $(".contentLayer").click(function(){
        activeDifference2=(event.target.id);
        var chosenLayer=target2;
        chosenLayer.innerHTML=activeDifference2;
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-difference2'));
    });
}


function createWithin(){

    popupClose($('#layerDropdown-content-within'));

    var withinLayerName=$('#withinLayerName').val();
    var withinColor=$("#withinColor").val();

    //check if everything is filled out
    if(activeWithinArea && activeWithinOutput && withinColor && withinLayerName){

        var outputLayer=getLeafletLayerFromName(activeWithinOutput);
        var inputLayer=getLeafletLayerFromName(activeWithinArea);
        $.ajax({ //gets all for specific user and project
            url:"within",
            type:"post",
            dataType: "json",
            data:{
                projectName:projectName,
                inputArea: activeWithinArea,
                inputType:inputLayer.type,
                inputDefault:inputLayer.defaultLayer,
                outputLayer: activeWithinOutput,
                outputType:outputLayer.type,
                outputDefault:outputLayer.defaultLayer,
                color: withinColor,
                newLayerName: withinLayerName
            }
        }).complete(function(data){

            var styling={
                "color":withinColor
            }
            console.log('data: ');
            console.log(JSON.parse(data.responseText));
            var layer=addLayerToMap(JSON.parse(data.responseText), styling, withinLayerName, false);
            addToLayerList(withinLayerName, layer);

        });

    }else{
        alert('Fill out all fields first');
        fillAgain=true;
    }
}

function resetWithinValues(target){

    //delete chosenLayers from last used
    var ul=target;
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    $('#withinName').val("");

    //Set default text and styling for dropdown menus
    target.innerHTML=("Choose layer from list");
    target.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);

    $("#withinColor").val("#243CEE");

    activeWithinArea=null;
    activeWithinOutput=null;
}



//----------------------------BUFFER-----------------------------------
//action when buffer button click
function buffer(){

    popupClose($('#layerDropdown-content-buffer'));
    var target=document.getElementById('chosenBuffer');

    if(!fillAgain){
        resetBufferValues(target); //target is the buffer layer last chosen that needs to be reset
    }else{
        fillAgain=false;
    }

    var content=document.getElementById("layerDropdown-content-buffer");
    createLayerDropdown(content);
    $("#overlay").show();
    $("#bufferPopUp").show();

    $(".contentLayer").click(function(){
        target.className=""
        for(var i= 0; i<leafletLayers.length; i++){
            if(leafletLayers[i].name===event.currentTarget.id){
                activeBufferLayer=leafletLayers[i];
            }
        }
        var chosenLayer=target;
        chosenLayer.innerHTML=activeBufferLayer.name;
        chosenLayer.className="chosenLayer";
        //Remove chosen layer when resetting values!
        toggleClose(event.target,$('#layerDropdown-content-buffer'));
    });
}

function createBuffer(){
    bufferDistance=$('#bufferDistance').val();
    bufferColor=$("#bufferColor").val();

    //check if everything is filled out
    if(activeBufferLayer && bufferColor && bufferDistance){

        popupClose($('#layerDropdown-content-buffer'));


        var newLayerName=activeBufferLayer.name+'_buffer_'+bufferDistance;
        var layer=getLeafletLayerFromName(activeBufferLayer.name);


        //if layer to create buffer from is default, get method is different
        var url;
        if(layer.defaultLayer==true){
            url="BufferDefaultGeojson";
        }else{
            url="BufferGetGeojson";
        }

        $.ajax({ //get geojson layer
            url:url,
            type:"post",
            dataType: "json",
            data:{
                layerName:activeBufferLayer.name,
                bufferDistance: bufferDistance,
                projectName: projectName,
                newLayerName:newLayerName,
                bufferColor: bufferColor
            }
        }).complete(function(data){
            //post to db and add to map
            var styling={
                "color":bufferColor
            }
            console.log('data: ');
            console.log(data);
            var layer=addLayerToMap(JSON.parse(data.responseText), styling, newLayerName, false);
            addToLayerList(newLayerName, layer);
        });

        //Add styling to map


    }else{
        alert('Fill out all fields first');
        fillAgain=true;
    }
}


function resetBufferValues(target){
    activeBufferLayer=null;

    $('#bufferDistance').val("");
    target.innerHTML=("Choose layer from list");

    target.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);

    $("#bufferColor").val("#243CEE");
}
