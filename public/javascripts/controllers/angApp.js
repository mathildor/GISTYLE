/**
 * Created by mathilde on 23/02/16.
 */



var gisApp = angular.module("gisApp", [
    //adding all dependencies:
    'ngRoute',
    'gisControllers'
]);


//Define what controllers to use here, not in html

gisApp.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/test', {
            templateUrl: 'views/test.html',
            controller: 'LayerController'
        }).
        when('/test2',{
            templateUrl: 'views/test2.html',
            controller:""
        }).
        when('/views/welcome',{
            templateUrl: 'views/welcome.html'

        }).
        when('/login',{ //Just for now, later changed to login page ofc
            templateUrl:'views/main-page.html'
        }).
        otherwise({
            redirectTo: '/views/welcome'
        });
    }]);




//USE for ordering layers by name:
//&scope.orderProp='name';

//Application routes are declared via the $routeProvider:
//ngRoute and cookies are depencedies of the module

/*gis.config(function($routeProvider) {
    $routeProvider
        .when('/sdkfasdf', {
            controller: '',
            templateUrl: '/views/mainPage-old.html'
        })
        .otherwise({ redirectTo: '../../../views/mainPage-old.html' });
});
*/

/*
gis.run(function ($rootScope, $location, $route, AuthService) {
    AuthService.getAuthStatus().then(function(){
        //Success
    }, function(){
        //Error, user is not authenticated
        $location.path('/login');
        $route.reload();
    });
});
*/

/*
gis.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            controller: 'fileController',
            templateUrl: '/views/file.html',
            access: {restricted: true}
        })
        .when('/file/:fileId', {
            controller: 'mapController',
            templateUrl: '/partials/map.html',
            access: {restricted: true}
        })
        .when('/login',{
            controller: 'loginController',
            templateUrl: '/partials/login.html',
            access: {restricted: false}
        })
        .when('/register', {
            templateUrl: 'partials/register.html',
            controller: 'registerController',
            access: {restricted: false}
        })
        .otherwise({ redirectTo: '/login' });
});
    */