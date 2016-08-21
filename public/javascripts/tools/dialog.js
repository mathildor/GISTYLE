
// class for all things that has to do with the dialog boxes for different tools
var tools={
  dialog:{}
};

tools.dialog.createLayerDropdown=function(div, type, alreadyChosen){

  //type contains the only type that should be in dropdown:
  console.log("already chosen, if has one: "+alreadyChosen);
  console.log("Type valid, if one defined: "+type);
  while (div.firstChild) {
    div.removeChild(div.firstChild);
  }

  var validTypes=[];
  if(type==null){
    validTypes=["Point","MultiPoint", "Polygon", "MultiPolygon", "LineString", "MultiLineString", "Positions"];
  }else{
    for(var i=0; i<type.length; i++){
      validTypes.push(type[i]);
      validTypes.push('Multi'+type[i]);
    }
  }

  //check if layer has valid type and is not already chosen
  for(var j=0; j<main.map.layers.length;j++) {
    for(var k=0; k<validTypes.length;k++) {
      if(main.map.layers[j].type === validTypes[k]) {

        //check if not already chosen
        if(main.map.layers[j].name !== alreadyChosen){
          //console.log(main.map.layers[i].type+' is added when type is: '+type);
          var li = document.createElement("li");
          li.className='contentLi';
          var link = document.createElement("a");
          link.className = "contentLayer";
          link.id = main.map.layers[j].name;
          var txt = document.createTextNode(main.map.layers[j].name);
          link.appendChild(txt);
          li.appendChild(link);
          div.appendChild(li);
        }
      }
    }
  }
}

tools.dialog.popupClose=function(target){
  $("#overlay").hide();
  $(".dialog").hide();
  tools.dialog.toggleClose(event.target, target); //closing layer menu if open
}


tools.dialog.toggle=function(target){
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
tools.dialog.toggleClose=function(menu, target){
  try{
    target.hide();
    menu.setAttribute('value', 'close');
  }catch(err){
    console.log('no target');
  }
}
