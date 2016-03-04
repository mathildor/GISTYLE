
/* Controllers:    */


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


gisControllers.controller('LayerController', ['$scope', '$http', function($scope, $http) {

    $http.get('layers.json').success(function(data){
        $scope.layers=data;
    })
}]);



gisControllers.controller("mapController", [ "$scope", "leafletData", function($scope, leafletData) {
    angular.extend($scope, {
        trd: {
            lat: 63.387523,
            lng: 10.39066,
            zoom: 11
        },
        defaults: {
            tileLayer: "http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png",
            zoomControlPosition: 'bottomright',
            tileLayerOptions: {
                opacity: 0.9,
                detectRetina: true,
                reuseTiles: true
            }
        }
    });

    $scope.fitBounds = function() {
        leafletData.getMap().then(function(map) {
            //map.fitBounds([ [40.712, -74.227], [40.774, -74.125] ]);
        });
    };

}]);


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
//var map = L.map('map').setView([51.505, -0.09], 13);

/*
gisControllers.controller('DetailController',['$scope', '$routeParams',
function($scope, $routeParams){
    //$scope.name=$routeParams.name;
}]);
    */