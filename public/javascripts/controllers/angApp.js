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
        //console.log('!!------ in angApp -----!!!');
        $routeProvider.
        when('/mainPage',{
            templateUrl: 'views/main-page.html',
            controller:"mapController",
            access: {restricted: false} //Fix later, just so update doesn't log out
        }).
        when('/views/welcome',{
            templateUrl: 'views/welcome.html',
            access: {restricted: false}

        }).
        when('/login',{
            templateUrl:'views/login.html',
            controller:'loginController',
            access: {restricted: false}
        }).
        when('/logout',{
            templateUrl:'views/welcome.html',
            controller: 'logoutController',
            access: {restricted: true}
        }).
        when('/register',{
            templateUrl:'views/register.html',
            controller:'registerController',
            access: {restricted: false}
        }).
        otherwise({
            redirectTo: '/views/welcome',
            access: {restricted: false}
        });
    }]);


gisApp.run(function ($rootScope, $location, $route, AuthService) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
            AuthService.getUserStatus();
            //console.log('acc restrict?: '+next.access.restricted);
            //console.log('logged in?: '+AuthService.isLoggedIn());

            if (next.access.restricted && !AuthService.isLoggedIn()) {
                $location.path('/login');
                $route.reload();
            }
        });
});


//USE for ordering layers by name:
//&scope.orderProp='name';

