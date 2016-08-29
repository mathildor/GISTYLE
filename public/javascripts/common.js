var common={};

common.getStylingObj=function(color){
  var styling={
    color: color,
    weight: 3,
    opacity: 0.4,
    radius:3,
    lineColor:color
  }
  return styling;
}

// tools.common.create=function(dataObj, url, type, color, newLayerName){
common.addToolLayer=function(dataObj, reqUrl, type, color, newLayerName){
  console.log(reqUrl);
  newLayerName=common.getUnusedLayerName(newLayerName);
  dataObj.newLayerName=newLayerName;
  $.ajax({
    url:reqUrl,
    type:type,
    dataType: "json",
    data:dataObj,
    complete: function(data){
      //post to db and add to map
      // if(JSON.parse(data.responseText).features[0].geometry===undefined){//if intersection exist
      if(JSON.parse(data.responseText).features[0]===undefined){//if intersection exist
        alert(reqUrl+" gave no result for the chosen layers.");
      }else{
        // if(reqUrl==="BufferDefaultGeojson"){
        //   //Test projections:
        //   var projectedJson=projectCoordinates(JSON.parse(data.responseText));
        // }
        var styling=common.getStylingObj(color);
        console.log(JSON.parse(data.responseText));

        var layer=main.map.addLayer(JSON.parse(data.responseText), styling, newLayerName, false);
        //var layer=main.map.addLayer(projectedJson, styling, newLayerName, false);
        main.menu.addToLayerList(newLayerName, layer);
      }
    }
  });
}

common.getUnusedLayerName=function(name){
  var nameTaken=true;
  var count=1;
  var newName=name;
  while(nameTaken){
    console.log("Name taken?");
    console.log(main.menu.activeLayers);
    if(common.exsistsInList(main.menu.activeLayers, newName)){
      console.log("already in list, need to change to:");
      newName=name+"_"+count;
      count++;
      console.log(newName);
    }else{
      console.log("Name does not exist");
      console.log(newName);
      nameTaken=false;
      return newName;
    }
  }
}

projectCoordinates=function(json){
  // var projBuffer=proj4(fromProjection[, toProjection, buffered);
  console.log(json.features[0].geometry.coordinates[0][0]);

  for(var i=0; i<json.features.length; i++){
    //TODO: might need to flip the coordinates here
    //loop through all the coordinates, make new coord array and replace it whith the one in current feature
    var projCoords=[];
    var coords=json.features[i].geometry.coordinates;
    for(var j=0; j<coords[0].length; j++ ){
      var toProj=proj4.defs('EPSG:3785');
      var fromProj=proj4.defs('EPSG:4326');
      var projCoord=proj4(fromProj, toProj ,coords[0][j] );
      // console.log(projCoord);
      projCoords.push(projCoord);
    }
    json.features[i].geometry.coordinates[0]=projCoords;
    // console.log(projCoords);
  }
  console.log(json.features[0].geometry.coordinates[0][0]);
  return json;
}

common.exsistsInList=function(list, element){
  if(list == undefined){
    return(false);
  }
  for (var i = 0; i < list.length; i++) {
    if(list[i]==element){
      return(true);
    }
  }
  return(false);
}
