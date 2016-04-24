
var map;
var mapLayer; //layer to put all sublayers in, read it is more efficient with sublayers
var sublayers=[]; //contains json objects with info about sublayer

var activeBufferLayer;
var activeIntersectionLayers=[];
var activeMergeLayers=[];
var activeClipInputLayer;
var activeClipClipLayer;
var bufferColor;
var bufferDistance;
var activeLayers=["Rivers", "Buildings", "Schools", "Water", "Railway"]; //used for side menu
var activeStyleLayer;
var activeStyleLayerName;

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


    cartodb.createLayer(map,{
            user_name: 'mathildeo',
            type: 'cartodb',
            sublayers:[]
        })
        .addTo(map)
        .done(function(layer){
            mapLayer=layer;
        });

    //TODO: CAll this function on create account (or on new project) - be aware of sync, probably have to call getallLayersFromDatabase in the other this function
    addDefaultSublayers();

}

//adding default layers from default tabel, adds them to layerlist for user so user can change styling
function addDefaultSublayers(){

    /*$.ajax({
        url:"defaultLayers",
        type:"get",
        dataType: "json",
        data:{},
        success: "success"

    }).complete(function(data){
        var layers=JSON.parse(data.responseText);
        console.log(layers.length);
        //go through all layers and add them:
        for(var i=0; i<layers.length; i++){
            addNewSublayerFromDbLayer(layers[i], true, true);
        }

    });*/
    getAllLayersFromDb();

}

function getAllLayersFromDb(){
    $.ajax({ //gets all for specific user
        url:"layers",
        type:"get",
        dataType: "json",
        data:{},
        success: "success"

    }).complete(function(data){

        var layers=JSON.parse(data.responseText);
        //go through all layers and add them:
        for(var i=0; i<layers.length; i++){
            addNewSublayerFromDbLayer(layers[i], layers[i].defaultLayer);
        }
    });
}

//just making a duplicate of the default layers for the specific user
function addNewSublayerFromDbLayer(layer, defaultLayer, isDuplicatingDefaultLayer){
    var newSublayer={
        name: layer.name,
        sql: layer.sql,
        cartocss: layer.cartocss,
        subLayer:{},
        active: layer.active,
        type: layer.type,
        defaultLayer: defaultLayer
    };


    if(isDuplicatingDefaultLayer){
        //post to db
        $.ajax({
            url:"layer",
            type:"post",
            data:{
                name:layer.name,
                sql: layer.sql,
                cartocss: layer.cartocss,
                active: layer.active,
                layerType: layer.type,
                defaultLayer: newSublayer.defaultLayer
            }
        });
    }else{
        sublayers.push(newSublayer);
        sublayers[sublayers.length-1].subLayer = addSublayerToMap(newSublayer);
        addToLayerList(layer.name, newSublayer);
    }
}

function addSublayerToMap(sublayer){
    console.log('adding sublayer');
    console.log(sublayer);
    var subObj={
        sql:sublayer.sql,
        cartocss:sublayer.cartocss
    };
    var sub=mapLayer.createSubLayer(subObj);
    console.log(sub);
    return sub;
}

//----------------------------Main menu methods -------------------------------------

//checkbox action, activate and remove layers from map
function handleLayers(){
    var layerName=event.currentTarget.className;

    console.log('sublayers: ');
    console.log(sublayers);

    for(var i=0; i<sublayers.length;i++){
        if(sublayers[i].name === layerName){
            console.log(layerName);
            if(sublayers[i].active == true){
                sublayers[i].active=false;
                mapLayer.getSubLayer(i).hide();

            }else{
                sublayers[i].active=true;
                mapLayer.getSubLayer(i).show();
            }
        }
    }
}

//layerlist in main menu
function addToLayerList(newLayer, newSublayer){

    activeLayers.push(newLayer);
    var link=document.createElement('a');
    link.innerHTML=newLayer;
    var checkbox=document.createElement('input');
    checkbox.checked=true;
    checkbox.className=newLayer;
    checkbox.type="checkbox";
    checkbox.addEventListener("click", function(){
        handleLayers();
    });

    //TODO: is id ever used? If not - remove it
    checkbox.id=sublayers.length;//set id to nr of sublayers, to get the indexing right

    var list=document.getElementById("menuLayerDropdown");
    var li=document.createElement('li');
    li.id=newLayer+"Li";
    li.appendChild(link);
    li.appendChild(checkbox);

    var edit=document.createElement("img");
    edit.className="editLayer";
    edit.src="../images/edit-white.png";

    if(true){ //just while working to fast delete from database! :)
        //if(!newSublayer.defaultLayer){ //the default layers cannot be deleted

        edit.addEventListener("click", function(){ //call differenet api depending on default layer or not
            changeSublayerDesign(newLayer);
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
            changeSublayerDesign(newLayer, true);
        });
    }
    li.appendChild(edit);
    list.appendChild(li);
}

