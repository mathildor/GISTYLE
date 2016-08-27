
var difference={
  active1:"",
  active2:""
};


//-------------------------DIFFERENCE------------------------

difference.run=function(){
  $("#differenceColor").val("#243CEE");
  $('#differenceLayerName').val("");


  var target1=document.getElementById('chosenDifference1');
  var target2=document.getElementById('chosenDifference2');
  difference.resetValuesForLayer(target1);
  difference.resetValuesForLayer(target2);

  $("#overlay").show();
  $("#differencePopUp").show();

  var content1=document.getElementById("layerDropdown-content-difference1");
  var content2=document.getElementById("layerDropdown-content-difference2");

  tools.dialog.createLayerDropdown(content1, ["Polygon"]);

  $(".contentLayer").click(function(){
    difference.active1=(event.target.id);
    var chosenLayer=target1;
    chosenLayer.innerHTML=difference.active1;
    chosenLayer.className="chosenLayer";

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-difference1'));
    var firstSublayer=main.getLeafletLayerFromName(difference.active1);
    difference.resetValuesForLayer(target2);
    difference.addSecondLayer(content2, "Polygon", firstSublayer.name);
  });
}

difference.addSecondLayer=function (content2, type, chosen){
  var target2=document.getElementById('chosenDifference2');
  tools.dialog.createLayerDropdown(content2, [type], chosen);
  $(".contentLayer").click(function(){
    difference.active2=(event.target.id);
    var chosenLayer=target2;
    chosenLayer.innerHTML=difference.active2;
    chosenLayer.className="chosenLayer";

    //Remove chosen layer when resetting values!
    tools.dialog.toggleClose(event.target, $('#layerDropdown-content-difference2'));
  });
}

difference.create=function(){

  var diffLayerName=$('#differenceLayerName').val();
  var diffColor=$("#differenceColor").val();

  //check if everything is filled out
  var layer1= main.getLeafletLayerFromName(difference.active1);
  var layer2= main.getLeafletLayerFromName(difference.active2);

  if(difference.active1 && difference.active2 && diffColor && diffLayerName && (layer1.type === layer2.type)){

    tools.dialog.popupClose($('#layerDropdown-content-difference2'));
    tools.dialog.popupClose($('#layerDropdown-content-difference1'));
    var diffObj={
      projectName:project.current,
      layer1name: difference.active1,
      layer1default: layer1.defaultLayer,
      layer2name:difference.active2,
      layer2default: layer2.defaultLayer,
      color: diffColor,
      newLayerName: diffLayerName
    };
    console.log(diffObj);
    common.addToolLayer(diffObj, "difference", "POST", diffColor, diffLayerName);

  }else{
    alert('Fill out all fields first, and make sure that the two inputs are of same type, example polygon');
  }
  //when created, empty fields:
  difference.active2=null;
  difference.active1=null;
  intColor=null;
  intLayerName=null;

}


difference.resetValuesForLayer=function(target){
  target.innerHTML=("Choose layer from list");
  target.className="";

  var arrow=document.createElement("span");
  arrow.className="caret";
  target.appendChild(arrow);
}
