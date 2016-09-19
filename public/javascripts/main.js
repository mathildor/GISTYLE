
var main={
  menu:{
    activeLayers:["Rivers", "Buildings", "Schools", "Water", "Railway"] //used for side menu
  },
  map:{
    layers:[],
    activeStyleLayer:"",
    activeStyleLayerName:""
  }
};


// var map;
var fillAgain=false; //is used to: know if popup should be reset or not, if missed some info the already filled out should stay. Just in all tools dialogs

//method called when project is chosen
//TODO: how set whan page is updated????? Through controller? Or backend project session like user session is set?
function setProjectName(name){
  project.current=name;
}

function enterProject(){
  main.map.layers=[];
  db.getLayers();
}

main.map.init=function(){
  if(project.current===""){
    console.log("Project undefined");
    window.location="/#projects";
  }
  map = new L.Map('leaflet-map', {
    center: [63.43, 10.39],
    zoom: 14,
    zoomControl: true
  });
  map.zoomControl.setPosition('bottomright');

  L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(map);
draw.init();
db.getLayers();

// map.on('click', function(e){
//   //alert(e.latlng);
// });
}

main.map.getStyleAndAddToMap=function(layerName, layer, defaultLayer){
  db.getStyle(layerName, function(data){
    var styling=JSON.parse(data.responseText)[0].layerStyle;
    main.map.addLayer(layer, styling, layerName, defaultLayer);
    main.reorderLayers();
  });
};


main.map.addLayer=function(layer, styling, layerName, defaultLayer){
  var newLayer;
  if(layer.features[0].geometry.type === "Point"){
    var style = {
      // radius: styling.radius,
      radius: 3,
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
      style:{
        "fillColor": styling.color,
        "fillOpacity": styling.opacity,
        "weight": styling.weight,
        "color": styling.lineColor //stroke-color
      }
    }).addTo(map).on('click', function(e){
      console.log(e.layer);
    });
  }

  //add the layer to main.map.layers list:
  main.map.layers.push({
    name: layerName,
    layer: newLayer,
    geojsonLayer:layer,
    defaultLayer:defaultLayer,
    type: layer.features[0].geometry.type,
    active:true
  });

  return newLayer;
}


main.map.removeFromLeafletLayerList=function (layerName){
  for(var i=0; i<main.map.layers.length; i++){
    if(main.map.layers[i].name === layerName){
      main.map.layers.splice(i,1);
    }
  }
}


main.reorderLayers=function(){
  var layersInOrder=[];
  var listOfDomChildren=document.getElementById('menuLayerDropdown').childNodes;
  for(var i = 0; i<listOfDomChildren.length; i++){
    layersInOrder.push(listOfDomChildren[i].childNodes[0].innerHTML);
  }
  for(var j=layersInOrder.length-1; j>-1; j--){
    if(main.map.isActive(layersInOrder[j])){
      var l=main.getLeafletLayerFromName(layersInOrder[j]);
      if(l!==undefined){
        l.layer.bringToFront();
      }
    }
  }
}

main.map.isActive=function(layerName){
  for(var i=0; i<main.map.layers.length; i++){
    if(main.map.layers[i].name===layerName){
      return main.map.layers[i].active;
    }
  }
}

//--------------------COMMON TOOLS FUNCTIONS ----------------------------