function deleteLayer(layerName){

    //Delete list element in menu
    console.log(layerName);
    var layerEl = document.getElementById(layerName+"Li");
    while (layerEl.firstChild) {
        layerEl.removeChild(layerEl.firstChild);
    }
    layerEl.remove();

    //Delete from map
    for(var i=0; i<sublayers.length; i++){
        if(sublayers[i].name === layerName){
            mapLayer.getSubLayer(i).remove(); //remove from map
            sublayers.splice(i,1);
        }
    }

    //Delete from database
    $.ajax({
        url: "deleteLayer",
        type: 'DELETE',
        data: {
            name: layerName
        },
    });
}


function getSublayerFromLayerName(name){
    for(var i=0; i<sublayers.length; i++){
        if(sublayers[i].name === name){
            return sublayers[i];
        }
    }
}

//----------------VIEW DATA------------------------

//Create a table to view the data, so user can do a select?
//Write sql after looking at table? Or choose rows, push create layer and automated sql gets written?



//---------------------------- COMMON DIALOG FUNCTIONS----------------------------

function createLayerDropdown(div){

    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    console.log('create dropdown: '+ div);


    for(var i=0; i<sublayers.length; i++){
        var li= document.createElement("li");
        var link=document.createElement("a");
        link.className="contentLayer";
        link.id=sublayers[i].name;
        var txt=document.createTextNode(sublayers[i].name);
        link.appendChild(txt);
        li.appendChild(link);
        div.appendChild(li);
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
    }catch(err){
        console.log('no target');
    }
    menu.setAttribute('value', 'close');
}

//--------------------COMMON TOOLS FUNCTIONS ----------------------------

function getCarto(type, name, color, opacity, linewidth, linecolor){
    var layerName=name.toLowerCase();
    var cartoString;
    if(!opacity){
        opacity='0.8';
    }
    if(!linecolor){
        linecolor='#FFF';
    }
    if(!linewidth){
        linewidth='0.5';
    }

    if(type==="polygon"){
        cartoString = '#'+layerName+' {' +
            'polygon-fill: '+color+'; ' +
            'polygon-opacity: '+opacity+'; ' +
            'line-color: '+linecolor+'; ' +
            'line-width: '+linewidth+'; ' +
            'line-opacity :1;}'

    }else if(type==="line"){
        cartoString="#"+layerName+"{" +
            'line-color: '+color+'; ' +
            'line-width: '+linewidth+'; ' +
            "line-opacity: 1;}"

    }else if(type==="marker") {
        cartoString='#'+layerName+' {' +
            "marker-fill-opacity: "+opacity+"; " +
            "marker-line-color: "+linecolor+"; " +
            "marker-line-width: "+linewidth+"; " +
            "marker-line-opacity: 1; " +
            "marker-placement: point;" +
            "marker-type: ellipse; " +
            "marker-width: 10; " +
            "marker-fill: "+color+"; " +
            "marker-allow-overlap: true;"
    }
    return cartoString;
}

var color;
var lineColor;
var lineWidth;
var opacity;


function changeSublayerDesign(layerName){

    resetStyleValues();
    
    $("#overlay").show();
    $("#changeDesignPopUp").show();

    var sublayer=getSublayerFromLayerName(layerName);

    getAndSetValuesFromCarto(sublayer);

}

