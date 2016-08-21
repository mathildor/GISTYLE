
var within={
  activeArea:"",
  activeOutput:""
};


within.run=function(){

  //tools.dialog.popupClose($('#layerDropdown-content-area-within'));
  //tools.dialog.popupClose($('#layerDropdown-content-output-within'));

  //Reset prev chosen layers
  var area=document.getElementById('chosenAreaWithin');
  var output=document.getElementById('chosenOutputWithin');

  if(!fillAgain){
    within.resetValues(area);
    within.resetValues(output);
  }else{
    fillAgain=false;
  }


  var contentArea=document.getElementById("layerDropdown-content-area-within");
  var validTypes=["Polygon", "Point"];
  tools.dialog.createLayerDropdown(contentArea, validTypes);

  var contentOutput=document.getElementById("layerDropdown-content-output-within");
  tools.dialog.createLayerDropdown(contentOutput);

  $("#overlay").show();
  $("#withinPopUp").show();

  $(".contentLayer").click(function(){

    //check if pushed layer is from area or output!
    if(event.target.parentElement.parentElement.id === "layerDropdown-content-area-within"){
      within.activeArea=event.target.id;
      area.innerHTML=within.activeArea;
      area.className="chosenLayer";
      //when first layer is chosen, remove the layer from the other list

    }else{
      within.activeOutput=event.target.id;
      output.innerHTML=within.activeOutput;
      output.className="chosenLayer";
    }

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-area-within'));
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-output-within'));
  });
}


within.addSecondLayer=function(content2, type, chosen){ //TODO ever used?
  var target2=document.getElementById('chosenOutputWithin');
  tools.dialog.createLayerDropdown(content2, [type], chosen);
  $(".contentLayer").click(function(){
    within.activeOutput=(event.target.id);
    var chosenLayer=target2;
    chosenLayer.innerHTML=within.activeOutput;
    chosenLayer.className="chosenLayer";

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-output-within'));
  });
}

within.create=function(){

  tools.dialog.popupClose($('#layerDropdown-content-area-within'));
  tools.dialog.popupClose($('#layerDropdown-content-output-within'));


  var withinLayerName=$('#withinLayerName').val();
  var withinColor=$("#withinColor").val();

  //check if everything is filled out
  if(within.activeArea && within.activeOutput && withinColor && withinLayerName){

    var outputLayer=main.getLeafletLayerFromName(within.activeOutput);
    var inputLayer=main.getLeafletLayerFromName(within.activeArea);

    var withinObj={
      projectName:project.current,
      inputArea: within.activeArea,
      inputType:inputLayer.type,
      inputDefault:inputLayer.defaultLayer,
      outputLayer: within.activeOutput,
      outputType:outputLayer.type,
      outputDefault:outputLayer.defaultLayer,
      color: withinColor,
      newLayerName: withinLayerName
    };
    common.addToolLayer(withinObj, "/within", "POST", withinColor, withinLayerName);

  }else{
    alert('Fill out all fields first');
    fillAgain=true;
  }
}


within.resetValues=function(target){

  //delete chosenLayers from last used
  var ul=target;
  while (ul.firstChild) {
    ul.removeChild(ul.firstChild);
  }

  $('#withinName').val("");

  //Set default text and styling for dropdown menus
  target.innerHTML=("Choose layer from list");
  target.className="";
  var arrow=document.createElement("span");
  arrow.className="caret";
  target.appendChild(arrow);

  $("#withinColor").val("#243CEE");

  within.activeArea=null;
  within.activeOutput=null;
}
