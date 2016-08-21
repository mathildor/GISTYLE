//----------------------------CLIP----------------------------
//var clip.activeInputLayer;
//var clip.activeClipLayer;
var clip={
  activeInputLayer:"",
  activeClipLayer:""
};

clip.run=function(){//het clip
  var targetInput=document.getElementById('chosenClipInputLayer');
  var targetClip=document.getElementById('chosenClipClipLayer');
  clip.resetValues(targetInput, targetClip);

  var contentInputlayer=document.getElementById("layerDropdown-content-clip-inputlayer");
  tools.dialog.createLayerDropdown(contentInputlayer);

  var contentCliplayer=document.getElementById("layerDropdown-content-clip-cliplayer");
  tools.dialog.createLayerDropdown(contentCliplayer);

  $("#overlay").show();
  $("#clipPopUp").show();

  $(".contentLayer").click(function(){
    var id= event.target.parentElement.parentElement.id;
    var typeOfClipLayer=id.split('clip-')[1];
    clip.addActiveLayer(event.target, id);
    var chosenLayer=target;
    if(typeOfClipLayer==='input'){
      chosenLayer.innerHTML=clip.activeInputLayer;
    }else{
      chosenLayer.innerHTML=clip.activeClipLayer;
    }
    chosenLayer.className="chosenLayer";

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-clip-cliplayer'));
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-clip-inputlayer'));
  });
}

clip.create=function(){

  var intLayerName=$('#clipLayerName').val();
  var intColor=$("#clipColor").val();

  //check if everything is filled out
  if(clip.activeInputLayer && clip.activeClipLayer && intColor && intLayerName){

    var sublayerObj=clip.createSql(clip.activeInputLayer, clip.activeClipLayer, intColor, intLayerName);

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
    tools.dialog.popupClose($('#layerDropdown-content-cliplayer'));
    tools.dialog.popupClose($('#layerDropdown-content-inputlayer'));
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
      projectName:project.current
    }
  ).complete(function(){
    console.log("completed");
  });

}else{
  alert('Fill out all fields first');
}
//when created, empty fields:
clip.activeInputLayer=null;
clip.activeClipLayer=null;
intColor=null;
intLayerName=null;
}

clip.createSql = function(layerInputName,layerClipName, color){

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
clip.addActiveLayer=function(element, id){ //element is the html-element

  var typeOfClipLayer=id.split('clip_')[1];

  if(typeOfClipLayer === 'inputlayer'){  //if input layer
    clip.activeInputLayer=element.id;
  }else { //clip layer
    clip.activeClipLayer=element.id; //add to active list
  }
  var li=document.createElement('li');
  li.className="li-layer";

  var name=document.createElement('h2');
  name.className="chosenLayer";
  name.innerHTML=element.id;

  var trashLink= document.createElement('a');
  trashLink.className="trash";
  trashLink.addEventListener("click", function(){
    clip.removeActiveLayer(typeOfClipLayer);
  });
  var trashImg= document.createElement('img');
  trashImg.src="../../images/trash-black.png";
  trashLink.appendChild(trashImg);

  li.appendChild(name);
  li.appendChild(trashLink);

  document.getElementById('chosenLayersClip').appendChild(li);
}

//remove layer from "chosen layers" list - trashcan event
clip.removeActiveLayer=function(typeOfClipLayer){
  var li=event.target.parentElement.parentElement;
  var layerName=li.firstChild;

  if(typeOfClipLayer==='inputlayer'){
    clip.activeInputLayer=null;
  }else{
    clip.activeClipLayer=null;
  }

  while (li.firstChild) {
    li.removeChild(li.firstChild);
  }
  li.remove();
}

clip.resetValues=function(targetInput, targetClip){

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
