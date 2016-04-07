
var gisControllers = angular.module('gisControllers',[]);

//Defining controller: ButtonController:
gisControllers.controller('ButtonController', function($scope){

    $scope.buttons = [
        {'name': 'Add Layer'},
        {'name': 'buffer'},
        {'name': 'intersection'}
    ];
});

//Can save dependencies in controller.$inject, or send in

gisControllers.controller("mapController", ["$scope", "$http", function($scope, $http){

    initMap();



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

