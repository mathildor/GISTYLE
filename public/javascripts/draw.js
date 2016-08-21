var draw={};


draw.init=function(){
  draw.addController();
  // Initialise the FeatureGroup to store editable layers
  var drawnItems = new L.FeatureGroup();
  map.addLayer(drawnItems);
  map.on('draw:created', function (e) {
    var type = e.layerType,
    layer = e.layer,
    drawnLayerName;
    draw.getUserInfoForDrawnElement(drawnLayerName, layer);
    drawnItems.addLayer(layer);
  });
}

draw.addController=function(){
  // Initialize the draw control and pass it the FeatureGroup of editable layers
  var drawControl = new L.Control.Draw({
    position:'bottomright',
    //Adding only support for drawing polygons:
    draw:{
      polyline:false,
      rectangle:false,
      circle:false,
      polyline: false,
      marker:false
    }
  });
  map.addControl(drawControl);
}



draw.getUserInfoForDrawnElement=function(drawnLayerName, layer){
  //User sets name for the layer created:
  $('#overlay').show();
  $('#nameForDrawnLayerPopup').show();
  //on click: close and save the name inserted by user

  $("#saveDrawnLayerName").click(function() {
    drawnLayerName = $('#drawnLayerName').val();
    $('#overlay').hide();
    $('#nameForDrawnLayerPopup').hide();

    var featureObj=[layer.toGeoJSON()];

    //add the layer to leafletLayers list:
    leafletLayers.push({
      name: drawnLayerName,
      layer: layer,
      geojsonLayer:featureObj,
      defaultLayer:false,
      type: 'Polygon',
      active:true
    });
    addToLayerList(drawnLayerName,layer);
    var style=draw.getStyleObj(layer);

    draw.saveToDb(featureObj, drawnLayerName, style);

  });
}

draw.getStyleObj=function(){
  return style={
    color: layer.options.color,
    lineColor: layer.options.color,
    opacity: layer.options.fillOpacity,
    weight: layer.options.weight,
    radius: 3
  };
}

draw.saveToDb=function(featureObj, drawnLayerName, style){
  saveLeafletLayerToDB(featureObj, drawnLayerName);

  //save style
  $.ajax({
    url:'layerStyling',
    type: 'post',
    data:{
      layerName:drawnLayerName ,
      projectName: projectName,
      layerStyle: JSON.stringify(style)
    }
  });
}
