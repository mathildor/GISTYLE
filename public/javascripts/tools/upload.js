var upload={};


upload.newLayer=function(){
  $("#uploadPopUp").show();
  $("#overlay").show();
}

upload.run=function(){
  //get file from user

  $("#uploadPopUp").hide();
  $("#overlay").hide();

  var color=document.getElementById('newLayerColor').value;
  var layerName=document.getElementById('uploaded-layer-name').value;
  var file = document.getElementById('inputFile').files[0];

  var reader = new FileReader();
  var text;
  reader.onload = function(e) {
    text = reader.result;
    console.log("Uploaded layer is:");
    console.log(JSON.parse(text));
    var layerFeatures = JSON.parse(text).features;
    //Create own layer for each type in featureCollection - can for example be both polygons and points!
    console.log(layerFeatures);
    console.log(layerFeatures.length);
    var existingTypes=[];
    var features={};
    for(var i=0; i<layerFeatures.length; i++){
      if(!common.exsistsInList(existingTypes, layerFeatures[i].geometry.type)){ //if first time this type is detected
        //create new featuer list obj for this type
        existingTypes.push(layerFeatures[i].geometry.type);
        features[layerFeatures[i].geometry.type]=[];
      }
      //add to correct featureCollection depending on type
      console.log("push to correct list, feature:");
      console.log(layerFeatures[i]);
      features[layerFeatures[i].geometry.type].push(layerFeatures[i]);
      console.log("added, and features of type looks like:");
      console.log(features[layerFeatures[i].geometry.type]);
    }
    console.log("Outside for loop! All features placed in correct list");
    console.log(features);
    for(var list in features){
      upload.uploadGeoJson(project.current, features[list], layerName+"-"+list, color);
    }
  }
  reader.readAsText(file);
}

upload.uploadGeoJson=function(projectName, layerFeatures, layerName, color){

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

    $.ajax({
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
      var layer=main.map.addLayer(JSON.parse(geolayerData.responseText), styling, layerName, false);
      main.menu.addToLayerList(layerName, layer);
    });
  });
}