function getAndSetValuesFromCarto(sublayer) {

    activeStyleLayer=sublayer;

    var carto = sublayer.cartocss;
    activeStyleLayerName=sublayer.cartocss.split('#')[1].split('{')[0];

    console.log(carto);

    if (sublayer.type === "polygon") {
        console.log('polygon');
        color = carto.split('polygon-fill')[1].split(';')[0].split(" ")[1];
        opacity = carto.split('polygon-opacity')[1].split(';')[0].split(" ")[1];
        lineColor = carto.split('line-color')[1].split(';')[0].split(" ")[1];
        lineWidth = carto.split('line-width')[1].split(';')[0].split(" ")[1];

    } else if (sublayer.type === "line") {
        console.log('line');
        color = carto.split('line-color')[1].split(';')[0].split(" ")[1];
        opacity = carto.split('line-opacity')[1].split(';')[0].split(" ")[1];
        lineWidth = carto.split('line-width')[1].split(';')[0].split(" ")[1];

    } else if (sublayer.type === "marker") {
        console.log('marker');
        color = carto.split('marker-fill')[1].split(';')[0].split(" ")[1];
        opacity = carto.split('marker-fill-opacity')[1].split(';')[0].split(" ")[1];
        lineWidth = carto.split('marker-line-width')[1].split(';')[0].split(" ")[1];
        lineColor = carto.split('marker-line-color')[1].split(';')[0].split(" ")[1];
    }

    console.log(color);
    console.log(opacity);

    document.getElementById('color').value=color;
    document.getElementById('opacity').value=opacity;
    document.getElementById('lineWidth').value=lineWidth;
    if(lineColor){
        addLineColor();
        document.getElementById('lineColor').value=lineColor;
    }
}

function addLineColor(){
    var text=document.createElement("h2");
    text.innerHTML="Line-color:";
    var input=document.createElement("input");
    input.type="color";
    input.id="lineColor";
    text.appendChild(input);
    $("#lineStyle").prepend(text);
}

function resetStyleValues(){
    if(document.getElementById("lineStyle").childElementCount>1){
        document.getElementById("lineStyle").lastElementChild.remove();
    }
    activeStyleLayer=null;
    activeStyleLayerName="";
}

function saveStyleChanges(){

    console.log("in save style changes");

    color=document.getElementById('color').value;
    opacity=document.getElementById('opacity').value;
    lineWidth=document.getElementById('lineWidth').value;
    try{
        lineColor=document.getElementById('lineColor').value;
    }catch(err){
        lineColor=null;
    }

    var carto;
    if(lineColor){
        console.log('line color exist');
        carto = getCarto(activeStyleLayer.type, activeStyleLayerName, color, opacity, lineWidth, lineColor);
    }else{
        console.log('line color does not exist');
        carto = getCarto(activeStyleLayer.type, activeStyleLayerName, color, opacity, lineWidth);
    }

    console.log('new carty');
    console.log(carto);
    for(var i=0; i<sublayers.length; i++){
        if(sublayers[i].name===activeStyleLayer.name){
            mapLayer.getSubLayer(i).setCartoCSS(carto);
            var mapSublayer=mapLayer.getSubLayer(i);
            sublayers[i].cartocss=mapLayer.getSubLayer(i).getCartoCSS();
        }
    }


    //update css for layer in db
    var url="updateCss:"+activeStyleLayer.name;
    $.ajax({
        type: "PUT",
        url: "updateCss",
        data: {
            name:activeStyleLayer.name,
            cartocss:carto
        }
    });


    //add changes to database
        //add all sublayers to database
        //have a new table called defaultLayers - cannot delete these layers
        //on change, update css to the layers
    //add so that changes is read from db on update


    popupClose();
}

function createNewSublayerFromUserInfo(layerName, sql, cartocss, type, newLayerName){
    var newSublayer={
        name: layerName,
        sql:sql,
        cartocss:cartocss,
        subLayer:{},
        active: true,
        type: type
    };

    sublayers.push(newSublayer);
    sublayers[sublayers.length-1].subLayer=addSublayerToMap(newSublayer);
    addToLayerList(newLayerName, newSublayer);

    $.post("/layer",
        {
            name: newSublayer.name,
            sql: newSublayer.sql,
            cartocss:newSublayer.cartocss,
            active: newSublayer.active,
            type: newSublayer.type,
            defaultLayer:false
        }
    ).complete(function(){
        console.log("completed");
    });
}


//----------------------------CLIP----------------------------


