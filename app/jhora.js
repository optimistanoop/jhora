const {shell} = require('electron')
const {dialog} = require('electron').remote

let jhora = angular.module('jhora', ['ngRoute', 'ngMaterial', 'ngMessages']);
jhora.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "index2.html"
    });
    //$locationProvider.hashPrefix('!');
    //$locationProvider.html5Mode({enabled: false, requireBase: false});
    //$locationProvider.html5Mode(true);
    // $locationProvider.html5Mode({
    //   enabled: true,
    //   requireBase: false
    // });
});
jhora.controller('jhoraCtrl', function($scope) {
  $scope.villages = ['Daniyari', 'Gadahia Mohan', 'Koindaha'];
  $scope.currentNavItem = '0';
  $scope.tabs = [{title:'Customer', content:'customer/customer.html'}, 
                 {title:'View Customer', content:'customer/customerView.html'},
                 {title:'Transection', content:'transection/transection.html'},
                 {title:'View Transection', content:'transection/transectionView.html'}
               ];
  $scope.template = $scope.tabs[0].content;
  $scope.goto = function(page) {
    $scope.template = $scope.tabs[page].content;
    $scope.closeNav();
  };
  
  $scope.openNav = ()=> {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
  };

  $scope.closeNav = ()=>{
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft= "0";
  };
               
});
// .config(function($mdThemingProvider) {
//   $mdThemingProvider.theme('docs-dark', 'default')
//     .primaryPalette('yellow')
//     .dark();
// 
// });
