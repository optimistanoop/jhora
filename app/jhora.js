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
  $scope.villages = ['Daniyari', 'Garhia Mohan', 'Koindha', 'Chhapra Dalrai', 'Garhia Pathak', 'Sivrajpur', 'Pipra Misra', 'Chaupathia', 'Tariya Sujan', 'Other'];
  $scope.currentNavItem = '0';
  $scope.navClosed = true;
  $scope.tabs = [
    {title:'Customer', content:'customer/customer.html'},
    {title:'Transection', content:'transection/transection.html'},
    {title:'View Customer', content:'customer/customerView.html'},
    {title:'View Transection', content:'transection/transectionView.html'}
  ];
  
  $scope.template = $scope.tabs[0];
  $scope.goto = function(page) {
    $scope.template = $scope.tabs[page];
    $scope.closeNav();
  };
  
  $scope.openNav = ()=> {
    if($scope.navClosed){
      document.getElementById("mySidenav").style.width = "250px";
      document.getElementById("main").style.marginLeft = "250px";
      $scope.navClosed = ! $scope.navClosed;
    }else{
      $scope.navClosed = ! $scope.navClosed;
      $scope.closeNav();
    }
  };

  $scope.closeNav = ()=>{
    document.getElementById("mySidenav").style.width = "0px";
    document.getElementById("main").style.marginLeft = "0px";
  };
               
});
// .config(function($mdThemingProvider) {
//   $mdThemingProvider.theme('docs-dark', 'default')
//     .primaryPalette('yellow')
//     .dark();
// 
// });
