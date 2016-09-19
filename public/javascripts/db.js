var db = {};

db.saveLayerStyle = function(layerName, projectName, callback) {
    $.ajax({ //gets all for specific user and project
        url: "layerStyling",
        type: "post",
        dataType: "json",
        data: {
            projectName: projectName,
            layerName: layerName,
            layerStyle: JSON.stringify(style)
        },
        complete: function(data, style) {
            callback(data);
        }
    });
}

db.getStyle = function(layerName, callback) {
    $.ajax({ //gets all for specific user and project
        url: "getStyling",
        type: "post",
        dataType: "json",
        data: {
            projectName: project.current,
            layerName: layerName,
        },
        complete: function(data) {
            callback(data);
        }
    });
}

db.getLayer = function(layername, callback) {
    $.ajax({ //gets all for specific user and project
        url: "getStyling",
        type: "post",
        dataType: "json",
        data: {
            projectName: project.current,
            layerName: layerName,
        },
        complete: function(data) {
            callback(data);
        }
    });
}

db.getDefaultLayers = function(callback) {
    $.ajax({
        url: "defaultGeojsons",
        type: "get",
        dataType: "json",
        data: {},
        complete: function(data) {
            callback(data);
        }
    });
};

db.getLayersForProject = function(callback) {
    $.ajax({ //gets all for specific user and project
        url: "geojsons",
        type: "post",
        dataType: "json",
        data: {
            projectName: project.current
        },
        complete: function(data) {
            callback(data);
        }
    });
}

db.getLayers = function() {
    main.map.layers = [];
    db.getDefaultLayers(function(data) {
        var layerStyle;
        var layers = JSON.parse(data.responseText);
        var i;
        for (i = 0; i < layers.length; i++) {
            main.map.getStyleAndAddToMap(layers[i].layerName, layers[i], true);
            var newLayer = {
                name: layers[i].layerName
            }
            main.menu.addToLayerList(newLayer.name, newLayer);
        }

        db.getLayersForProject(function(data) {
            if (data.status === 500) { //user not logged in
                window.location = "/#login";
            }
            //go through all layers and add them:
            var layerStyle;
            var layers = JSON.parse(data.responseText);
            var i;
            for (i = 0; i < layers.length; i++) {
                main.map.getStyleAndAddToMap(layers[i].layerName, layers[i], false);
                var newLayer = {
                    name: layers[i].layerName
                }
                main.menu.addToLayerList(newLayer.name, newLayer);
            }
        });

    });


}

db.deleteOldStyle = function(callback) {
    $.ajax({
        url: "deleteStyling",
        type: "delete",
        dataType: "json",
        data: {
            projectName: project.current,
            layerName: main.map.activeStyleLayerName
        },
        complete: function(data) {
            callback(data);
        }
    });
}

db.saveLeafletLayer = function(geoLayer, layerName) { //used when saving drawn polygons
    $.ajax({
        "url": "saveGeojson",
        "type": "post",
        "data": {
            layerName: layerName,
            projectName: project.current,
            defaultLayer: false,
            features: JSON.stringify(geoLayer.geojsonLayer.features)
        }
    });
}
