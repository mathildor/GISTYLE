
/* Controllers:    */


var gisControllers = angular.module('gisControllers', []);

//Defining controller: ButtonController:
gisControllers.controller('ButtonController', function($scope){

    $scope.buttons = [
        {'name': 'Add Layer'},
        {'name': 'buffer'},
        {'name': 'intersection'}
    ];
});

//Can save dependencies in controller.$inject, or send in


gisControllers.controller('LayerController', ['$scope', '$http', function($scope, $http) {

    $http.get('layers.json').success(function(data){
        $scope.layers=data;
    })
}]);




/*
gisControllers.controller('DetailController',['$scope', '$routeParams',
function($scope, $routeParams){
    //$scope.name=$routeParams.name;
}]);
    */