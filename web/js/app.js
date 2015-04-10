angular.module('stars', ['ngRoute', 'ui.bootstrap', 'controllers', 'services']).config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/register', {'templateUrl': '/stars/web/html/register.html', 'controller': 'registerCtrl'});
    $routeProvider.when('/modify', {'templateUrl': '/stars/web/html/register.html', 'controller': 'registerCtrl'});
    $routeProvider.when('/list', {'templateUrl': '/stars/web/html/list.html', 'controller': 'listCtrl'});
    $routeProvider.when('/', {'redirectTo': 'register'});
}]);
angular.module('controllers', []);
angular.module('services', []);