
var merge={
  activeLayer1:"",
  activeLayer2:""
};

//----------------------------MERGE----------------------------

merge.run=function(){

  if(!fillAgain){
    $("#mergeColor").val("#243CEE");
    $('#mergeLayerName').val("");
  }else{
    fillAgain=false;
  }

  tools.dialog.popupClose($('#layerDropdown-content-merge1'));
  tools.dialog.popupClose($('#layerDropdown-content-merge2'));


  var target1=document.getElementById('chosenMerge1');
  var target2=document.getElementById('chosenMerge2');
  merge.resetValuesForLayer(target1);
  merge.resetValuesForLayer(target2);

  $("#overlay").show();
  $("#mergePopUp").show();

  var content1=document.getElementById("layerDropdown-content-merge1");
  var content2=document.getElementById("layerDropdown-content-merge2");

  tools.dialog.createLayerDropdown(content1);

  $(".contentLi").click(function(event){
    console.log(event.currentTarget.firstChild);
    var active= event.currentTarget.firstChild;
    merge.activeLayer1=event.currentTarget.firstChild.id;
    var chosenLayer=target1;
    chosenLayer.innerHTML=merge.activeLayer1;
    chosenLayer.className="chosenLayer";

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(active, $('#layerDropdown-content-merge1'));
    var firstLayer=main.getLeafletLayerFromName(merge.activeLayer1);
    merge.resetValuesForSecondLayer(document.getElementById('chosenMerge2'));
    merge.addSecondLayer(content2, firstLayer.type, firstLayer.name);
  });
}

merge.addSecondLayer=function(content2, type, chosen){
  var target2=document.getElementById('chosenMerge2');
  tools.dialog.createLayerDropdown(content2, [type], chosen);
  $(".contentLayer").click(function(event){
    console.log(event.target);
    merge.activeLayer2=(event.target.id);
    var chosenLayer=target2;
    chosenLayer.innerHTML=merge.activeLayer2;
    chosenLayer.className="chosenLayer";

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-merge2'));
  });
}

merge.create=function(){

  if(!fillAgain) { //unless failed filling info last time
    var mergeLayerName = $('#mergeLayerName').val();
    var mergeColor = $("#mergeColor").val();
  }

  //check if everything is filled out
  //ops, multipolygon should be included!
  //if(merge.activeLayer1 && merge.activeLayer2 && mergeColor && mergeLayerName && (layer1.type === layer2.type)){
  if(merge.activeLayer1 && merge.activeLayer2 && mergeColor && mergeLayerName){

    var layer1= main.getLeafletLayerFromName(merge.activeLayer1);
    var layer2= main.getLeafletLayerFromName(merge.activeLayer2);

    tools.dialog.popupClose($('#layerDropdown-content-merge'));
    var mergeObj={
      layer1:merge.activeLayer1,
      layer2:merge.activeLayer2,
      default1: layer1.defaultLayer,
      default2: layer2.defaultLayer,
      color:mergeColor,
      newLayerName: mergeLayerName,
      projectName:project.current
    };
    common.addToolLayer(mergeObj, "merge", "POST", mergeColor, mergeLayerName);
  }else{
    alert('Fill out all fields first, and make sure that the two inputs are of same type, example polygon');
    fillAgain=true;
  }
  //when created, empty fields:
  mergeColor=null;
  mergeLayerName=null;
}


merge.resetValuesForLayer=function(target){
  document.getElementById(target.id).innerHTML="choose layer from list";
  var arrow=document.createElement("span");
  arrow.className="caret";
  target.appendChild(arrow);

  //when created, empty fields:
  merge.activeLayer1=null;
  merge.activeLayer2=null;

}
merge.resetValuesForSecondLayer=function(target){
  document.getElementById(target.id).innerHTML="choose layer from list";
  var arrow=document.createElement("span");
  arrow.className="caret";
  target.appendChild(arrow);

  //when created, empty fields:
  merge.activeLayer2=null;

}