function changeLayerDesign(layerName){

  main.map.resetStyleValues();

  main.map.activeStyleLayer=main.getLeafletLayerFromName(layerName).layer;
  main.map.activeStyleLayerName=layerName;

  $.ajax({ //gets all for specific user and project
    url:"getStyling",
    type:"post",
    dataType: "json",
    data:{
      projectName: project.current,
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


main.map.resetStyleValues=function(){
  main.map.activeStyleLayer=null;
  main.map.activeStyleLayerName="";
}

main.map.saveStyleChanges=function(){

  var color=document.getElementById('color').value;
  var opacity=document.getElementById('opacity').value;
  var lineWidth=document.getElementById('lineWidth').value;
  var lineColor=document.getElementById('lineColor').value;

  style={
    "color":color,
    "lineColor":lineColor,
    "opacity": opacity,
    "weight": lineWidth,
    "radius":4
  }

  db.deleteOldStyle(function(){
    db.saveLayerStyle(main.map.activeStyleLayerName, project.current, function(data){
      var layer;
      var geojsonLayer;
      for(var i=0; i<main.map.layers.length; i++){
        if(main.map.layers[i].name === main.map.activeStyleLayerName){
          layer=main.map.layers[i].layer;
          geojsonLayer=main.map.layers[i].geojsonLayer;
        }
      }
      map.removeLayer(layer);
      main.map.removeFromLeafletLayerList(main.map.activeStyleLayerName);
      main.map.addLayer(geojsonLayer, style, main.map.activeStyleLayerName);
      main.reorderLayers();
    });

    // main.map.updateView(); //TODO
    tools.dialog.popupClose();
  });
}

main.map.updateView=function(){

}

//----------------------------Main menu methods -------------------------------------

//checkbox action, activate and remove layers from map
main.menu.toggleLayerView=function(target){
  var layerName=target.className.split('fa-eye ')[1].split(' ')[0];

  for(var i=0; i<main.map.layers.length;i++){
    if(main.map.layers[i].name === layerName){
      if(main.map.layers[i].active == true){
        target.className="fa fa-eye "+layerName+" inactive";
        map.removeLayer(main.map.layers[i].layer);
        main.map.layers[i].active=false;

      }else{
        target.className="fa fa-eye "+layerName+" active";
        map.addLayer(main.map.layers[i].layer);
        main.map.layers[i].active=true;
      }
    }
  }
}

main.getLeafletLayerFromName=function(layerName){
  var layer;
  for(var i=0; i<main.map.layers.length; i++){
    if(main.map.layers[i].name === layerName){
      layer=main.map.layers[i];
    }
  }
  return layer;
}

main.map.removeLayerFromMapView=function(layerName){ //TODO: change name to removeLayer
  var layer=main.getLeafletLayerFromName(layerName);
  layer.active=false;
  map.removeLayer(layer);
};

main.map.addLayerToMapView=function(layer, layerName){
  var layer=getLeafletLayerFromName(layerName);
  layer.active=true;
  map.addLayer(layer);
};


//layerlist in main menu
main.menu.addToLayerList=function(newLayer, newSublayer){

  main.menu.activeLayers.push(newLayer);

  var link=document.createElement('a');
  link.innerHTML=newLayer;
  link.addEventListener("click",function(){
    main.menu.toggleLayerView(event.currentTarget.parentNode.children[1].children[0]);
    main.reorderLayers();
  });

  var checkbox=document.createElement('i');

  checkbox.className="fa fa-eye "+newLayer+" active";
  checkbox.setAttribute("checked","true");
  checkbox.setAttribute('aria-hidden','false');
  checkbox.addEventListener("click", function(){
    main.menu.toggleLayerView(event.currentTarget);
    main.reorderLayers();
  });

  var list=document.getElementById("menuLayerDropdown");
  var li=document.createElement('li');
  li.draggable="true";
  li.id=newLayer+"Li";
  li.appendChild(link);


  //enable drag and drop
  var sortable=Sortable.create(list,{
    animation:200,
    onUpdate: function(){
      main.reorderLayers();
    }
  });
  var btnDiv=document.createElement("div");
  var edit=document.createElement("img");
  edit.className="editLayer";
  edit.src="../images/edit-white.png";

  btnDiv.appendChild(checkbox);
  btnDiv.appendChild(edit);
  if(true){ //just while working to fast delete from database! :)
    //if(!newSublayer.defaultLayer){ //the default layers cannot be deleted
    edit.addEventListener("click", function(){ //call differenet api depending on default layer or not
      changeLayerDesign(newLayer);
    });

    var trash=document.createElement("img");
    trash.className=" trashLayer";
    trash.src="../images/trash.png";
    trash.addEventListener("click", function(){
      main.deleteLayer(newLayer);
    });
    btnDiv.appendChild(trash);
    btnDiv.className="btnDiv";
  }else{
    li.className="defaultLayer";
    edit.addEventListener("click", function(){
      changeLayerDesign(newLayer, true);
    });
  }
  li.appendChild(btnDiv);
  list.appendChild(li);
  main.reorderLayers();
}

main.deleteLayer=function(layerName){

  //Delete list element in menu
  var layerEl = document.getElementById(layerName+"Li");
  while (layerEl.firstChild) {
    layerEl.removeChild(layerEl.firstChild);
  }
  layerEl.remove();

  //Delete from map
  var layer;
  for(var i=0; i<main.map.layers.length; i++){
    if(main.map.layers[i].name === layerName){
      main.map.layers[i];
      map.removeLayer(main.map.layers[i].layer) //remove from map

      //Delete from DB
      if(main.map.layers[i].defaultLayer == false){
        //Delete from database
        $.ajax({
          url: "deleteLayer",
          type: 'DELETE',
          data: {
            layerName: layerName,
            projectName: project.current
          }
        });

        $.ajax({
          url: "deleteStyling",
          type: 'DELETE',
          data: {
            layerName: layerName,
            projectName: project.current
          }
        });
      }
      main.map.layers.splice(i,1);
      main.menu.activeLayers.splice(i,1);
    }
  }
}
