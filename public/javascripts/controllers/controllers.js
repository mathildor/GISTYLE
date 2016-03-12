


var gisControllers = angular.module('gisControllers', ['leaflet-directive']);

//Defining controller: ButtonController:
gisControllers.controller('ButtonController', function($scope){

    $scope.buttons = [
        {'name': 'Add Layer'},
        {'name': 'buffer'},
        {'name': 'intersection'}
    ];
});

//Can save dependencies in controller.$inject, or send in


gisControllers.controller("cartoController", ["$scope", "$http", function($scope, $http){


    var map;
    function init(){
        // initiate leaflet map
        map = new L.Map('cartodb-map', {
            center: [0,0],
            zoom: 2
        });

        var layerUrl = 'http://documentation.cartodb.com/api/v2/viz/836e37ca-085a-11e4-8834-0edbca4b5057/viz.json';

        cartodb.createLayer(map, layerUrl)
            .addTo(map)
            .on('done', function(layer) {

            }).on('error', function() {
            //log the error
        });
    }

}]);


/*
gisControllers.controller("mapController", [ "$scope", '$http', "leafletData", function($scope, $http, leafletData) {


    angular.extend($scope, {
        defaults:{
            zoomControlPosition: 'bottomright'
        },
        trd: {
            lat: 63.387523,
            lng: 10.39066,
            zoom: 11
        },
        layers:{
            baselayers:{
                osm: {
                    name: 'OpenStreetMap',
                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    type: 'xyz'
                },
            },
            overlays:{}
        }
    });

    $http.get('/user/layer')
        .success(function(data, status){
            console.log('success in get req');
            angular.extend($scope.layers.overlays, {
                countries: {
                    name:'World Country Boundaries',
                    type: 'geoJSONShape',
                    data: data,
                    visible: true,
                    layerOptions: {
                        style: {
                            color: '#00D',
                            fillColor: 'yellow',
                            weight: 2.0,
                            opacity: 0.6,
                            fillOpacity: 0.2
                        }
                    }
                }
            });
        })
        .error(function (data) {
            console.log('error getting layer');
        });



    $scope.fitBounds = function() {
        leafletData.getMap().then(function(map) {
            //map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);
        });
    };

}]);
*/

angular.module('gisApp').controller('loginController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            $scope.login = function () {

                // initial values
                $scope.error = false;
                $scope.disabled = true;

                // call login from service
                AuthService.login($scope.loginForm.username, $scope.loginForm.password)
                    // handle success
                    .then(function () {
                        $location.path('/mainPage');
                        $scope.disabled = false;
                        $scope.loginForm = {};
                    })
                    // handle error
                    .catch(function () {
                        $scope.error = true;
                        $scope.errorMessage = "Invalid username and/or password";
                        $scope.disabled = false;
                        $scope.loginForm = {};
                    });

            };

        }]);

angular.module('gisApp').controller('logoutController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            $scope.logout = function () {

                // call logout from service
                AuthService.logout()
                    .then(function () {
                        $location.path('/login');
                    });

            };

        }]);

angular.module('gisApp').controller('registerController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            $scope.register = function () {

                // initial values
                $scope.error = false;
                $scope.disabled = true;

                console.log('pass er: '+$scope.registerForm.password);
                console.log('rep pass er: '+$scope.registerForm.repeatedPassword);

                if(!($scope.registerForm.password === $scope.registerForm.repeatedPassword)){
                    console.log('not same passw');
                    $scope.error = true;
                    $scope.errorMessage = "Passwords do not match";
                    //$scope.disabled = false;
                    //$scope.registerForm = {};
                }

                // call register from service
                AuthService.register($scope.registerForm.username, $scope.registerForm.password)
                    // handle success
                    .then(function () {
                        $location.path('/mainPage');
                        $scope.disabled = false;
                        $scope.registerForm = {};
                    })
                    // handle error
                    .catch(function () {
                        $scope.error = true;
                        $scope.errorMessage = "Something went wrong!";
                        $scope.disabled = false;
                        $scope.registerForm = {};
                    });

            };

        }]);

