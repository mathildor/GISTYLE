var intersection = {
    activeArea: null,
    activeOutput: null
};

intersection.run = function() {

    //Reset prev chosen layers
    var area = document.getElementById('chosenAreaIntersect');
    var output = document.getElementById('chosenOutputIntersect');

    if (!fillAgain) {
        intersection.resetValues(area);
        intersection.resetValues(output);
    } else {
        fillAgain = false;
    }

    var contentArea = document.getElementById("layerDropdown-content-area-intersect");
    var validTypes = ["Polygon"];
    tools.dialog.createLayerDropdown(contentArea, validTypes);

    var contentOutput = document.getElementById("layerDropdown-content-output-intersect");
    tools.dialog.createLayerDropdown(contentOutput, validTypes);

    $("#overlay").show();
    $("#intersectPopUp").show();

    $(".contentLayer").click(function() {

        //check if pushed layer is from area or output!
        if (event.target.parentElement.parentElement.id === "layerDropdown-content-area-intersect") {
            intersection.activeArea = event.target.id;
            area.innerHTML = intersection.activeArea;
            area.className = "chosenLayer";
            //when first layer is chosen, remove the layer from the other list

        } else {
            intersection.activeOutput = event.target.id;
            output.innerHTML = intersection.activeOutput;
            output.className = "chosenLayer";
        }

        //Remove chosen layer when resetting values!
        tools.dialog.toggleClose(event.target, $('#layerDropdown-content-area-intersect'));
        tools.dialog.toggleClose(event.target, $('#layerDropdown-content-output-intersect'));
    });
}

intersection.addSecondLayer = function(content2, type, chosen) {
    var target2 = document.getElementById('chosenOutputIntersect');
    tools.dialog.createLayerDropdown(content2, [type], chosen);
    $(".contentLayer").click(function() {
        intersection.activeOutput = (event.target.id);
        var chosenLayer = target2;
        chosenLayer.innerHTML = intersection.activeOutput;
        chosenLayer.className = "chosenLayer";

        //Remove chosen layer when resetting values!
        tools.dialog.toggleClose(event.target, $('#layerDropdown-content-output-intersect'));
    });
}

intersection.create = function() {
    tools.dialog.popupClose($('#layerDropdown-content-area-intersect'));
    tools.dialog.popupClose($('#layerDropdown-content-output-intersect'));

    var intLayerName = $('#intersectLayerName').val();
    var intColor = $("#intersectColor").val();

    //check if everything is filled out
    if (intersection.activeArea && intersection.activeOutput && intColor && intLayerName) {

        var outputLayer = main.getLeafletLayerFromName(intersection.activeOutput);
        var inputLayer = main.getLeafletLayerFromName(intersection.activeArea);

        var intObj = {
            projectName: project.current,
            inputArea: intersection.activeArea,
            inputType: inputLayer.type,
            inputDefault: inputLayer.defaultLayer,
            outputLayer: intersection.activeOutput,
            outputType: outputLayer.type,
            outputDefault: outputLayer.defaultLayer,
            color: intColor,
            newLayerName: intLayerName
        };
        common.addToolLayer(intObj, "/intersect", "POST", intColor, intLayerName);

    } else {
        alert('Fill out all fields first');
        fillAgain = true;
    }
}

intersection.resetValues = function(target) {
    //delete chosenLayers from last used
    var ul = target;
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    $('#intersectLayerName').val("");

    //Set default text and styling for dropdown menus
    target.innerHTML = ("Choose layer from list");
    target.className = "";
    var arrow = document.createElement("span");
    arrow.className = "caret";
    target.appendChild(arrow);

    $("#intersectColor").val("#243CEE");

    intersection.activeArea = null;
    intersection.activeOutput = null;
}