function clip(){
    console.log('clip');
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
                defaultLayer:false
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
    console.log(ul);
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



//----------------------------MERGE----------------------------

function merge(){
    console.log('MERGE');
    var target=document.getElementById('chosenMerge');
    resetMergeValues(target);

    var content=document.getElementById("layerDropdown-content-merge");
    createLayerDropdown(content);
    $("#overlay").show();
    $("#mergePopUp").show();

    $(".contentLayer").click(function(){

        addActiveMergeLayer(event.target);
        var chosenLayer=target;
        chosenLayer.innerHTML=activeMergeLayers[activeMergeLayers.length-1];
        chosenLayer.className="chosenLayer";

        //Remove chosen layer when resetting values!
        toggleClose(event.target, $('#layerDropdown-content-merge'));
    });
}

function createMerge(){

    var intLayerName=$('#mergeLayerName').val();
    var intColor=$("#mergeColor").val();


    //check if everything is filled out
    if(activeMergeLayers.length>0 && intColor && intLayerName){

        var sublayerObj=createMergeSql(activeMergeLayers, intColor, intLayerName);

        var newSublayer={
            name: intLayerName,
            sql:sublayerObj.sql,
            cartocss:sublayerObj.cartocss,
            subLayer:{},
            active: true,
            type: activeMergeLayers[0].type
        };

        sublayers.push(newSublayer);
        sublayers[sublayers.length-1].subLayer=addSublayerToMap(newSublayer);
        popupClose($('#layerDropdown-content-merge'));
        addToLayerList(intLayerName, newSublayer);

        //call post request to save layer to database:
        $.post("/layer",
            {
                name: newSublayer.name,
                sql: newSublayer.sql,
                cartocss:newSublayer.cartocss,
                active: newSublayer.active,
                type: newSublayer.type,
                defaultLayer: false
            }
        ).complete(function(){
            console.log("completed");
        });


    }else{
        alert('Fill out all fields first');
    }
    //when created, empty fields:
    activeMergeLayers=[];
    intColor=null;
    intLayerName=null;
}

function createMergeSql(layersName, color){
    console.log(layersName);
    var distance=layersName[1].split('_buffer_')[1].toLowerCase();
    var layer_a_name=layersName[0].toLowerCase();
    var layer_b_name=layersName[1].split('_buffer_')[0].toLowerCase();

    console.log(distance);
    var sqlString="SELECT a.the_geom_webmercator, a. the_geom, a.cartodb_id " +
        "FROM "+layer_a_name+" AS a, " +layer_b_name+" AS b " +
        "WHERE ST_DWithin(a.the_geom, b.the_geom, 33622)";

    var newTableName="";
    var mergeSublayers=[];
    for(var i=0; i<layersName.length; i++){
        mergeSublayers.push(getSublayerFromLayerName(layersName[i]));
        newTableName=newTableName+"_"+layersName[i];
    }

    //Merge is always made from layers of same type. Therefor only need to check type of one
    var type=mergeSublayers[0].type;
    var cartoString=getCarto(type, newTableName, color);

    var sublayerObj={
        sql:sqlString,
        cartocss:cartoString
    };

    return sublayerObj;
}


//add to list over "chosen layers" to make sql from
function addActiveMergeLayer(element){ //element is the html-element
    var newSublayer;
    var firstChosenSublayer;
    //check if already active
    for(var i=0; i<sublayers.length; i++){
        if(sublayers[i].name === element.id){
            newSublayer=sublayers[i];
        }if(activeMergeLayers.length>0){ //exist already chosen merge layer
            if(sublayers[i].name === activeMergeLayers[0]){
                firstChosenSublayer=sublayers[i];
            }
        }
    }
    console.log(newSublayer.type);
    try {
        console.log(firstChosenSublayer.type);
        console.log(firstChosenSublayer);
    }catch(err){

    }


    if($.inArray(element.id, activeMergeLayers)!==-1){ //if layer is active merge layer
        alert('Layer is already chosen! Choose another instead'); //Change this so that layer instead is removed from list to choose from
        activeMergeLayers.splice($.inArray(element.id, activeMergeLayers),1); //remove from list

    }else if(firstChosenSublayer && (newSublayer.type != firstChosenSublayer.type)){
        alert('The chosen layers is of different types. Please select two of same type.');

    }else {
        activeMergeLayers.push(element.id); //add to active list
        var li=document.createElement('li');
        li.className="li-layer";

        var name=document.createElement('h2');
        name.className="chosenLayer";
        name.innerHTML=element.id;

        var trashLink= document.createElement('a');
        trashLink.className="trash";
        trashLink.addEventListener("click", function(){
            removeActiveMergeLayer()
        });
        var trashImg= document.createElement('img');
        trashImg.src="../../images/trash-black.png";
        trashLink.appendChild(trashImg);

        li.appendChild(name);
        li.appendChild(trashLink);

        document.getElementById('chosenLayersMerge').appendChild(li);
    }
}

//remove layer from "chosen layers" list - trashcan event
function removeActiveMergeLayer(){
    console.log(sublayers);
    var li=event.target.parentElement.parentElement;
    var layerName=li.firstChild;
    activeMergeLayers.splice($.inArray(layerName, activeMergeLayers),1); //remove from list

    while (li.firstChild) {
        li.removeChild(li.firstChild);
    }
    li.remove();
}

function resetMergeValues(target){

    //delete chosenLayers from last used
    var ul=document.getElementById('chosenLayersMerge');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    $('#mergeLayerName').val("");
    target.innerHTML=("Choose layer from list");

    target.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);

    $("#mergeColor").val("#243CEE");
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

    popupClose($('#layerDropdown-content-intersection'));

    var intLayerName=$('#intersectionLayerName').val();
    var intColor=$("#intersectionColor").val();

    //check if everything is filled out
    if(activeIntersectionLayers.length>0 && intColor && intLayerName){
        var sublayerObj=createIntSql(activeIntersectionLayers, intColor, intLayerName);
        createNewSublayerFromUserInfo(intLayerName, sublayerObj.sql, sublayerObj.cartocss,activeIntersectionLayers[0].type, intLayerName);
    }else{
        alert('Fill out all fields first');
    }
    //when created, empty fields:
    activeIntersectionLayers=[];
    intColor=null;
    intLayerName=null;
}

