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
      if(JSON.parse(data.responseText).features[0]===undefined){//if intersection exist
        alert(reqUrl+" gave no result for the chosen layers.");
      }else{
        var styling=common.getStylingObj(color);
        var layer=main.map.addLayer(JSON.parse(data.responseText), styling, newLayerName, false);
        console.log(layer);
        main.menu.addToLayerList(newLayerName, layer);
      }
    }
  });
}

common.getActiveLayersList=function(){
  var layers=[];
  console.log(main.map.layers[0]);
  console.log(main.map.layers[0].name);
  for(var i=0; i<main.map.layers.length; i++){
    console.log(main.map.layers[i].name);
    layers.push(main.map.layers[i].name);
  }
  return layers;
}

common.getUnusedLayerName=function(name){
  var nameTaken=true;
  var count=1;
  var newName=name;
  while(nameTaken){
    console.log("Name taken?");
    console.log(main.map.layers);
    var activeLayers=common.getActiveLayersList();
    console.log(activeLayers);
    if(common.exsistsInList(activeLayers, newName)){
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

common.exsistsInList=function(list, element){
  if(list == undefined){
    console.log("List is not defined");
    return(false);
  }
  for (var i = 0; i <list.length; i++) {
    if(list[i]===element){
      return(true);
    }
  }
  return(false);
}
