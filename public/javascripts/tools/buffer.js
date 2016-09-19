var buffer = {
    activeLayer: "",
    color: "",
    distance: ""
};

//action when buffer button click
buffer.run = function() {

    tools.dialog.popupClose($('#layerDropdown-content-buffer'));
    var target = document.getElementById('chosenBuffer');

    if (!fillAgain) {
        buffer.resetValues(target); //target is the buffer layer last chosen that needs to be reset
    } else {
        fillAgain = false;
    }

    var content = document.getElementById("layerDropdown-content-buffer");
    tools.dialog.createLayerDropdown(content);
    $("#overlay").show();
    $("#bufferPopUp").show();

    $(".contentLayer").click(function() {
        target.className = ""
        for (var i = 0; i < main.map.layers.length; i++) {
            if (main.map.layers[i].name === event.currentTarget.id) {
                buffer.activeLayer = main.map.layers[i];
            }
        }
        var chosenLayer = target;
        chosenLayer.innerHTML = buffer.activeLayer.name;
        chosenLayer.className = "chosenLayer";
        //Remove chosen layer when resetting values!
        tools.dialog.toggleClose(event.target, $('#layerDropdown-content-buffer'));
    });
}

buffer.create = function() {
    buffer.distance = $('#bufferDistance').val();
    buffer.color = $("#bufferColor").val();


    if (!Number(buffer.distance) > 0) { //input is of correct format
        alert("Buffer distance must be a number");
        fillAgain = true;
    } else if (buffer.activeLayer && buffer.color && buffer.distance) { //everything is filled out
        tools.dialog.popupClose($('#layerDropdown-content-buffer'));
        var newLayerName = buffer.activeLayer.name + '_buffer_' + buffer.distance;
        var layer = main.getLeafletLayerFromName(buffer.activeLayer.name);

        //if layer to create buffer from is default, get method is different
        var url;
        if (layer.defaultLayer == true) {
            url = "BufferDefaultGeojson";
        } else {
            url = "BufferGeojson";
        }

        var bufferObj = {
            layerName: buffer.activeLayer.name,
            bufferDistance: buffer.distance,
            projectName: project.current,
            newLayerName: newLayerName,
            bufferColor: buffer.color
        };
        console.log(bufferObj);
        common.addToolLayer(bufferObj, url, "POST", buffer.color, newLayerName);
    } else {
        alert('Fill out all fields first');
        fillAgain = true;
    }
}

buffer.resetValues = function(target) {
    buffer.activeLayer = null;

    $('#bufferDistance').val("");
    target.innerHTML = ("Choose layer from list");

    target.className = "";
    var arrow = document.createElement("span");
    arrow.className = "caret";
    target.appendChild(arrow);

    $("#bufferColor").val("#243CEE");
}
