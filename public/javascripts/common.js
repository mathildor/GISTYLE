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
  $.ajax({
    url:reqUrl,
    type:type,
    dataType: "json",
    data:dataObj,
    complete: function(data){
      console.log(data);
      //post to db and add to map
      if(JSON.parse(data.responseText).features[0].geometry===undefined && reqUrl ==="/intersect"){//if intersection exist
        alert("There is no intersection between the chosen layers.");
      }else{
        if(reqUrl==="buffer"){
          //Test projections:
          var projectedJson=main.projectCoordinates(JSON.parse(data.responseText));
        }
        var styling=common.getStylingObj(color);
        // var layer=main.map.addLayer(JSON.parse(data.responseText), styling, newLayerName, false);
        var layer=main.map.addLayer(projectedJson, styling, newLayerName, false);
        main.menu.addToLayerList(newLayerName, layer);
      }
    }
  });
}

main.projectCoordinates=function(json){
  // var projBuffer=proj4(fromProjection[, toProjection, buffered);
  console.log(json);

  for(var i=0; i<json.features.length; i++){
    //TODO: might need to flip the coordinates here
    //loop through all the coordinates, make new coord array and replace it whith the one in current feature
    var projCoords=[];
    var coords=json.features[i].geometry.coordinates;
    for(var j=0; j<coords.length; j++ ){
      projCoords.push(proj4(proj4.defs('EPSG:3785'), [ proj4.defs('EPSG:4326') , coords[j]);
    }
    json.features[i].geometry.coordinates=projCoords;
  }
  return json;
}
