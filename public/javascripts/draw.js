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
    drawnLayerName=common.getUnusedLayerName(drawnLayerName);
    $('#overlay').hide();
    $('#nameForDrawnLayerPopup').hide();

    var featureObj=[layer.toGeoJSON()];
    var geoJson={
      defaultLayer:false,
      layerName:drawnLayerName,
      type: "FeatureCollection",
      features:featureObj
    };
    console.log(featureObj);
    console.log(layer);
    //add the layer to leafletLayers list:
    main.map.layers.push({
      name: drawnLayerName,
      layer: layer,
      geojsonLayer:geoJson,
      defaultLayer:false,
      type: 'Polygon',
      active:true
    });
    console.log(main.map.layers);

    main.menu.addToLayerList(drawnLayerName,layer);
    var style=draw.getStyleObj(layer);

    draw.saveToDb(featureObj, drawnLayerName, style);

  });
}

draw.getStyleObj=function(layer){
  return style={
    color: layer.options.color,
    lineColor: layer.options.color,
    opacity: layer.options.fillOpacity,
    weight: layer.options.weight,
    radius: 3
  };
}

draw.saveToDb=function(featureObj, drawnLayerName, style){
  // console.log(main.getLeafletLayerFromName(drawnLayerName));
  db.saveLeafletLayer(main.getLeafletLayerFromName(drawnLayerName), drawnLayerName);

  //save style
  $.ajax({
    url:'layerStyling',
    type: 'post',
    data:{
      layerName:drawnLayerName ,
      projectName: project.current,
      layerStyle: JSON.stringify(style)
    }
  });
}