function createIntSql(layersName, color){
    console.log(layersName);
    var layer_a_name=layersName[0].toLowerCase();
    var layer_b_name=layersName[1].split('_buffer_')[0].toLowerCase();

    var sqlString="SELECT a.the_geom_webmercator, a.cartodb_id " +
        "FROM "+layer_a_name+" AS a, " +layer_b_name+" AS b " +
        "WHERE ST_DWithin(a.the_geom_webmercator, b.the_geom_webmercator, 350)";

    //TODO: What type is the output of this?
    var cartoString= getCarto("polygon", layer_a_name, color);


    var sublayerObj={
        sql:sqlString,
        cartocss:cartoString
    };

    return sublayerObj;

}

//add to list over "chosen layers" to make sql from
function addActiveLayer(element){ //element is the html-element

    //TODO: find how to get information to look up if active in sublayers

    if($.inArray(element.id, activeIntersectionLayers)!==-1){ //if layer is active intersection layer
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
    console.log(sublayers);
    var li=event.target.parentElement.parentElement;
    var layerName=li.firstChild;
    activeIntersectionLayers.splice($.inArray(layerName, activeIntersectionLayers),1); //remove from list

    while (li.firstChild) {
        li.removeChild(li.firstChild);
    }
    li.remove();
}

function resetIntersectionValues(target){

    //delete chosenLayers from last used
    var ul=document.getElementById('chosenLayersIntersection');
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

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
        target.className=""
        for(var i= 0; i<sublayers.length; i++){
            if(sublayers[i].name===event.currentTarget.id){
                activeBufferLayer=sublayers[i];
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

        var sublayerObj=createBufferSql(activeBufferLayer.name, bufferColor, bufferDistance);
        var layerName=activeBufferLayer.name+'_buffer_'+bufferDistance;
        var newLayerName=activeBufferLayer.name+'_buffer_'+bufferDistance;
        createNewSublayerFromUserInfo(layerName,sublayerObj.sql, sublayerObj.cartocss, "polygon", newLayerName);

    }else{
        alert('Fill out all fields first');
    }

    console.log('empty fields');
    //when created -> empty values:
    activeBufferLayer=null;
    bufferColor=null;
    bufferDistance=null;
}


function createBufferSql(layer, color, distance){
    var sqlString="SELECT ST_Transform(ST_Buffer(the_geom::geography,"+distance+")::geometry, 3857) As the_geom_webmercator, cartodb_id FROM "+layer;
    var cartoString= getCarto("polygon", layer, color);
    return {
        sql: sqlString,
        cartocss: cartoString
    };
}

function resetBufferValues(target){
    $('#bufferDistance').val("");
    target.innerHTML=("Choose layer from list");

    target.className="";
    var arrow=document.createElement("span");
    arrow.className="caret";
    target.appendChild(arrow);

    $("#bufferColor").val("#243CEE");
}