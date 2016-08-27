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
      //post to db and add to map
      if(JSON.parse(data.responseText).features[0].geometry===undefined && reqUrl ==="/intersect"){//if intersection exist
        alert("There is no intersection between the chosen layers.");
      }else{
        var styling=common.getStylingObj(color);
        var layer=main.map.addLayer(JSON.parse(data.responseText), styling, newLayerName, false);
        main.menu.addToLayerList(newLayerName, layer);
      }
    }
  });
}
